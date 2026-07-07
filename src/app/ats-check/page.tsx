'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText, ChevronRight, CheckCircle, XCircle, AlertCircle, Zap,
  Upload, ArrowRight, Wand2, Copy, Check, RefreshCw, LayoutTemplate,
  Cpu, Wrench, Heart, HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  analyze, scoreReadability, generateCoverLetter,
  ATSResult, ReadabilityResult,
} from '@/lib/ats'
import { buildResumeText as builderBuildResumeText } from '../resume-builder/templates'

// ── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, label, size = 'lg' }: { score: number; label: string; size?: 'sm' | 'lg' }) {
  const big = size === 'lg'
  const r = big ? 54 : 36
  const dim = big ? 140 : 96
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
  const sw = big ? 12 : 8

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90" style={{ position: 'absolute' }}>
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw} />
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div className="flex flex-col items-center z-10">
          <span className={cn('font-black leading-none', big ? 'text-4xl' : 'text-2xl')} style={{ color }}>{score}</span>
          <span className={cn('text-gray-400 font-semibold', big ? 'text-xs' : 'text-[10px]')}>/ 100</span>
        </div>
      </div>
      <p className={cn('font-bold text-center', big ? 'text-sm' : 'text-xs')} style={{ color }}>
        {score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Fair' : 'Needs Work'}
      </p>
      <p className={cn('text-gray-500 text-center', big ? 'text-xs' : 'text-[10px]')}>{label}</p>
    </div>
  )
}

// ── Keyword bucket display ────────────────────────────────────────────────────

function KeywordBucket({ label, keywords, color, icon: Icon }: {
  label: string; keywords: string[]; color: string; icon: React.ElementType
}) {
  if (!keywords.length) return null
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
        <Icon className="w-3 h-3" style={{ color }} /> {label} ({keywords.length})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {keywords.slice(0, 20).map(k => (
          <span key={k} className="text-xs px-2 py-0.5 rounded-full border"
            style={{ background: `${color}15`, color, borderColor: `${color}40` }}>
            {k}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, score, max, desc }: { label: string; score: number; max: number; desc: string }) {
  const pct = score / max
  const color = pct >= 0.7 ? '#16a34a' : pct >= 0.4 ? '#d97706' : '#dc2626'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-400 text-xs">{score}/{max} pts</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
        </div>
        <span className="text-xs text-gray-400 w-36 shrink-0 text-right">{desc}</span>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = 'ats' | 'readability' | 'cover'

export default function ATSCheckPage() {
  const [resume, setResume] = useState('')
  const [jd, setJd] = useState('')
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null)
  const [readResult, setReadResult] = useState<ReadabilityResult | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [analyzed, setAnalyzed] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('ats')
  const [imported, setImported] = useState(false)
  const [copied, setCopied] = useState(false)
  const [coverGenerated, setCoverGenerated] = useState(false)

  // Pre-fill JD from localStorage when navigating from the "For You" tab
  useEffect(() => {
    try {
      const prefill = localStorage.getItem('jadsynq_prefill_jd')
      if (prefill) {
        setJd(prefill)
        localStorage.removeItem('jadsynq_prefill_jd')
      }
    } catch { /* ignore */ }
  }, [])

  const handleAnalyze = useCallback(() => {
    if (!resume.trim() || !jd.trim()) return
    setAtsResult(analyze(resume, jd))
    setReadResult(scoreReadability(resume))
    setCoverLetter('')
    setCoverGenerated(false)
    setAnalyzed(true)
    setActiveTab('ats')
    try { localStorage.setItem('jadsynq_last_jd', jd) } catch {}
  }, [resume, jd])

  const handleImportFromBuilder = () => {
    try {
      const stored = localStorage.getItem('jadsynq_resume')
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (parsed.data) {
        const text = builderBuildResumeText(parsed.data)
        if (text.trim()) { setResume(text); setImported(true); setTimeout(() => setImported(false), 2500) }
      }
    } catch {}
  }

  const handleGenerateCoverLetter = () => {
    const letter = generateCoverLetter(resume, jd)
    setCoverLetter(letter)
    setCoverGenerated(true)
  }

  const handleCopyCover = () => {
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'ats',        label: 'ATS Score' },
    { id: 'readability', label: 'Readability' },
    { id: 'cover',      label: 'Cover Letter' },
  ]

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#16a34a] rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ATS Score Checker</h1>
              <p className="text-sm text-gray-500">Keyword match · Format analysis · Cover letter generator</p>
            </div>
            <Link href="/resume-builder"
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-[#16a34a] hover:underline">
              Resume Builder <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">

        {/* Inputs */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Job Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Paste the full job posting including requirements</p>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste job description here…"
              className="w-full h-52 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#16a34a] font-mono"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{jd.split(/\s+/).filter(Boolean).length} words</p>
          </div>

          {/* Resume */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold text-gray-700">
                Your Resume <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button onClick={handleImportFromBuilder}
                  className={cn(
                    'flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors',
                    imported ? 'bg-green-50 text-green-700 border-green-200' : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
                  )}>
                  <Wand2 className="w-3 h-3" />{imported ? 'Imported!' : 'Import from Builder'}
                </button>
                <Link href="/resume-builder" className="flex items-center gap-1 text-xs text-[#16a34a] font-semibold hover:underline">
                  <Upload className="w-3 h-3" /> Build
                </Link>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">Import from Resume Builder or paste as plain text</p>
            <textarea
              value={resume}
              onChange={e => { setResume(e.target.value); setImported(false) }}
              placeholder="Paste your resume here, or click 'Import from Builder'…"
              className="w-full h-52 text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#16a34a] font-mono"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{resume.split(/\s+/).filter(Boolean).length} words</p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!resume.trim() || !jd.trim()}
          className="w-full py-4 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl text-base transition-colors flex items-center justify-center gap-2 mb-8"
        >
          <Zap className="w-5 h-5" /> Analyze ATS Compatibility
        </button>

        {/* ── Results ── */}
        {analyzed && atsResult && readResult && (
          <div className="space-y-5">

            {/* Dual score header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                <ScoreRing score={atsResult.score} label="ATS / Keyword Score" />
                <div className="hidden sm:block h-20 w-px bg-gray-100" />
                <ScoreRing score={readResult.score} label="Readability / Format Score" />
                <div className="hidden sm:block h-20 w-px bg-gray-100" />
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl font-black text-gray-800">
                    {Math.round((atsResult.score + readResult.score) / 2)}
                  </div>
                  <div className="text-xs text-gray-400 font-semibold">Combined Score</div>
                  <div className="flex gap-2 mt-1">
                    {[
                      { label: 'Keywords', val: atsResult.keywordScore, max: 40 },
                      { label: 'Sections', val: atsResult.sectionScore, max: 30 },
                    ].map(d => (
                      <div key={d.label} className="text-center">
                        <div className="text-sm font-bold text-gray-700">{d.val}/{d.max}</div>
                        <div className="text-[10px] text-gray-400">{d.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab nav */}
            <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-bold rounded-xl transition-all',
                    activeTab === t.id
                      ? 'bg-[#16a34a] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Tab: ATS Score ── */}
            {activeTab === 'ats' && (
              <div className="space-y-5">
                {/* Breakdown */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                  <h2 className="font-bold text-gray-900 mb-4">Score Breakdown</h2>
                  <ScoreBar label="Keyword Match" score={atsResult.keywordScore} max={40}
                    desc={`${atsResult.matched.length} keywords found`} />
                  <ScoreBar label="Resume Sections" score={atsResult.sectionScore} max={30}
                    desc={`${Object.values(atsResult.sections).filter(Boolean).length}/6 sections`} />
                  <ScoreBar label="Resume Length" score={atsResult.lengthScore} max={15}
                    desc={`${atsResult.wordCount} words`} />
                  <ScoreBar label="Action Verbs" score={atsResult.verbScore} max={15}
                    desc={`${atsResult.verbCount} unique verbs`} />
                </div>

                {/* Sections checklist */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-[#16a34a]" /> Section Checklist
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(atsResult.sections).map(([key, found]) => (
                      <div key={key} className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-xl text-sm',
                        found ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-600'
                      )}>
                        {found ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                        <span className="font-medium capitalize">{key === 'contact' ? 'Contact Info' : key}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matched keywords by bucket */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#16a34a]" /> Matched Keywords
                    <span className="ml-auto text-xs font-normal text-gray-400">{atsResult.matched.length} found</span>
                  </h3>
                  {atsResult.matched.length === 0 ? (
                    <p className="text-sm text-gray-400">No matches yet — add keywords from the job description</p>
                  ) : (
                    <div className="space-y-3">
                      <KeywordBucket label="Technical Skills" keywords={atsResult.matchedBuckets.tech} color="#16a34a" icon={Cpu} />
                      <KeywordBucket label="Tools & Platforms" keywords={atsResult.matchedBuckets.tools} color="#2563eb" icon={Wrench} />
                      <KeywordBucket label="Soft Skills" keywords={atsResult.matchedBuckets.soft} color="#9333ea" icon={Heart} />
                      <KeywordBucket label="Other" keywords={atsResult.matchedBuckets.other} color="#6b7280" icon={HelpCircle} />
                    </div>
                  )}
                </div>

                {/* Missing keywords by bucket */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" /> Missing Keywords
                    <span className="ml-auto text-xs font-normal text-gray-400">{atsResult.missing.length} missing</span>
                  </h3>
                  {atsResult.missing.length === 0 ? (
                    <p className="text-sm text-green-700 font-semibold">All key terms found — great match!</p>
                  ) : (
                    <div className="space-y-3">
                      <KeywordBucket label="Technical Skills" keywords={atsResult.missingBuckets.tech} color="#dc2626" icon={Cpu} />
                      <KeywordBucket label="Tools & Platforms" keywords={atsResult.missingBuckets.tools} color="#ea580c" icon={Wrench} />
                      <KeywordBucket label="Soft Skills" keywords={atsResult.missingBuckets.soft} color="#9333ea" icon={Heart} />
                      <KeywordBucket label="Other" keywords={atsResult.missingBuckets.other} color="#6b7280" icon={HelpCircle} />
                    </div>
                  )}
                </div>

                {/* Tips */}
                {atsResult.tips.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                    <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Improvement Tips
                    </h3>
                    <ul className="space-y-2">
                      {atsResult.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                          <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />{tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Readability ── */}
            {activeTab === 'readability' && (
              <div className="space-y-5">
                {/* Breakdown */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                  <h2 className="font-bold text-gray-900 mb-4">Format & Readability Breakdown</h2>
                  <ScoreBar label="Section Structure" score={readResult.sectionOrderScore} max={30}
                    desc="Order and completeness" />
                  <ScoreBar label="Bullet Quality" score={readResult.bulletQualityScore} max={25}
                    desc="Action verbs + quantification" />
                  <ScoreBar label="Date Consistency" score={readResult.dateConsistencyScore} max={20}
                    desc="Dates in all entries" />
                  <ScoreBar label="Format Cleanliness" score={readResult.formatScore} max={25}
                    desc="No tables, symbols, length" />
                </div>

                {/* Passes */}
                {readResult.passes.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#16a34a]" /> What Looks Good
                    </h3>
                    <ul className="space-y-2">
                      {readResult.passes.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-green-800 bg-green-50 rounded-xl px-3 py-2">
                          <CheckCircle className="w-4 h-4 shrink-0 text-[#16a34a] mt-0.5" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Issues */}
                {readResult.issues.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" /> Issues to Fix
                    </h3>
                    <ul className="space-y-2">
                      {readResult.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />{issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Cover Letter ── */}
            {activeTab === 'cover' && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900">AI-Assisted Cover Letter</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Generated from your resume + the job description. Edit freely before sending.
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {coverGenerated && (
                        <button onClick={handleCopyCover}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-colors',
                            copied ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          )}>
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                      <button onClick={handleGenerateCoverLetter}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-xl transition-colors">
                        {coverGenerated ? <RefreshCw className="w-3.5 h-3.5" /> : <Wand2 className="w-3.5 h-3.5" />}
                        {coverGenerated ? 'Regenerate' : 'Generate'}
                      </button>
                    </div>
                  </div>

                  {!coverGenerated ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                      <Wand2 className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-semibold text-gray-500">Click Generate to create a cover letter</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Pulls your name, experience, and relevant keywords from the resume + job description
                      </p>
                    </div>
                  ) : (
                    <textarea
                      value={coverLetter}
                      onChange={e => setCoverLetter(e.target.value)}
                      className="w-full h-96 text-sm border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#16a34a] leading-relaxed"
                    />
                  )}
                </div>

                {coverGenerated && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                    <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Before You Send
                    </h4>
                    <ul className="space-y-1.5 text-xs text-blue-700">
                      <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />Verify the company name and role title are correct</li>
                      <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />Add a specific achievement or project that wasn&apos;t in the resume text</li>
                      <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />Reference something specific about the company (product, mission, recent news)</li>
                      <li className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />Adjust the tone to match the company culture (startup vs enterprise)</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action row */}
            <div className="flex gap-3">
              <Link href="/resume-builder"
                className="flex items-center gap-2 px-5 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-xl text-sm transition-colors">
                <FileText className="w-4 h-4" /> Improve in Resume Builder
              </Link>
              <button
                onClick={() => { setAtsResult(null); setReadResult(null); setAnalyzed(false); setResume(''); setJd(''); setCoverLetter('') }}
                className="px-5 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold rounded-xl text-sm transition-colors">
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        {!analyzed && (
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Paste Job Description', desc: 'Copy the full job posting — requirements, qualifications, responsibilities.' },
              { step: '2', title: 'Import Your Resume', desc: 'Use "Import from Builder" or paste as plain text. Build one first if needed.' },
              { step: '3', title: 'Get 3 Analyses', desc: 'ATS keyword score, readability/format analysis, and a tailored cover letter.' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="w-8 h-8 bg-[#16a34a] text-white rounded-xl flex items-center justify-center font-black text-sm mb-3">{item.step}</div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
