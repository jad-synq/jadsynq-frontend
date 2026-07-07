'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  FileText, Plus, Trash2, ChevronDown, ChevronUp,
  Printer, Download, Zap, Eye, EyeOff,
  Check, User, Briefcase, GraduationCap, Wrench, FolderGit2, Award
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Experience {
  id: string; company: string; title: string; location: string
  startDate: string; endDate: string; current: boolean; bullets: string[]
}
interface Education {
  id: string; school: string; degree: string; field: string
  startDate: string; endDate: string; gpa: string
}
interface Project {
  id: string; name: string; tech: string; url: string; bullets: string[]
}
interface Certification {
  id: string; name: string; issuer: string; date: string
}
interface ResumeData {
  personal: { name: string; email: string; phone: string; location: string; linkedin: string; website: string; visa: string }
  summary: string
  experience: Experience[]
  education: Education[]
  skills: { technical: string; languages: string; tools: string; soft: string }
  projects: Project[]
  certifications: Certification[]
}

const BLANK: ResumeData = {
  personal: { name: '', email: '', phone: '', location: '', linkedin: '', website: '', visa: '' },
  summary: '',
  experience: [],
  education: [],
  skills: { technical: '', languages: '', tools: '', soft: '' },
  projects: [],
  certifications: [],
}

const VISA_OPTIONS = ['', 'U.S. Citizen / Permanent Resident', 'H-1B Visa', 'OPT (F-1)', 'STEM OPT Extension', 'CPT', 'TN Visa', 'Other']

function uid() { return Math.random().toString(36).slice(2) }

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label, open, onToggle }: {
  icon: React.ElementType; label: string; open: boolean; onToggle: () => void
}) {
  return (
    <button onClick={onToggle}
      className="flex items-center gap-2 w-full text-left p-4 hover:bg-gray-50 transition-colors rounded-xl">
      <Icon className="w-4 h-4 text-[#16a34a]" />
      <span className="font-bold text-gray-900 flex-1">{label}</span>
      {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a34a]"
const textareaCls = `${inputCls} resize-none`

// ── Preview renderer (plain HTML for print) ───────────────────────────────────

function buildResumeText(d: ResumeData): string {
  const lines: string[] = []
  const p = d.personal

  if (p.name) lines.push(p.name.toUpperCase())
  const contactLine = [p.email, p.phone, p.location, p.linkedin, p.website].filter(Boolean).join(' | ')
  if (contactLine) lines.push(contactLine)
  if (p.visa) lines.push(`Work Authorization: ${p.visa}`)
  lines.push('')

  if (d.summary) { lines.push('SUMMARY'); lines.push(d.summary); lines.push('') }

  if (d.experience.length) {
    lines.push('EXPERIENCE')
    d.experience.forEach(e => {
      lines.push(`${e.title} — ${e.company}${e.location ? `, ${e.location}` : ''}`)
      lines.push(`${e.startDate}${e.endDate || e.current ? ` – ${e.current ? 'Present' : e.endDate}` : ''}`)
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

// ── Formatted Preview ─────────────────────────────────────────────────────────

function ResumePreview({ data }: { data: ResumeData }) {
  const p = data.personal
  return (
    <div id="resume-preview" className="bg-white text-gray-900 font-serif text-[13px] leading-snug p-8 min-h-full"
      style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      {p.name && (
        <div className="text-center mb-4 pb-3 border-b-2 border-gray-800">
          <h1 className="text-2xl font-bold tracking-wide uppercase">{p.name}</h1>
          <div className="text-xs text-gray-600 mt-1 flex flex-wrap justify-center gap-x-3">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
            {p.website && <span>{p.website}</span>}
          </div>
          {p.visa && <p className="text-xs text-gray-500 mt-0.5">Work Authorization: {p.visa}</p>}
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <Section title="Professional Summary">
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </Section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <Section title="Experience">
          {data.experience.map(exp => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold">{exp.title}</span>
                  {exp.company && <span className="text-gray-600"> — {exp.company}</span>}
                  {exp.location && <span className="text-gray-400">, {exp.location}</span>}
                </div>
                <span className="text-xs text-gray-500 shrink-0 ml-2">
                  {exp.startDate}{(exp.endDate || exp.current) ? ` – ${exp.current ? 'Present' : exp.endDate}` : ''}
                </span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="flex gap-2 text-gray-700">
                    <span className="shrink-0 mt-0.5">•</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <Section title="Education">
          {data.education.map(edu => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                  {edu.school && <span className="text-gray-600"> — {edu.school}</span>}
                </div>
                <span className="text-xs text-gray-500 shrink-0 ml-2">
                  {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}
                </span>
              </div>
              {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {(data.skills.technical || data.skills.languages || data.skills.tools || data.skills.soft) && (
        <Section title="Skills">
          <div className="space-y-0.5">
            {data.skills.technical && <p><span className="font-semibold">Technical:</span> {data.skills.technical}</p>}
            {data.skills.languages && <p><span className="font-semibold">Languages:</span> {data.skills.languages}</p>}
            {data.skills.tools && <p><span className="font-semibold">Tools:</span> {data.skills.tools}</p>}
            {data.skills.soft && <p><span className="font-semibold">Soft Skills:</span> {data.skills.soft}</p>}
          </div>
        </Section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <Section title="Projects">
          {data.projects.map(proj => (
            <div key={proj.id} className="mb-2">
              <div className="flex gap-2 items-baseline flex-wrap">
                <span className="font-bold">{proj.name}</span>
                {proj.tech && <span className="text-gray-500 text-xs">| {proj.tech}</span>}
                {proj.url && <span className="text-xs text-blue-600">{proj.url}</span>}
              </div>
              <ul className="mt-0.5 space-y-0.5">
                {proj.bullets.filter(Boolean).map((b, i) => (
                  <li key={i} className="flex gap-2 text-gray-700">
                    <span className="shrink-0">•</span><span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <Section title="Certifications">
          {data.certifications.map(c => (
            <p key={c.id}><span className="font-semibold">{c.name}</span>
              {c.issuer && <span className="text-gray-600"> — {c.issuer}</span>}
              {c.date && <span className="text-gray-400"> ({c.date})</span>}
            </p>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-0.5 mb-2 text-gray-800">
        {title}
      </h2>
      {children}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResumeBuilderPage() {
  const [data, setData] = useState<ResumeData>(BLANK)
  const [open, setOpen] = useState({ personal: true, summary: false, experience: false, education: false, skills: false, projects: false, certifications: false })
  const [preview, setPreview] = useState(true)
  const [saved, setSaved] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jadsynq_resume')
      if (stored) setData(JSON.parse(stored))
    } catch {}
  }, [])

  const save = useCallback((next: ResumeData) => {
    setData(next)
    localStorage.setItem('jadsynq_resume', JSON.stringify(next))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [])

  const upd = (path: string, value: unknown) => {
    const parts = path.split('.')
    const next = structuredClone(data) as unknown as Record<string, unknown>
    let cur: Record<string, unknown> = next
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] as Record<string, unknown>
    cur[parts[parts.length - 1]] = value
    save(next as unknown as ResumeData)
  }

  const toggle = (key: keyof typeof open) =>
    setOpen(o => ({ ...o, [key]: !o[key] }))

  const handlePrint = () => window.print()

  const handleCopyText = () => {
    navigator.clipboard.writeText(buildResumeText(data))
  }

  const resumeText = buildResumeText(data)
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #resume-print-area { display: block !important; position: fixed; inset: 0; z-index: 9999; background: white; }
          #resume-preview { box-shadow: none !important; }
        }
        #resume-print-area { display: none; }
      `}</style>

      <div id="resume-print-area" ref={printRef}>
        <ResumePreview data={data} />
      </div>

      <div className="min-h-screen bg-[#f0fdf4]">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#16a34a] rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Resume Builder</h1>
                <p className="text-xs text-gray-400">{wordCount} words · auto-saved to browser</p>
              </div>

              <div className="ml-auto flex items-center gap-2">
                {saved && (
                  <span className="flex items-center gap-1 text-xs text-[#16a34a] font-semibold">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
                <Link href={`/ats-check`}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#16a34a] border border-[#16a34a] rounded-lg hover:bg-green-50 transition-colors">
                  <Zap className="w-3.5 h-3.5" /> Check ATS
                </Link>
                <button onClick={handleCopyText}
                  className="px-3 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Copy Text
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold rounded-lg transition-colors">
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </button>
                <button onClick={() => setPreview(p => !p)}
                  className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg transition-colors lg:hidden">
                  {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-5 flex gap-5">
          {/* ── Form Panel ── */}
          <div className="flex-1 space-y-3 min-w-0">

            {/* Personal Info */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <SectionHeader icon={User} label="Personal Info" open={open.personal} onToggle={() => toggle('personal')} />
              {open.personal && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                  <Field label="Full Name"><input className={inputCls} value={data.personal.name} onChange={e => upd('personal.name', e.target.value)} placeholder="Jane Smith" /></Field>
                  <Field label="Email"><input className={inputCls} value={data.personal.email} onChange={e => upd('personal.email', e.target.value)} placeholder="jane@email.com" /></Field>
                  <Field label="Phone"><input className={inputCls} value={data.personal.phone} onChange={e => upd('personal.phone', e.target.value)} placeholder="+1 (555) 000-0000" /></Field>
                  <Field label="Location"><input className={inputCls} value={data.personal.location} onChange={e => upd('personal.location', e.target.value)} placeholder="New York, NY" /></Field>
                  <Field label="LinkedIn URL"><input className={inputCls} value={data.personal.linkedin} onChange={e => upd('personal.linkedin', e.target.value)} placeholder="linkedin.com/in/janesmith" /></Field>
                  <Field label="Website / GitHub"><input className={inputCls} value={data.personal.website} onChange={e => upd('personal.website', e.target.value)} placeholder="github.com/janesmith" /></Field>
                  <div className="col-span-2">
                    <Field label="Work Authorization">
                      <select className={inputCls} value={data.personal.visa} onChange={e => upd('personal.visa', e.target.value)}>
                        {VISA_OPTIONS.map(v => <option key={v} value={v}>{v || '— Select —'}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <SectionHeader icon={FileText} label="Professional Summary" open={open.summary} onToggle={() => toggle('summary')} />
              {open.summary && (
                <div className="px-4 pb-4">
                  <textarea className={`${textareaCls} h-28`} value={data.summary}
                    onChange={e => upd('summary', e.target.value)}
                    placeholder="Results-driven software engineer with 3+ years of experience building scalable web applications…" />
                  <p className="text-xs text-gray-400 mt-1 text-right">{data.summary.split(/\s+/).filter(Boolean).length} words</p>
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <SectionHeader icon={Briefcase} label={`Experience (${data.experience.length})`} open={open.experience} onToggle={() => toggle('experience')} />
              {open.experience && (
                <div className="px-4 pb-4 space-y-4">
                  {data.experience.map((exp, idx) => (
                    <div key={exp.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Position {idx + 1}</span>
                        <button onClick={() => {
                          const next = data.experience.filter(e => e.id !== exp.id)
                          upd('experience', next)
                        }} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Job Title"><input className={inputCls} value={exp.title} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, title: e.target.value }; upd('experience', n) }} placeholder="Software Engineer" /></Field>
                        <Field label="Company"><input className={inputCls} value={exp.company} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, company: e.target.value }; upd('experience', n) }} placeholder="Acme Corp" /></Field>
                        <Field label="Location"><input className={inputCls} value={exp.location} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, location: e.target.value }; upd('experience', n) }} placeholder="San Francisco, CA" /></Field>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Start"><input className={inputCls} value={exp.startDate} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, startDate: e.target.value }; upd('experience', n) }} placeholder="Jan 2022" /></Field>
                          <Field label="End">
                            <div className="flex gap-1 items-center">
                              <input className={inputCls} value={exp.endDate} disabled={exp.current} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, endDate: e.target.value }; upd('experience', n) }} placeholder="Dec 2024" />
                            </div>
                          </Field>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={exp.current} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate }; upd('experience', n) }} className="rounded" />
                        Currently working here
                      </label>
                      <Field label="Bullet Points (one per line, start with action verb)">
                        <textarea className={`${textareaCls} h-24`}
                          value={exp.bullets.join('\n')}
                          onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, bullets: e.target.value.split('\n') }; upd('experience', n) }}
                          placeholder={"Developed REST APIs using Python/FastAPI serving 50K+ daily requests\nOptimized database queries reducing p99 latency by 40%"} />
                      </Field>
                    </div>
                  ))}
                  <button onClick={() => upd('experience', [...data.experience, { id: uid(), company: '', title: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }])}
                    className="flex items-center gap-2 text-sm text-[#16a34a] font-semibold hover:bg-green-50 px-3 py-2 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add Experience
                  </button>
                </div>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <SectionHeader icon={GraduationCap} label={`Education (${data.education.length})`} open={open.education} onToggle={() => toggle('education')} />
              {open.education && (
                <div className="px-4 pb-4 space-y-4">
                  {data.education.map((edu, idx) => (
                    <div key={edu.id} className="border border-gray-100 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Degree {idx + 1}</span>
                        <button onClick={() => upd('education', data.education.filter(e => e.id !== edu.id))} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="School / University"><input className={inputCls} value={edu.school} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, school: e.target.value }; upd('education', n) }} placeholder="MIT" /></Field>
                        <Field label="Degree"><input className={inputCls} value={edu.degree} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, degree: e.target.value }; upd('education', n) }} placeholder="Master of Science" /></Field>
                        <Field label="Field of Study"><input className={inputCls} value={edu.field} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, field: e.target.value }; upd('education', n) }} placeholder="Computer Science" /></Field>
                        <Field label="GPA (optional)"><input className={inputCls} value={edu.gpa} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, gpa: e.target.value }; upd('education', n) }} placeholder="3.8 / 4.0" /></Field>
                        <Field label="Start"><input className={inputCls} value={edu.startDate} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, startDate: e.target.value }; upd('education', n) }} placeholder="Sep 2022" /></Field>
                        <Field label="End / Expected"><input className={inputCls} value={edu.endDate} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, endDate: e.target.value }; upd('education', n) }} placeholder="May 2024" /></Field>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => upd('education', [...data.education, { id: uid(), school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }])}
                    className="flex items-center gap-2 text-sm text-[#16a34a] font-semibold hover:bg-green-50 px-3 py-2 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add Education
                  </button>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <SectionHeader icon={Wrench} label="Skills" open={open.skills} onToggle={() => toggle('skills')} />
              {open.skills && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                  <Field label="Technical Skills"><input className={inputCls} value={data.skills.technical} onChange={e => upd('skills.technical', e.target.value)} placeholder="Python, TypeScript, React, PostgreSQL, AWS" /></Field>
                  <Field label="Programming Languages"><input className={inputCls} value={data.skills.languages} onChange={e => upd('skills.languages', e.target.value)} placeholder="Python, JavaScript, Java, Go" /></Field>
                  <Field label="Tools & Platforms"><input className={inputCls} value={data.skills.tools} onChange={e => upd('skills.tools', e.target.value)} placeholder="Docker, Kubernetes, Git, Jira, Figma" /></Field>
                  <Field label="Soft Skills"><input className={inputCls} value={data.skills.soft} onChange={e => upd('skills.soft', e.target.value)} placeholder="Leadership, Communication, Problem-solving" /></Field>
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <SectionHeader icon={FolderGit2} label={`Projects (${data.projects.length})`} open={open.projects} onToggle={() => toggle('projects')} />
              {open.projects && (
                <div className="px-4 pb-4 space-y-4">
                  {data.projects.map((proj, idx) => (
                    <div key={proj.id} className="border border-gray-100 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Project {idx + 1}</span>
                        <button onClick={() => upd('projects', data.projects.filter(p => p.id !== proj.id))} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Project Name"><input className={inputCls} value={proj.name} onChange={e => { const n = [...data.projects]; n[idx] = { ...proj, name: e.target.value }; upd('projects', n) }} placeholder="Job Aggregator Platform" /></Field>
                        <Field label="Technologies"><input className={inputCls} value={proj.tech} onChange={e => { const n = [...data.projects]; n[idx] = { ...proj, tech: e.target.value }; upd('projects', n) }} placeholder="Next.js, FastAPI, PostgreSQL" /></Field>
                        <div className="col-span-2">
                          <Field label="URL / GitHub"><input className={inputCls} value={proj.url} onChange={e => { const n = [...data.projects]; n[idx] = { ...proj, url: e.target.value }; upd('projects', n) }} placeholder="github.com/username/project" /></Field>
                        </div>
                      </div>
                      <Field label="Bullet Points">
                        <textarea className={`${textareaCls} h-20`}
                          value={proj.bullets.join('\n')}
                          onChange={e => { const n = [...data.projects]; n[idx] = { ...proj, bullets: e.target.value.split('\n') }; upd('projects', n) }}
                          placeholder={"Built real-time job search aggregating 5K+ listings from 200+ company ATS\nReduced page load by 60% using server-side caching"} />
                      </Field>
                    </div>
                  ))}
                  <button onClick={() => upd('projects', [...data.projects, { id: uid(), name: '', tech: '', url: '', bullets: [''] }])}
                    className="flex items-center gap-2 text-sm text-[#16a34a] font-semibold hover:bg-green-50 px-3 py-2 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add Project
                  </button>
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <SectionHeader icon={Award} label={`Certifications (${data.certifications.length})`} open={open.certifications} onToggle={() => toggle('certifications')} />
              {open.certifications && (
                <div className="px-4 pb-4 space-y-3">
                  {data.certifications.map((cert, idx) => (
                    <div key={cert.id} className="grid grid-cols-3 gap-2 items-end">
                      <Field label="Certification Name"><input className={inputCls} value={cert.name} onChange={e => { const n = [...data.certifications]; n[idx] = { ...cert, name: e.target.value }; upd('certifications', n) }} placeholder="AWS Solutions Architect" /></Field>
                      <Field label="Issuer"><input className={inputCls} value={cert.issuer} onChange={e => { const n = [...data.certifications]; n[idx] = { ...cert, issuer: e.target.value }; upd('certifications', n) }} placeholder="Amazon Web Services" /></Field>
                      <div className="flex gap-2 items-end">
                        <Field label="Date"><input className={inputCls} value={cert.date} onChange={e => { const n = [...data.certifications]; n[idx] = { ...cert, date: e.target.value }; upd('certifications', n) }} placeholder="2024" /></Field>
                        <button onClick={() => upd('certifications', data.certifications.filter(c => c.id !== cert.id))} className="text-red-400 hover:text-red-600 mb-0.5 p-2"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => upd('certifications', [...data.certifications, { id: uid(), name: '', issuer: '', date: '' }])}
                    className="flex items-center gap-2 text-sm text-[#16a34a] font-semibold hover:bg-green-50 px-3 py-2 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add Certification
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Preview Panel ── */}
          <div className={cn('w-[480px] shrink-0 sticky top-20 self-start hidden lg:block', preview ? 'lg:block' : 'hidden')}>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-700">Live Preview</span>
                <div className="flex gap-2">
                  <button onClick={handlePrint}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 border border-gray-200 rounded-lg transition-colors">
                    <Download className="w-3 h-3" /> Save as PDF
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-140px)]">
                <ResumePreview data={data} />
              </div>
            </div>
          </div>

          {/* Mobile preview overlay */}
          {preview && (
            <div className="fixed inset-0 bg-black/60 z-50 lg:hidden flex flex-col">
              <div className="bg-white flex-1 overflow-y-auto mt-14">
                <ResumePreview data={data} />
              </div>
              <div className="bg-white border-t border-gray-100 p-4 flex gap-3">
                <button onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#16a34a] text-white font-bold rounded-xl">
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
                <button onClick={() => setPreview(false)}
                  className="px-5 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
