'use client'

/**
 * Extracts plain text from a PDF file entirely in the browser using pdf.js.
 * No server round-trip needed.
 */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')

  // Load worker from CDN to avoid Next.js bundling issues with the worker file
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

  const pageTexts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const lineMap = new Map<number, string[]>()

    for (const item of content.items) {
      if (!('str' in item)) continue
      // Group words by vertical position (rounded to nearest 2px) to preserve line order
      const y = Math.round((item as { transform: number[] }).transform[5] / 2) * 2
      if (!lineMap.has(y)) lineMap.set(y, [])
      lineMap.get(y)!.push(item.str)
    }

    // Sort lines top-to-bottom (higher y = higher on page in PDF coords)
    const lines = [...lineMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, words]) => words.join(' ').trim())
      .filter(Boolean)

    pageTexts.push(lines.join('\n'))
  }

  return pageTexts.join('\n\n').trim()
}

/**
 * Returns true if the file is a PDF based on extension or MIME type.
 */
export function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

/**
 * Read a file as plain text (for .txt files).
 */
export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve((e.target?.result as string) ?? '')
    reader.onerror = reject
    reader.readAsText(file)
  })
}

/**
 * Universal handler: extracts text from either a PDF or plain text file.
 */
export async function extractResumeText(file: File): Promise<string> {
  if (isPdf(file)) return extractPdfText(file)
  return readTextFile(file)
}
