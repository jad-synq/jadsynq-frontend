'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FileText, Plus, Trash2, ChevronDown, ChevronUp,
  Printer, Download, Zap, Eye, EyeOff, Check,
  User, Briefcase, GraduationCap, Wrench, FolderGit2, Award, Palette
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  BLANK, TEMPLATES, TEMPLATE_COMPONENTS, THUMBS,
  ResumeData, Experience, Education, Project, Certification, TemplateId,
} from './templates'

const VISA_OPTIONS = ['', 'U.S. Citizen / Permanent Resident', 'H-1B Visa', 'OPT (F-1)', 'STEM OPT Extension', 'CPT', 'TN Visa', 'Other']

function uid() { return Math.random().toString(36).slice(2) }

// ── Small reusables ───────────────────────────────────────────────────────────

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

// ── Template Picker Modal ─────────────────────────────────────────────────────

function TemplatePicker({ current, onSelect, onClose }: {
  current: TemplateId
  onSelect: (id: TemplateId) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Choose a Template</h2>
            <p className="text-sm text-gray-500">Your content stays the same — only the design changes</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {TEMPLATES.map(t => {
            const Thumb = THUMBS[t.id]
            const active = t.id === current
            return (
              <button
                key={t.id}
                onClick={() => { onSelect(t.id); onClose() }}
                className={cn(
                  'group flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all',
                  active ? 'border-[#16a34a] bg-green-50' : 'border-gray-100 hover:border-gray-300'
                )}
              >
                <div className="w-full aspect-[4/5] rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                  <Thumb />
                </div>
                <div className="text-center w-full">
                  <p className="text-xs font-bold text-gray-900 truncate">{t.name}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">{t.description}</p>
                </div>
                {active && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#16a34a]">
                    <Check className="w-3 h-3" /> Active
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Resume text export ────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResumeBuilderPage() {
  const [data, setData] = useState<ResumeData>(BLANK)
  const [templateId, setTemplateId] = useState<TemplateId>('classic')
  const [showPicker, setShowPicker] = useState(false)
  const [open, setOpen] = useState({
    personal: true, summary: false, experience: false,
    education: false, skills: false, projects: false, certifications: false,
  })
  const [preview, setPreview] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('jadsynq_resume')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.data) setData(parsed.data)
        if (parsed.templateId) setTemplateId(parsed.templateId)
      }
    } catch {}
  }, [])

  const save = useCallback((nextData: ResumeData, nextTemplate?: TemplateId) => {
    setData(nextData)
    const tid = nextTemplate ?? templateId
    localStorage.setItem('jadsynq_resume', JSON.stringify({ data: nextData, templateId: tid }))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [templateId])

  const handleTemplateSelect = (id: TemplateId) => {
    setTemplateId(id)
    localStorage.setItem('jadsynq_resume', JSON.stringify({ data, templateId: id }))
  }

  const upd = (path: string, value: unknown) => {
    const parts = path.split('.')
    const next = structuredClone(data) as unknown as Record<string, unknown>
    let cur: Record<string, unknown> = next
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] as Record<string, unknown>
    cur[parts[parts.length - 1]] = value
    save(next as unknown as ResumeData)
  }

  const toggle = (key: keyof typeof open) => setOpen(o => ({ ...o, [key]: !o[key] }))

  const TemplateComponent = TEMPLATE_COMPONENTS[templateId]
  const currentTemplate = TEMPLATES.find(t => t.id === templateId)!
  const wordCount = buildResumeText(data).split(/\s+/).filter(Boolean).length

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #resume-print-area { display: block !important; position: fixed; inset: 0; z-index: 9999; background: white; }
        }
        #resume-print-area { display: none; }
      `}</style>

      <div id="resume-print-area">
        <TemplateComponent data={data} />
      </div>

      <div className="min-h-screen bg-[#f0fdf4]">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-9 h-9 bg-[#16a34a] rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Resume Builder</h1>
                <p className="text-xs text-gray-400">{wordCount} words · auto-saved</p>
              </div>

              {/* Template pill */}
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-2 px-3 py-1.5 border-2 border-dashed border-gray-200 hover:border-[#16a34a] rounded-xl text-xs font-semibold text-gray-600 hover:text-[#16a34a] transition-colors"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Template:</span> {currentTemplate.name}
              </button>

              <div className="ml-auto flex items-center gap-2">
                {saved && (
                  <span className="flex items-center gap-1 text-xs text-[#16a34a] font-semibold">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
                <Link href="/ats-check"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#16a34a] border border-[#16a34a] rounded-lg hover:bg-green-50 transition-colors">
                  <Zap className="w-3.5 h-3.5" /> Check ATS
                </Link>
                <button onClick={() => navigator.clipboard.writeText(buildResumeText(data))}
                  className="hidden sm:block px-3 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Copy Text
                </button>
                <button onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold rounded-lg transition-colors">
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print / </span>PDF
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
                        <button onClick={() => upd('experience', data.experience.filter(e => e.id !== exp.id))} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Job Title"><input className={inputCls} value={exp.title} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, title: e.target.value }; upd('experience', n) }} placeholder="Software Engineer" /></Field>
                        <Field label="Company"><input className={inputCls} value={exp.company} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, company: e.target.value }; upd('experience', n) }} placeholder="Acme Corp" /></Field>
                        <Field label="Location"><input className={inputCls} value={exp.location} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, location: e.target.value }; upd('experience', n) }} placeholder="San Francisco, CA" /></Field>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Start"><input className={inputCls} value={exp.startDate} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, startDate: e.target.value }; upd('experience', n) }} placeholder="Jan 2022" /></Field>
                          <Field label="End"><input className={inputCls} value={exp.endDate} disabled={exp.current} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, endDate: e.target.value }; upd('experience', n) }} placeholder="Dec 2024" /></Field>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={exp.current} onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, current: e.target.checked, endDate: e.target.checked ? '' : exp.endDate }; upd('experience', n) }} className="rounded" />
                        Currently working here
                      </label>
                      <Field label="Bullet Points (one per line)">
                        <textarea className={`${textareaCls} h-24`}
                          value={exp.bullets.join('\n')}
                          onChange={e => { const n = [...data.experience]; n[idx] = { ...exp, bullets: e.target.value.split('\n') }; upd('experience', n) }}
                          placeholder={"Developed REST APIs using Python/FastAPI serving 50K+ daily requests\nOptimized database queries reducing p99 latency by 40%"} />
                      </Field>
                    </div>
                  ))}
                  <button onClick={() => upd('experience', [...data.experience, { id: uid(), company: '', title: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] } as Experience])}
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
                        <Field label="School"><input className={inputCls} value={edu.school} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, school: e.target.value }; upd('education', n) }} placeholder="MIT" /></Field>
                        <Field label="Degree"><input className={inputCls} value={edu.degree} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, degree: e.target.value }; upd('education', n) }} placeholder="Master of Science" /></Field>
                        <Field label="Field of Study"><input className={inputCls} value={edu.field} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, field: e.target.value }; upd('education', n) }} placeholder="Computer Science" /></Field>
                        <Field label="GPA"><input className={inputCls} value={edu.gpa} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, gpa: e.target.value }; upd('education', n) }} placeholder="3.8 / 4.0" /></Field>
                        <Field label="Start"><input className={inputCls} value={edu.startDate} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, startDate: e.target.value }; upd('education', n) }} placeholder="Sep 2022" /></Field>
                        <Field label="End / Expected"><input className={inputCls} value={edu.endDate} onChange={e => { const n = [...data.education]; n[idx] = { ...edu, endDate: e.target.value }; upd('education', n) }} placeholder="May 2024" /></Field>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => upd('education', [...data.education, { id: uid(), school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' } as Education])}
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
                        <div className="col-span-2"><Field label="URL / GitHub"><input className={inputCls} value={proj.url} onChange={e => { const n = [...data.projects]; n[idx] = { ...proj, url: e.target.value }; upd('projects', n) }} placeholder="github.com/username/project" /></Field></div>
                      </div>
                      <Field label="Bullet Points">
                        <textarea className={`${textareaCls} h-20`}
                          value={proj.bullets.join('\n')}
                          onChange={e => { const n = [...data.projects]; n[idx] = { ...proj, bullets: e.target.value.split('\n') }; upd('projects', n) }}
                          placeholder={"Built real-time job search aggregating 5K+ listings\nReduced page load by 60% using server-side caching"} />
                      </Field>
                    </div>
                  ))}
                  <button onClick={() => upd('projects', [...data.projects, { id: uid(), name: '', tech: '', url: '', bullets: [''] } as Project])}
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
                      <Field label="Name"><input className={inputCls} value={cert.name} onChange={e => { const n = [...data.certifications]; n[idx] = { ...cert, name: e.target.value }; upd('certifications', n) }} placeholder="AWS Solutions Architect" /></Field>
                      <Field label="Issuer"><input className={inputCls} value={cert.issuer} onChange={e => { const n = [...data.certifications]; n[idx] = { ...cert, issuer: e.target.value }; upd('certifications', n) }} placeholder="Amazon Web Services" /></Field>
                      <div className="flex gap-2 items-end">
                        <Field label="Date"><input className={inputCls} value={cert.date} onChange={e => { const n = [...data.certifications]; n[idx] = { ...cert, date: e.target.value }; upd('certifications', n) }} placeholder="2024" /></Field>
                        <button onClick={() => upd('certifications', data.certifications.filter(c => c.id !== cert.id))} className="text-red-400 hover:text-red-600 mb-0.5 p-2"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => upd('certifications', [...data.certifications, { id: uid(), name: '', issuer: '', date: '' } as Certification])}
                    className="flex items-center gap-2 text-sm text-[#16a34a] font-semibold hover:bg-green-50 px-3 py-2 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add Certification
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Preview Panel (desktop) ── */}
          <div className="w-[480px] shrink-0 sticky top-20 self-start hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">Preview</span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{currentTemplate.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowPicker(true)}
                    className="flex items-center gap-1 text-xs text-[#16a34a] font-semibold hover:bg-green-50 px-2 py-1 rounded-lg transition-colors">
                    <Palette className="w-3 h-3" /> Change
                  </button>
                  <button onClick={() => window.print()}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 border border-gray-200 rounded-lg transition-colors">
                    <Download className="w-3 h-3" /> Save PDF
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[calc(100vh-140px)]">
                <TemplateComponent data={data} />
              </div>
            </div>
          </div>

          {/* Mobile preview */}
          {preview && (
            <div className="fixed inset-0 bg-black/60 z-40 lg:hidden flex flex-col">
              <div className="bg-white flex-1 overflow-y-auto mt-14">
                <TemplateComponent data={data} />
              </div>
              <div className="bg-white border-t border-gray-100 p-4 flex gap-3">
                <button onClick={() => window.print()}
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

      {/* Template picker modal */}
      {showPicker && (
        <TemplatePicker
          current={templateId}
          onSelect={handleTemplateSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}
