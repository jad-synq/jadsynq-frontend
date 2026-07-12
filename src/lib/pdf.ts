'use client'

interface PositionedWord { str: string; x: number }
interface PositionedLine { y: number; minX: number; words: PositionedWord[] }

function lineText(line: PositionedLine): string {
  return [...line.words].sort((a, b) => a.x - b.x).map(w => w.str).join(' ').trim()
}

// A page's text items are grouped into lines by Y-coordinate, but items were
// previously joined in whatever order pdf.js's content stream emitted them
// (not sorted by X) -- fine for most single-column PDFs where that happens
// to already be left-to-right, but for a 2-column resume (the same layout
// this app's own "Two-Column" template produces) it interleaves both
// columns' text into unreadable garbage. This detects a likely 2-column
// layout via the gap in lines' left-edge (minX) positions, and if found,
// emits the left column's lines top-to-bottom followed by the right
// column's, instead of merging both by absolute Y across the whole page.
// This is a heuristic (real column detection needs a layout engine), but
// it's a large improvement over unordered interleaving.
function orderPageLines(lines: PositionedLine[]): string[] {
  if (lines.length < 6) {
    return lines.sort((a, b) => b.y - a.y).map(lineText).filter(Boolean)
  }

  const minXs = [...lines.map(l => l.minX)].sort((a, b) => a - b)
  let maxGap = 0, gapIdx = -1
  for (let i = 1; i < minXs.length; i++) {
    const gap = minXs[i] - minXs[i - 1]
    if (gap > maxGap) { maxGap = gap; gapIdx = i }
  }
  // A real 2-column gutter spans most of a column's width -- on a standard
  // 612pt-wide page that's on the order of 150-300+ points between the two
  // columns' left edges. Ordinary bullet/sub-item indentation is typically
  // only 10-30pt, which an earlier version of this check (a threshold
  // relative to the *observed* min/max spread) mistook for a second column,
  // silently reordering a normal single-column resume's bullets to the end
  // of the document. Requiring an absolute minimum gap avoids that.
  const MIN_GUTTER_PT = 100
  const MIN_LINES_PER_SIDE = 3
  const isTwoColumn =
    gapIdx > 0 &&
    maxGap > MIN_GUTTER_PT &&
    gapIdx >= MIN_LINES_PER_SIDE &&
    (lines.length - gapIdx) >= MIN_LINES_PER_SIDE

  if (!isTwoColumn) {
    return lines.sort((a, b) => b.y - a.y).map(lineText).filter(Boolean)
  }

  const splitX = (minXs[gapIdx - 1] + minXs[gapIdx]) / 2
  const left = lines.filter(l => l.minX < splitX).sort((a, b) => b.y - a.y)
  const right = lines.filter(l => l.minX >= splitX).sort((a, b) => b.y - a.y)
  return [...left.map(lineText), ...right.map(lineText)].filter(Boolean)
}

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
    const lineMap = new Map<number, PositionedLine>()

    for (const item of content.items) {
      if (!('str' in item)) continue
      const transform = (item as { transform: number[] }).transform
      const x = transform[4]
      // Group words by vertical position (rounded to nearest 2px) to preserve line order
      const y = Math.round(transform[5] / 2) * 2
      let line = lineMap.get(y)
      if (!line) { line = { y, minX: x, words: [] }; lineMap.set(y, line) }
      line.minX = Math.min(line.minX, x)
      line.words.push({ str: item.str, x })
    }

    pageTexts.push(orderPageLines([...lineMap.values()]).join('\n'))
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
