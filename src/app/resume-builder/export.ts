import { Document, Packer, Paragraph, TextRun } from 'docx'
import { ResumeData, buildResumeText } from './templates'

// ── Shared download helper ───────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function fileBaseName(d: ResumeData): string {
  return (d.personal.name || 'resume').trim().replace(/\s+/g, '_').replace(/[^\w-]/g, '') || 'resume'
}

// ── Plain text (.txt) ─────────────────────────────────────────────────────────
// Reuses the same ATS-oriented plain-text layout already used for the word
// count / clipboard-copy / job-matching features, so all three stay in sync.

export function downloadTextResume(d: ResumeData) {
  const blob = new Blob([buildResumeText(d)], { type: 'text/plain;charset=utf-8' })
  triggerDownload(blob, `${fileBaseName(d)}.txt`)
}

// ── Word (.docx) ──────────────────────────────────────────────────────────────
// A real formatted resume, not a text dump: bold name header, colored section
// headings, real bullet lists, italic date/location lines -- single-column,
// standard font, no tables, so it stays ATS-parseable.

const ACCENT = '16a34a'
const MUTED = '6b7280'

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, color: ACCENT })],
    spacing: { before: 280, after: 120 },
  })
}

function bodyParagraph(text: string, opts: { after?: number } = {}): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: opts.after ?? 80 },
  })
}

function mutedLine(text: string, opts: { after?: number } = {}): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, size: 20, color: MUTED })],
    spacing: { after: opts.after ?? 100 },
  })
}

function bulletLine(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    bullet: { level: 0 },
    spacing: { after: 60 },
  })
}

function spacer(): Paragraph {
  return new Paragraph({ text: '', spacing: { after: 60 } })
}

export function buildResumeDocument(d: ResumeData): Document {
  const p = d.personal
  const children: Paragraph[] = []

  children.push(new Paragraph({
    children: [new TextRun({ text: p.name || 'Your Name', bold: true, size: 34 })],
    spacing: { after: 60 },
  }))

  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean)
  if (contactParts.length) {
    children.push(new Paragraph({
      children: [new TextRun({ text: contactParts.join('   |   '), size: 20, color: MUTED })],
      spacing: { after: p.visa ? 40 : 200 },
    }))
  }
  if (p.visa) {
    children.push(mutedLine(`Work Authorization: ${p.visa}`, { after: 200 }))
  }

  if (d.summary) {
    children.push(sectionHeading('SUMMARY'))
    children.push(bodyParagraph(d.summary, { after: 120 }))
  }

  if (d.experience.length) {
    children.push(sectionHeading('EXPERIENCE'))
    d.experience.forEach(e => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: e.title || '', bold: true, size: 22 }),
          ...(e.company ? [new TextRun({ text: `  —  ${e.company}${e.location ? `, ${e.location}` : ''}`, size: 22 })] : []),
        ],
        spacing: { before: 120, after: 20 },
      }))
      const dateStr = `${e.startDate}${(e.endDate || e.current) ? ` – ${e.current ? 'Present' : e.endDate}` : ''}`.trim()
      if (dateStr) children.push(mutedLine(dateStr))
      e.bullets.filter(Boolean).forEach(b => children.push(bulletLine(b)))
      children.push(spacer())
    })
  }

  if (d.education.length) {
    children.push(sectionHeading('EDUCATION'))
    d.education.forEach(e => {
      const degreeLine = [`${e.degree}${e.field ? ` in ${e.field}` : ''}`, e.school].filter(Boolean).join('  —  ')
      children.push(new Paragraph({
        children: [new TextRun({ text: degreeLine, bold: true, size: 22 })],
        spacing: { before: 120, after: 20 },
      }))
      const dateGpa = [`${e.startDate}${e.endDate ? ` – ${e.endDate}` : ''}`.trim(), e.gpa ? `GPA: ${e.gpa}` : ''].filter(Boolean).join('   |   ')
      if (dateGpa) children.push(mutedLine(dateGpa))
    })
  }

  const skillLines: [string, string][] = [
    ['Technical', d.skills.technical],
    ['Languages', d.skills.languages],
    ['Tools', d.skills.tools],
    ['Soft Skills', d.skills.soft],
  ].filter(([, v]) => Boolean(v)) as [string, string][]
  if (skillLines.length) {
    children.push(sectionHeading('SKILLS'))
    skillLines.forEach(([label, val]) => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 22 }),
          new TextRun({ text: val, size: 22 }),
        ],
        spacing: { after: 60 },
      }))
    })
  }

  if (d.projects.length) {
    children.push(sectionHeading('PROJECTS'))
    d.projects.forEach(proj => {
      const header = [proj.name, proj.tech].filter(Boolean).join('   |   ')
      children.push(new Paragraph({
        children: [
          new TextRun({ text: header, bold: true, size: 22 }),
          ...(proj.url ? [new TextRun({ text: `   ${proj.url}`, size: 20, color: ACCENT })] : []),
        ],
        spacing: { before: 120, after: 20 },
      }))
      proj.bullets.filter(Boolean).forEach(b => children.push(bulletLine(b)))
      children.push(spacer())
    })
  }

  if (d.certifications.length) {
    children.push(sectionHeading('CERTIFICATIONS'))
    d.certifications.forEach(c => {
      const line = [c.name, c.issuer, c.date ? `(${c.date})` : ''].filter(Boolean).join('  —  ')
      children.push(bodyParagraph(line, { after: 60 }))
    })
  }

  return new Document({
    styles: { default: { document: { run: { font: 'Calibri' } } } },
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
      children,
    }],
  })
}

export async function downloadDocxResume(d: ResumeData) {
  const doc = buildResumeDocument(d)
  const blob = await Packer.toBlob(doc)
  triggerDownload(blob, `${fileBaseName(d)}.docx`)
}
