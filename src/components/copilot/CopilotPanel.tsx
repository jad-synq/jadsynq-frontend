'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, X, Send, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useCopilotStore } from '@/lib/copilotStore'
import { streamCopilotChat, CopilotMessage } from '@/lib/copilot'
import { getResume } from '@/lib/api'

export default function CopilotPanel() {
  const { user } = useAuth()
  const { isOpen, jobContext, close } = useCopilotStore()
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [resumeText, setResumeText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Pull the user's saved resume once per open so the copilot can ground
  // its answers in it -- best-effort; the copilot still works generically
  // (per the backend's build_system_prompt fallback) if this 404s.
  useEffect(() => {
    if (!isOpen || !user) return
    getResume().then(res => setResumeText(res.data.resume_text || '')).catch(() => setResumeText(''))
  }, [isOpen, user])

  // Seed a contextual opening message when opened from a specific job card.
  useEffect(() => {
    if (isOpen && jobContext && messages.length === 0) {
      void send(`Can you explain my match for ${jobContext.title} at ${jobContext.company} and how I can improve it?`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, jobContext])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setError('')
    setSending(true)

    const history = [...messages, { role: 'user' as const, content: trimmed }]
    setMessages(history)
    setInput('')

    let assistantText = ''
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      await streamCopilotChat(
        history,
        {
          resume_text: resumeText || undefined,
          job: jobContext,
        },
        (delta) => {
          assistantText += delta
          setMessages(prev => {
            const next = [...prev]
            next[next.length - 1] = { role: 'assistant', content: assistantText }
            return next
          })
        },
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative w-full sm:w-[420px] h-full bg-paper-raised shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-ink text-sm leading-tight">Career Copilot</p>
              <p className="text-xs text-muted">Powered by Claude</p>
            </div>
          </div>
          <button onClick={close} className="p-2 text-muted hover:text-ink-soft rounded-lg hover:bg-paper transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <Sparkles className="w-8 h-8 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">
                Ask about your resume, a job match, or interview prep -- I can see your saved resume{jobContext ? ' and this job’s match details' : ''}.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap',
                m.role === 'user' ? 'bg-brand text-white' : 'bg-paper text-ink-soft'
              )}>
                {m.content || (sending && i === messages.length - 1 ? '…' : '')}
              </div>
            </div>
          ))}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-line">
          {!user ? (
            <p className="text-sm text-muted text-center">Sign in to use the Career Copilot.</p>
          ) : (
            <form
              onSubmit={e => { e.preventDefault(); void send(input) }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={sending}
                className="flex-1 px-3 py-2 text-sm border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="p-2.5 bg-brand hover:bg-brand-deep disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
