// Streams a chat response from POST /api/copilot/chat (Server-Sent Events).
// Uses fetch()+ReadableStream directly rather than the shared axios client
// (src/lib/api.ts) since axios doesn't stream response bodies in the browser.

const API_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://jadsynq-backend.onrender.com'
    : 'http://localhost:8000')

export interface CopilotMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface CopilotJobContext {
  title: string
  company: string
  matched_keywords: string[]
  missing_keywords: string[]
}

export interface CopilotContext {
  resume_text?: string
  job?: CopilotJobContext
}

/** Streams the assistant's reply, calling onDelta for each text chunk as it
 * arrives. Resolves when the stream ends; throws on an HTTP error, a rate
 * limit, or an error event from the backend (e.g. an Anthropic API failure). */
export async function streamCopilotChat(
  messages: CopilotMessage[],
  context: CopilotContext,
  onDelta: (text: string) => void,
): Promise<void> {
  const { supabase } = await import('./supabase')
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${API_URL}/api/copilot/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages, context }),
  })

  if (!res.ok) {
    let detail = res.status === 429
      ? "You've reached today's copilot message limit. Try again tomorrow."
      : `Copilot request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.detail) detail = body.detail
    } catch { /* ignore -- use the default message above */ }
    throw new Error(detail)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('Streaming is not supported in this browser.')

  const decoder = new TextDecoder()
  let buffer = ''

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      if (!event.startsWith('data: ')) continue
      const payload = event.slice('data: '.length).trim()
      if (payload === '[DONE]') return

      const parsed = JSON.parse(payload) as { delta?: string; error?: string }
      if (parsed.error) throw new Error(parsed.error)
      if (parsed.delta) onDelta(parsed.delta)
    }
  }
}
