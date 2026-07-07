import React from 'react'

// ── Shared types ──────────────────────────────────────────────────────────────

export interface Experience {
  id: string; company: string; title: string; location: string
  startDate: string; endDate: string; current: boolean; bullets: string[]
}
export interface Education {
  id: string; school: string; degree: string; field: string
  startDate: string; endDate: string; gpa: string
}
export interface Project {
  id: string; name: string; tech: string; url: string; bullets: string[]
}
export interface Certification {
  id: string; name: string; issuer: string; date: string
}
export interface ResumeData {
  personal: { name: string; email: string; phone: string; location: string; linkedin: string; website: string; visa: string }
  summary: string
  experience: Experience[]
  education: Education[]
  skills: { technical: string; languages: string; tools: string; soft: string }
  projects: Project[]
  certifications: Certification[]
}

export const BLANK: ResumeData = {
  personal: { name: '', email: '', phone: '', location: '', linkedin: '', website: '', visa: '' },
  summary: '',
  experience: [],
  education: [],
  skills: { technical: '', languages: '', tools: '', soft: '' },
  projects: [],
  certifications: [],
}

export type TemplateId = 'classic' | 'modern' | 'minimal' | 'twocol' | 'executive'

export interface TemplateInfo {
  id: TemplateId
  name: string
  description: string
  accent: string
}

export const TEMPLATES: TemplateInfo[] = [
  { id: 'classic',   name: 'Classic',   description: 'Timeless serif layout, centered header', accent: '#1a1a1a' },
  { id: 'modern',    name: 'Modern',    description: 'Green header bar, clean sans-serif',      accent: '#16a34a' },
  { id: 'minimal',   name: 'Minimal',   description: 'Ultra-clean, generous white space',       accent: '#6b7280' },
  { id: 'twocol',    name: 'Two-Column', description: 'Sidebar for skills & contact info',      accent: '#1e40af' },
  { id: 'executive', name: 'Executive', description: 'Bold accent border, formal style',        accent: '#7c3aed' },
]

// ── Resume text export (shared with ATS checker) ─────────────────────────────

export function buildResumeText(d: ResumeData): string {
  const lines: string[] = []
  const p = d.personal
  if (p.name) lines.push(p.name.toUpperCase())
  const cl = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean).join(' | ')
  if (cl) lines.push(cl)
  if (p.visa) lines.push(`Work Authorization: ${p.visa}`)
  lines.push('')
  if (d.summary) { lines.push('SUMMARY'); lines.push(d.summary); lines.push('') }
  if (d.experience.length) {
    lines.push('EXPERIENCE')
    d.experience.forEach(e => {
      lines.push(`${e.title} — ${e.company}${e.location ? `, ${e.location}` : ''}`)
      lines.push(`${e.startDate}${(e.endDate || e.current) ? ` – ${e.current ? 'Present' : e.endDate}` : ''}`)
      e.bullets.filter(Boolean).forEach(b => lines.push(`• ${b}`))
      lines.push('')
    })
  }
  if (d.education.length) {
    lines.push('EDUCATION')
    d.education.forEach(e => {
      lines.push(`${e.degree}${e.field ? ` in ${e.field}` : ''} — ${e.school}`)
      lines.push(`${e.startDate}${e.endDate ? ` – ${e.endDate}` : ''}${e.gpa ? `  |  GPA: ${e.gpa}` : ''}`)
      lines.push('')
    })
  }
  const skillLines = [
    d.skills.technical && `Technical: ${d.skills.technical}`,
    d.skills.languages && `Languages: ${d.skills.languages}`,
    d.skills.tools && `Tools: ${d.skills.tools}`,
    d.skills.soft && `Soft Skills: ${d.skills.soft}`,
  ].filter(Boolean)
  if (skillLines.length) { lines.push('SKILLS'); skillLines.forEach(s => lines.push(s!)); lines.push('') }
  if (d.projects.length) {
    lines.push('PROJECTS')
    d.projects.forEach(proj => {
      lines.push(`${proj.name}${proj.tech ? ` | ${proj.tech}` : ''}${proj.url ? `  ${proj.url}` : ''}`)
      proj.bullets.filter(Boolean).forEach(b => lines.push(`• ${b}`))
      lines.push('')
    })
  }
  if (d.certifications.length) {
    lines.push('CERTIFICATIONS')
    d.certifications.forEach(c => {
      lines.push(`${c.name}${c.issuer ? ` — ${c.issuer}` : ''}${c.date ? ` (${c.date})` : ''}`)
    })
  }
  return lines.join('\n')
}

// ── Resume auto-fill parser ───────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2) }

const SECTION_RE: Array<[keyof SectionMap, RegExp]> = [
  ['summary',        /^(SUMMARY|OBJECTIVE|PROFILE|ABOUT ME|PROFESSIONAL SUMMARY|CAREER SUMMARY|OVERVIEW)\s*$/i],
  ['experience',     /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT|WORK HISTORY|CAREER HISTORY|EMPLOYMENT HISTORY)\s*$/i],
  ['education',      /^(EDUCATION|ACADEMIC|DEGREES?|ACADEMIC BACKGROUND|QUALIFICATIONS?)\s*$/i],
  ['skills',         /^(SKILLS?|TECHNICAL SKILLS?|CORE COMPETENCIES|TECHNOLOGIES|TOOLS|PROFICIENCIES|KEY SKILLS|TECHNICAL EXPERTISE)\s*$/i],
  ['projects',       /^(PROJECTS?|PERSONAL PROJECTS?|SIDE PROJECTS?|PORTFOLIO|OPEN SOURCE)\s*$/i],
  ['certifications', /^(CERTIFICATIONS?|CERTIFICATES?|LICENSES?|CREDENTIALS?|AWARDS?|HONORS?|ACHIEVEMENTS?)\s*$/i],
]

interface SectionMap {
  header: string[]; summary: string[]; experience: string[]
  education: string[]; skills: string[]; projects: string[]; certifications: string[]
}

const DATE_RE = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)[\w\s,.]*\d{4}\b|\b\d{4}\s*[-–—]\s*(\d{4}|present|current|now)\b/i

function splitIntoEntries(lines: string[]): string[][] {
  const entries: string[][] = []
  let cur: string[] = []
  for (const line of lines) {
    if (line && DATE_RE.test(line) && cur.length > 0) {
      // Start of a new entry — but keep the date line in the current entry
      const dateIdx = cur.findIndex(l => DATE_RE.test(l))
      if (dateIdx === -1) {
        // Attach date to current chunk
        cur.push(line)
      } else {
        entries.push(cur)
        cur = [line]
      }
    } else {
      cur.push(line)
    }
  }
  if (cur.length) entries.push(cur)
  return entries.filter(e => e.some(Boolean))
}

function parseDates(lines: string[]): { startDate: string; endDate: string; current: boolean } {
  for (const line of lines) {
    const m = line.match(/([A-Za-z]+\.?\s*\d{4}|\d{4})\s*[-–—]\s*(([A-Za-z]+\.?\s*\d{4}|\d{4})|(present|current|now))/i)
    if (m) {
      const current = /present|current|now/i.test(m[4] ?? '')
      return {
        startDate: m[1]?.trim() ?? '',
        endDate: current ? '' : (m[3]?.trim() ?? ''),
        current,
      }
    }
  }
  return { startDate: '', endDate: '', current: false }
}

export function parseResumeText(raw: string): Partial<ResumeData> {
  const lines = raw.split('\n').map(l => l.trim())

  // ── Contact extraction ──
  const emailMatch  = raw.match(/[\w.+\-]+@[\w\-]+\.[a-z]{2,}/i)
  const phoneMatch  = raw.match(/\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/)
  const linkedinMatch = raw.match(/linkedin\.com\/in\/([\w\-]+)/i)
  const githubMatch = raw.match(/github\.com\/([\w.\-]+)/i)
  const websiteMatch = raw.match(/https?:\/\/(?!linkedin|github)([\w.\-/]+)/i)

  // Location: "City, ST" or "City, State"
  const locationMatch = raw.match(/\b([A-Z][a-zA-Z\s]+,\s*(?:[A-Z]{2}|[A-Z][a-z]+ ?[A-Z]?[a-z]*))\b/)

  // Name: first non-contact line in the top 10 lines, short, looks like a name
  const contactChars = /[@\d()·|•\/\\]|linkedin|github|http/i
  let name = ''
  for (const line of lines.slice(0, 10)) {
    const words = line.trim().split(/\s+/)
    if (line.trim() && !contactChars.test(line) && words.length >= 2 && words.length <= 5 &&
        words.every(w => /^[A-Za-z.\-']+$/.test(w))) {
      name = line.trim()
      break
    }
  }

  // ── Section splitting ──
  const sections: SectionMap = {
    header: [], summary: [], experience: [], education: [],
    skills: [], projects: [], certifications: [],
  }
  let current: keyof SectionMap = 'header'
  for (const line of lines) {
    let matched = false
    for (const [key, re] of SECTION_RE) {
      if (re.test(line.trim())) { current = key; matched = true; break }
    }
    if (!matched) sections[current].push(line)
  }

  // ── Summary ──
  const summary = sections.summary.filter(Boolean).join(' ').trim()

  // ── Skills ──
  const skillText = sections.skills.filter(Boolean)
    .map(l => l.replace(/^(technical|languages?|tools?|soft skills?|frameworks?|platforms?|proficiencies?)\s*:?\s*/i, ''))
    .join(', ')

  // ── Experience ──
  const experience: Experience[] = []
  const expBlocks = splitIntoEntries(sections.experience.filter(l => l !== undefined))
  for (const block of expBlocks) {
    const nonEmpty = block.filter(Boolean)
    if (!nonEmpty.length) continue
    const { startDate, endDate, current: cur } = parseDates(nonEmpty)
    const dateIdx = nonEmpty.findIndex(l => DATE_RE.test(l))

    // Lines before date line are title / company / location
    const headerLines = dateIdx >= 0 ? nonEmpty.slice(0, dateIdx) : nonEmpty.slice(0, 2)
    const afterDate   = dateIdx >= 0 ? nonEmpty.slice(dateIdx + 1) : nonEmpty.slice(2)

    // Title is first header line, company is second (or parse "Title — Company" / "Title | Company")
    let title = '', company = '', location = ''
    if (headerLines[0]) {
      const sep = headerLines[0].match(/^(.+?)\s*[|·—@]\s*(.+)$/)
      if (sep) { title = sep[1].trim(); company = sep[2].trim() }
      else title = headerLines[0]
    }
    if (!company && headerLines[1]) {
      const sep2 = headerLines[1].match(/^(.+?)\s*[|·,]\s*(.+)$/)
      if (sep2) { company = sep2[1].trim(); location = sep2[2].trim() }
      else company = headerLines[1]
    }

    const bullets = afterDate
      .map(l => l.replace(/^[•\-–*]\s*/, ''))
      .filter(Boolean)

    experience.push({ id: uid(), title, company, location, startDate, endDate, current: cur, bullets: bullets.length ? bullets : [''] })
  }

  // ── Education ──
  const education: Education[] = []
  const eduBlocks = splitIntoEntries(sections.education.filter(l => l !== undefined))
  for (const block of eduBlocks) {
    const nonEmpty = block.filter(Boolean)
    if (!nonEmpty.length) continue
    const { startDate, endDate } = parseDates(nonEmpty)
    const dateIdx = nonEmpty.findIndex(l => DATE_RE.test(l))
    const headerLines = dateIdx >= 0 ? nonEmpty.slice(0, dateIdx) : nonEmpty.slice(0, 2)

    let school = '', degree = '', field = '', gpa = ''
    const gpaMatch = block.join(' ').match(/GPA[:\s]+([0-9.]+)/i)
    if (gpaMatch) gpa = gpaMatch[1]

    if (headerLines[0]) {
      // "Master of Science in Computer Science — MIT"
      const sep = headerLines[0].match(/^(.+?)\s*[-–—|]\s*(.+)$/)
      if (sep) {
        const inMatch = sep[1].match(/^(.+?)\s+in\s+(.+)$/i)
        if (inMatch) { degree = inMatch[1].trim(); field = inMatch[2].trim() }
        else degree = sep[1].trim()
        school = sep[2].trim()
      } else {
        degree = headerLines[0]
      }
    }
    if (!school && headerLines[1]) school = headerLines[1]

    education.push({ id: uid(), school, degree, field, startDate, endDate, gpa })
  }

  // ── Projects ──
  const projects: Project[] = []
  const projBlocks = splitIntoEntries(sections.projects.filter(l => l !== undefined))
  for (const block of projBlocks) {
    const nonEmpty = block.filter(Boolean)
    if (!nonEmpty.length) continue

    let name = '', tech = '', url = ''
    const firstLine = nonEmpty[0]
    const urlInBlock = block.join(' ').match(/https?:\/\/[\w./\-]+/i)
    if (urlInBlock) url = urlInBlock[0]

    const techSep = firstLine.match(/^(.+?)\s*[|·—]\s*(.+)$/)
    if (techSep) { name = techSep[1].trim(); tech = techSep[2].trim() }
    else name = firstLine

    const bullets = nonEmpty.slice(1)
      .filter(l => !l.match(/^https?:\/\//i))
      .map(l => l.replace(/^[•\-–*]\s*/, ''))
      .filter(Boolean)

    projects.push({ id: uid(), name, tech, url, bullets: bullets.length ? bullets : [''] })
  }

  // ── Certifications ──
  const certifications: Certification[] = []
  for (const line of sections.certifications.filter(Boolean)) {
    if (!line) continue
    const dateM = line.match(/\b(\d{4})\b/)
    const issuerM = line.match(/[-–—|]\s*(.+?)(?:\s+\d{4})?$/)
    const cleanName = line.replace(/\s*[-–—|]\s*.+$/, '').replace(/\s*\d{4}.*$/, '').trim()
    if (cleanName) {
      certifications.push({
        id: uid(),
        name: cleanName,
        issuer: issuerM ? issuerM[1].trim() : '',
        date: dateM ? dateM[1] : '',
      })
    }
  }

  return {
    personal: {
      name,
      email:    emailMatch?.[0] ?? '',
      phone:    phoneMatch?.[0] ?? '',
      location: locationMatch?.[1] ?? '',
      linkedin: linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : '',
      website:  githubMatch ? `github.com/${githubMatch[1]}` : (websiteMatch?.[0] ?? ''),
      visa: '',
    },
    summary,
    experience,
    education,
    skills: { technical: skillText, languages: '', tools: '', soft: '' },
    projects,
    certifications,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function contactLine(p: ResumeData['personal']) {
  return [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean)
}

function dateRange(start: string, end: string, current: boolean) {
  if (!start && !end) return ''
  return `${start}${(end || current) ? ` – ${current ? 'Present' : end}` : ''}`
}

function BulletList({ items }: { items: string[] }) {
  const filled = items.filter(Boolean)
  if (!filled.length) return null
  return (
    <ul className="mt-1 space-y-0.5">
      {filled.map((b, i) => (
        <li key={i} className="flex gap-2"><span className="shrink-0">•</span><span>{b}</span></li>
      ))}
    </ul>
  )
}

// ── Template Thumbnail SVGs ────────────────────────────────────────────────────

export function ClassicThumb() {
  return (
    <svg viewBox="0 0 160 200" className="w-full h-full">
      <rect width="160" height="200" fill="white" />
      <rect x="30" y="14" width="100" height="8" rx="2" fill="#1a1a1a" />
      <rect x="45" y="26" width="70" height="4" rx="1" fill="#9ca3af" />
      <rect x="10" y="38" width="140" height="1" fill="#d1d5db" />
      <rect x="10" y="44" width="40" height="4" rx="1" fill="#1a1a1a" />
      {[54,62,70,78].map(y => <rect key={y} x="14" y={y} width="120" height="3" rx="1" fill="#e5e7eb" />)}
      <rect x="10" y="90" width="40" height="4" rx="1" fill="#1a1a1a" />
      {[100,108,116].map(y => <rect key={y} x="14" y={y} width="110" height="3" rx="1" fill="#e5e7eb" />)}
      <rect x="10" y="130" width="40" height="4" rx="1" fill="#1a1a1a" />
      {[140,148,156].map(y => <rect key={y} x="14" y={y} width="100" height="3" rx="1" fill="#e5e7eb" />)}
    </svg>
  )
}

export function ModernThumb() {
  return (
    <svg viewBox="0 0 160 200" className="w-full h-full">
      <rect width="160" height="200" fill="white" />
      <rect width="160" height="50" fill="#16a34a" />
      <rect x="12" y="14" width="80" height="9" rx="2" fill="white" />
      <rect x="12" y="27" width="100" height="4" rx="1" fill="#bbf7d0" />
      <rect x="12" y="35" width="70" height="4" rx="1" fill="#bbf7d0" />
      <rect x="12" y="58" width="36" height="4" rx="1" fill="#16a34a" />
      <rect x="12" y="66" width="2" height="40" fill="#16a34a" />
      {[66,74,82,90].map(y => <rect key={y} x="18" y={y} width="120" height="3" rx="1" fill="#e5e7eb" />)}
      <rect x="12" y="114" width="36" height="4" rx="1" fill="#16a34a" />
      {[122,130,138].map(y => <rect key={y} x="12" y={y} width="130" height="3" rx="1" fill="#e5e7eb" />)}
      <rect x="12" y="152" width="36" height="4" rx="1" fill="#16a34a" />
      {[160,168].map(y => <rect key={y} x="12" y={y} width="110" height="3" rx="1" fill="#e5e7eb" />)}
    </svg>
  )
}

export function MinimalThumb() {
  return (
    <svg viewBox="0 0 160 200" className="w-full h-full">
      <rect width="160" height="200" fill="#fafafa" />
      <rect x="14" y="16" width="90" height="9" rx="1" fill="#111" />
      <rect x="14" y="30" width="120" height="3" rx="1" fill="#d1d5db" />
      <rect x="14" y="46" width="30" height="3" rx="1" fill="#6b7280" />
      {[54,60,66,72].map(y => <rect key={y} x="14" y={y} width="128" height="2.5" rx="1" fill="#e5e7eb" />)}
      <rect x="14" y="84" width="30" height="3" rx="1" fill="#6b7280" />
      {[92,98,104].map(y => <rect key={y} x="14" y={y} width="120" height="2.5" rx="1" fill="#e5e7eb" />)}
      <rect x="14" y="118" width="30" height="3" rx="1" fill="#6b7280" />
      {[126,132,138].map(y => <rect key={y} x="14" y={y} width="110" height="2.5" rx="1" fill="#e5e7eb" />)}
      <rect x="14" y="152" width="30" height="3" rx="1" fill="#6b7280" />
      {[160,166].map(y => <rect key={y} x="14" y={y} width="100" height="2.5" rx="1" fill="#e5e7eb" />)}
    </svg>
  )
}

export function TwoColThumb() {
  return (
    <svg viewBox="0 0 160 200" className="w-full h-full">
      <rect width="160" height="200" fill="white" />
      <rect width="50" height="200" fill="#1e3a5f" />
      <rect x="6" y="14" width="38" height="8" rx="1" fill="white" />
      <rect x="6" y="26" width="38" height="3" rx="1" fill="#93c5fd" />
      <rect x="6" y="44" width="25" height="3" rx="1" fill="#93c5fd" />
      {[52,58,64,70].map(y => <rect key={y} x="6" y={y} width="38" height="2.5" rx="1" fill="#1e40af" opacity="0.4" />)}
      <rect x="6" y="84" width="25" height="3" rx="1" fill="#93c5fd" />
      {[92,98,104,110].map(y => <rect key={y} x="6" y={y} width="38" height="2.5" rx="1" fill="#1e40af" opacity="0.4" />)}
      <rect x="60" y="14" width="50" height="5" rx="1" fill="#1e3a5f" />
      {[24,30,36,42].map(y => <rect key={y} x="60" y={y} width="90" height="3" rx="1" fill="#e5e7eb" />)}
      <rect x="60" y="54" width="50" height="5" rx="1" fill="#1e3a5f" />
      {[64,70,76,82,88].map(y => <rect key={y} x="60" y={y} width="88" height="2.5" rx="1" fill="#e5e7eb" />)}
      <rect x="60" y="100" width="50" height="5" rx="1" fill="#1e3a5f" />
      {[110,116,122].map(y => <rect key={y} x="60" y={y} width="80" height="2.5" rx="1" fill="#e5e7eb" />)}
    </svg>
  )
}

export function ExecutiveThumb() {
  return (
    <svg viewBox="0 0 160 200" className="w-full h-full">
      <rect width="160" height="200" fill="white" />
      <rect width="5" height="200" fill="#7c3aed" />
      <rect x="12" y="14" width="100" height="10" rx="1" fill="#1a1a1a" />
      <rect x="12" y="28" width="120" height="3" rx="1" fill="#d1d5db" />
      <rect x="12" y="35" width="80" height="3" rx="1" fill="#d1d5db" />
      <rect x="12" y="48" width="3" height="3" fill="#7c3aed" />
      <rect x="20" y="49" width="40" height="3" rx="1" fill="#4c1d95" />
      {[58,65,72,79].map(y => <rect key={y} x="12" y={y} width="130" height="2.5" rx="1" fill="#e5e7eb" />)}
      <rect x="12" y="92" width="3" height="3" fill="#7c3aed" />
      <rect x="20" y="93" width="40" height="3" rx="1" fill="#4c1d95" />
      {[102,109,116].map(y => <rect key={y} x="12" y={y} width="120" height="2.5" rx="1" fill="#e5e7eb" />)}
      <rect x="12" y="130" width="3" height="3" fill="#7c3aed" />
      <rect x="20" y="131" width="40" height="3" rx="1" fill="#4c1d95" />
      {[140,147,154,161].map(y => <rect key={y} x="12" y={y} width="110" height="2.5" rx="1" fill="#e5e7eb" />)}
    </svg>
  )
}

export const THUMBS: Record<TemplateId, React.FC> = {
  classic: ClassicThumb,
  modern: ModernThumb,
  minimal: MinimalThumb,
  twocol: TwoColThumb,
  executive: ExecutiveThumb,
}

// ── Template 1: Classic ───────────────────────────────────────────────────────

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const p = data.personal
  const contact = contactLine(p)
  return (
    <div className="bg-white text-gray-900 p-8 min-h-full" style={{ fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.4 }}>
      {p.name && (
        <div className="text-center mb-4 pb-3 border-b-2 border-gray-800">
          <h1 className="text-2xl font-bold tracking-widest uppercase">{p.name}</h1>
          {contact.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{contact.join('  ·  ')}</p>
          )}
          {p.visa && <p className="text-xs text-gray-400 mt-0.5">Work Auth: {p.visa}</p>}
        </div>
      )}
      {data.summary && <ClassicSection title="Summary"><p className="text-gray-700">{data.summary}</p></ClassicSection>}
      {data.experience.length > 0 && (
        <ClassicSection title="Experience">
          {data.experience.map(e => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <span><strong>{e.title}</strong>{e.company && <span className="text-gray-600"> — {e.company}</span>}{e.location && <span className="text-gray-400">, {e.location}</span>}</span>
                <span className="text-xs text-gray-500 shrink-0 ml-2">{dateRange(e.startDate, e.endDate, e.current)}</span>
              </div>
              <BulletList items={e.bullets} />
            </div>
          ))}
        </ClassicSection>
      )}
      {data.education.length > 0 && (
        <ClassicSection title="Education">
          {data.education.map(e => (
            <div key={e.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <span><strong>{e.degree}{e.field ? ` in ${e.field}` : ''}</strong>{e.school && <span className="text-gray-600"> — {e.school}</span>}</span>
                <span className="text-xs text-gray-500 shrink-0 ml-2">{dateRange(e.startDate, e.endDate, false)}</span>
              </div>
              {e.gpa && <p className="text-xs text-gray-500">GPA: {e.gpa}</p>}
            </div>
          ))}
        </ClassicSection>
      )}
      <SkillsSection data={data} sectionClass="ClassicSection" renderSection={(t, c) => <ClassicSection title={t}>{c}</ClassicSection>} />
      {data.projects.length > 0 && (
        <ClassicSection title="Projects">
          {data.projects.map(proj => (
            <div key={proj.id} className="mb-2">
              <span><strong>{proj.name}</strong>{proj.tech && <span className="text-gray-500 text-xs"> | {proj.tech}</span>}{proj.url && <span className="text-xs text-blue-600"> {proj.url}</span>}</span>
              <BulletList items={proj.bullets} />
            </div>
          ))}
        </ClassicSection>
      )}
      {data.certifications.length > 0 && (
        <ClassicSection title="Certifications">
          {data.certifications.map(c => (
            <p key={c.id}><strong>{c.name}</strong>{c.issuer && ` — ${c.issuer}`}{c.date && ` (${c.date})`}</p>
          ))}
        </ClassicSection>
      )}
    </div>
  )
}

function ClassicSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-400 pb-0.5 mb-2 text-gray-800">{title}</h2>
      <div className="text-sm">{children}</div>
    </div>
  )
}

// ── Template 2: Modern ────────────────────────────────────────────────────────

export function ModernTemplate({ data }: { data: ResumeData }) {
  const p = data.personal
  const contact = contactLine(p)
  return (
    <div className="bg-white text-gray-900 min-h-full" style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13 }}>
      {/* Green header */}
      <div className="bg-[#16a34a] text-white px-8 py-6">
        {p.name && <h1 className="text-2xl font-black tracking-wide">{p.name}</h1>}
        {contact.length > 0 && <p className="text-xs text-green-100 mt-1">{contact.join('  ·  ')}</p>}
        {p.visa && <p className="text-xs text-green-200 mt-0.5">Work Auth: {p.visa}</p>}
      </div>
      <div className="px-8 py-5">
        {data.summary && <ModernSection title="About"><p className="text-gray-600 leading-relaxed">{data.summary}</p></ModernSection>}
        {data.experience.length > 0 && (
          <ModernSection title="Experience">
            {data.experience.map(e => (
              <div key={e.id} className="mb-4 pl-3 border-l-2 border-[#16a34a]">
                <div className="flex justify-between items-start">
                  <div><p className="font-bold text-gray-900">{e.title}</p><p className="text-[#16a34a] text-xs font-semibold">{e.company}{e.location && ` · ${e.location}`}</p></div>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">{dateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                <BulletList items={e.bullets} />
              </div>
            ))}
          </ModernSection>
        )}
        {data.education.length > 0 && (
          <ModernSection title="Education">
            {data.education.map(e => (
              <div key={e.id} className="mb-2 pl-3 border-l-2 border-[#16a34a]">
                <div className="flex justify-between items-start">
                  <div><p className="font-bold">{e.degree}{e.field ? ` in ${e.field}` : ''}</p><p className="text-[#16a34a] text-xs font-semibold">{e.school}</p></div>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">{dateRange(e.startDate, e.endDate, false)}</span>
                </div>
                {e.gpa && <p className="text-xs text-gray-500">GPA: {e.gpa}</p>}
              </div>
            ))}
          </ModernSection>
        )}
        <SkillsSection data={data} sectionClass="ModernSection" renderSection={(t, c) => <ModernSection title={t}>{c}</ModernSection>} />
        {data.projects.length > 0 && (
          <ModernSection title="Projects">
            {data.projects.map(proj => (
              <div key={proj.id} className="mb-2 pl-3 border-l-2 border-[#16a34a]">
                <p className="font-bold">{proj.name}{proj.tech && <span className="text-xs font-normal text-gray-500 ml-2">{proj.tech}</span>}</p>
                {proj.url && <p className="text-xs text-blue-600">{proj.url}</p>}
                <BulletList items={proj.bullets} />
              </div>
            ))}
          </ModernSection>
        )}
        {data.certifications.length > 0 && (
          <ModernSection title="Certifications">
            {data.certifications.map(c => (
              <p key={c.id}><strong>{c.name}</strong>{c.issuer && ` — ${c.issuer}`}{c.date && ` (${c.date})`}</p>
            ))}
          </ModernSection>
        )}
      </div>
    </div>
  )
}

function ModernSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-black uppercase tracking-widest text-[#16a34a] mb-2">{title}</h2>
      <div className="text-sm">{children}</div>
    </div>
  )
}

// ── Template 3: Minimal ───────────────────────────────────────────────────────

export function MinimalTemplate({ data }: { data: ResumeData }) {
  const p = data.personal
  const contact = contactLine(p)
  return (
    <div className="bg-[#fafafa] text-gray-800 p-10 min-h-full" style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: 13, lineHeight: 1.6 }}>
      {p.name && (
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-tight text-gray-900">{p.name}</h1>
          {contact.length > 0 && <p className="text-xs text-gray-400 mt-1">{contact.join('   ')}</p>}
          {p.visa && <p className="text-xs text-gray-400">{p.visa}</p>}
        </div>
      )}
      {data.summary && <MinSection title="Profile"><p className="text-gray-500 leading-relaxed">{data.summary}</p></MinSection>}
      {data.experience.length > 0 && (
        <MinSection title="Experience">
          {data.experience.map(e => (
            <div key={e.id} className="mb-5">
              <div className="flex justify-between items-baseline mb-0.5">
                <p className="font-semibold text-gray-900">{e.title}</p>
                <span className="text-xs text-gray-400">{dateRange(e.startDate, e.endDate, e.current)}</span>
              </div>
              <p className="text-xs text-gray-400">{e.company}{e.location && ` · ${e.location}`}</p>
              <BulletList items={e.bullets} />
            </div>
          ))}
        </MinSection>
      )}
      {data.education.length > 0 && (
        <MinSection title="Education">
          {data.education.map(e => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <p className="font-semibold">{e.degree}{e.field ? ` in ${e.field}` : ''}</p>
                <span className="text-xs text-gray-400">{dateRange(e.startDate, e.endDate, false)}</span>
              </div>
              <p className="text-xs text-gray-400">{e.school}{e.gpa && ` · GPA ${e.gpa}`}</p>
            </div>
          ))}
        </MinSection>
      )}
      <SkillsSection data={data} sectionClass="MinSection" renderSection={(t, c) => <MinSection title={t}>{c}</MinSection>} />
      {data.projects.length > 0 && (
        <MinSection title="Projects">
          {data.projects.map(proj => (
            <div key={proj.id} className="mb-3">
              <p className="font-semibold">{proj.name}{proj.tech && <span className="font-normal text-gray-400 text-xs"> / {proj.tech}</span>}</p>
              {proj.url && <p className="text-xs text-gray-400">{proj.url}</p>}
              <BulletList items={proj.bullets} />
            </div>
          ))}
        </MinSection>
      )}
    </div>
  )
}

function MinSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium mb-3">{title}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

// ── Template 4: Two-Column ────────────────────────────────────────────────────

export function TwoColTemplate({ data }: { data: ResumeData }) {
  const p = data.personal
  const skillRows = [
    data.skills.technical && { label: 'Technical', value: data.skills.technical },
    data.skills.languages && { label: 'Languages', value: data.skills.languages },
    data.skills.tools && { label: 'Tools', value: data.skills.tools },
    data.skills.soft && { label: 'Soft', value: data.skills.soft },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="bg-white text-gray-900 min-h-full flex" style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12 }}>
      {/* Left sidebar */}
      <div className="w-44 bg-[#1e3a5f] text-white shrink-0 p-5 flex flex-col gap-5">
        {p.name && (
          <div>
            <h1 className="text-sm font-black leading-tight">{p.name}</h1>
            {p.visa && <p className="text-[10px] text-blue-200 mt-1">{p.visa}</p>}
          </div>
        )}
        <SideBlock title="Contact">
          {[p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean).map((v, i) => (
            <p key={i} className="text-[10px] text-blue-100 break-all leading-relaxed">{v}</p>
          ))}
        </SideBlock>
        {skillRows.length > 0 && (
          <SideBlock title="Skills">
            {skillRows.map(s => (
              <div key={s.label} className="mb-1.5">
                <p className="text-[9px] uppercase tracking-wide text-blue-300 font-bold">{s.label}</p>
                <p className="text-[10px] text-blue-100">{s.value}</p>
              </div>
            ))}
          </SideBlock>
        )}
        {data.education.length > 0 && (
          <SideBlock title="Education">
            {data.education.map(e => (
              <div key={e.id} className="mb-2">
                <p className="text-[10px] font-semibold">{e.degree}{e.field ? ` in ${e.field}` : ''}</p>
                <p className="text-[10px] text-blue-200">{e.school}</p>
                <p className="text-[9px] text-blue-300">{dateRange(e.startDate, e.endDate, false)}{e.gpa && ` · GPA ${e.gpa}`}</p>
              </div>
            ))}
          </SideBlock>
        )}
        {data.certifications.length > 0 && (
          <SideBlock title="Certs">
            {data.certifications.map(c => (
              <div key={c.id} className="mb-1">
                <p className="text-[10px] font-semibold">{c.name}</p>
                {c.issuer && <p className="text-[9px] text-blue-300">{c.issuer}{c.date && ` · ${c.date}`}</p>}
              </div>
            ))}
          </SideBlock>
        )}
      </div>

      {/* Right content */}
      <div className="flex-1 p-6">
        {data.summary && (
          <ColSection title="Summary">
            <p className="text-gray-600 leading-relaxed">{data.summary}</p>
          </ColSection>
        )}
        {data.experience.length > 0 && (
          <ColSection title="Experience">
            {data.experience.map(e => (
              <div key={e.id} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold text-gray-900 text-sm">{e.title}</p>
                  <span className="text-[10px] text-gray-400 shrink-0 ml-2">{dateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                <p className="text-[11px] text-[#1e40af] font-semibold">{e.company}{e.location && ` · ${e.location}`}</p>
                <BulletList items={e.bullets} />
              </div>
            ))}
          </ColSection>
        )}
        {data.projects.length > 0 && (
          <ColSection title="Projects">
            {data.projects.map(proj => (
              <div key={proj.id} className="mb-3">
                <p className="font-bold text-sm">{proj.name}{proj.tech && <span className="text-[10px] font-normal text-gray-400 ml-2">{proj.tech}</span>}</p>
                {proj.url && <p className="text-[10px] text-blue-600">{proj.url}</p>}
                <BulletList items={proj.bullets} />
              </div>
            ))}
          </ColSection>
        )}
      </div>
    </div>
  )
}

function SideBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest text-blue-300 font-bold mb-1.5 border-b border-blue-700 pb-1">{title}</p>
      {children}
    </div>
  )
}

function ColSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-xs font-black uppercase tracking-widest text-[#1e3a5f] border-b-2 border-[#1e3a5f] pb-0.5 mb-2">{title}</h2>
      <div className="text-sm">{children}</div>
    </div>
  )
}

// ── Template 5: Executive ─────────────────────────────────────────────────────

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const p = data.personal
  const contact = contactLine(p)
  return (
    <div className="bg-white text-gray-900 min-h-full flex" style={{ fontFamily: 'Georgia, serif', fontSize: 13 }}>
      {/* Purple left border */}
      <div className="w-1.5 bg-[#7c3aed] shrink-0" />
      <div className="flex-1 px-7 py-7">
        {p.name && (
          <div className="mb-5 pb-4 border-b-2 border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{p.name}</h1>
            {contact.length > 0 && <p className="text-xs text-gray-500 mt-1">{contact.join('  ·  ')}</p>}
            {p.visa && <p className="text-xs text-gray-400 mt-0.5">{p.visa}</p>}
          </div>
        )}
        {data.summary && <ExecSection title="Executive Summary"><p className="text-gray-600 leading-relaxed">{data.summary}</p></ExecSection>}
        {data.experience.length > 0 && (
          <ExecSection title="Professional Experience">
            {data.experience.map(e => (
              <div key={e.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{e.title}</p>
                    <p className="text-[#7c3aed] text-xs font-semibold">{e.company}{e.location && ` · ${e.location}`}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-2 bg-gray-50 px-2 py-0.5 rounded">{dateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                <BulletList items={e.bullets} />
              </div>
            ))}
          </ExecSection>
        )}
        {data.education.length > 0 && (
          <ExecSection title="Education">
            {data.education.map(e => (
              <div key={e.id} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <p className="font-bold">{e.degree}{e.field ? ` in ${e.field}` : ''}</p>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">{dateRange(e.startDate, e.endDate, false)}</span>
                </div>
                <p className="text-[#7c3aed] text-xs font-semibold">{e.school}{e.gpa && ` · GPA ${e.gpa}`}</p>
              </div>
            ))}
          </ExecSection>
        )}
        <SkillsSection data={data} sectionClass="ExecSection" renderSection={(t, c) => <ExecSection title={t}>{c}</ExecSection>} />
        {data.projects.length > 0 && (
          <ExecSection title="Notable Projects">
            {data.projects.map(proj => (
              <div key={proj.id} className="mb-3">
                <p className="font-bold">{proj.name}{proj.tech && <span className="font-normal text-gray-500 text-xs ml-2">({proj.tech})</span>}</p>
                {proj.url && <p className="text-xs text-blue-600">{proj.url}</p>}
                <BulletList items={proj.bullets} />
              </div>
            ))}
          </ExecSection>
        )}
        {data.certifications.length > 0 && (
          <ExecSection title="Certifications & Awards">
            {data.certifications.map(c => (
              <p key={c.id}><strong>{c.name}</strong>{c.issuer && ` — ${c.issuer}`}{c.date && ` (${c.date})`}</p>
            ))}
          </ExecSection>
        )}
      </div>
    </div>
  )
}

function ExecSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-sm bg-[#7c3aed]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-700">{title}</h2>
      </div>
      <div className="text-sm pl-4">{children}</div>
    </div>
  )
}

// ── Shared skills renderer ────────────────────────────────────────────────────

function SkillsSection({ data, renderSection }: {
  data: ResumeData
  sectionClass: string
  renderSection: (title: string, children: React.ReactNode) => React.ReactNode
}) {
  const { technical, languages, tools, soft } = data.skills
  if (!technical && !languages && !tools && !soft) return null
  return renderSection('Skills',
    <div className="space-y-0.5">
      {technical && <p><strong>Technical:</strong> {technical}</p>}
      {languages && <p><strong>Languages:</strong> {languages}</p>}
      {tools && <p><strong>Tools:</strong> {tools}</p>}
      {soft && <p><strong>Soft Skills:</strong> {soft}</p>}
    </div>
  )
}

// ── Template renderer map ─────────────────────────────────────────────────────

export const TEMPLATE_COMPONENTS: Record<TemplateId, React.FC<{ data: ResumeData }>> = {
  classic:   ClassicTemplate,
  modern:    ModernTemplate,
  minimal:   MinimalTemplate,
  twocol:    TwoColTemplate,
  executive: ExecutiveTemplate,
}
