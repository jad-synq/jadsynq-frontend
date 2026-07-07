'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { FileText, ChevronRight, CheckCircle, XCircle, AlertCircle, Zap, Upload, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Scoring Engine ────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','shall','should','may','might','must','can',
  'could','in','on','at','to','for','of','and','or','but','not','with','from',
  'by','as','we','you','our','your','they','their','it','its','this','that',
  'these','those','i','me','my','he','she','him','her','his','hers','they','them',
  'us','who','what','which','when','where','why','how','all','each','every',
  'both','few','more','most','other','some','such','no','nor','too','very',
  'just','because','if','then','than','so','also','into','over','after','under',
  'about','up','out','through','during','before','above','below','between',
  'while','about','against','between','into','through','during','also','there',
  'here','please','must','new','good','high','strong','well','great','experience',
  'work','working','works','years','year','team','company','role','position',
  'join','based','including','ability','using','use','used','uses','help',
  'within','across','ensure','support','responsible','provide','develop',
  'ensure','manage','maintain','implement','build','create','define',
])

const ACTION_VERBS = new Set([
  'developed','designed','implemented','managed','led','created','built',
  'improved','increased','decreased','achieved','delivered','launched',
  'collaborated','coordinated','established','analyzed','researched',
  'presented','trained','mentored','optimized','automated','integrated',
  'maintained','monitored','resolved','tested','documented','spearheaded',
  'orchestrated','streamlined','deployed','migrated','architected','scaled',
  'reduced','drove','generated','executed','engineered','transformed',
  'accelerated','expanded','negotiated','authored','planned','oversaw',
  'facilitated','partnered','administered','configured','debugged','reviewed',
])

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w))

  // Also extract common bigrams (e.g. "machine learning", "data science")
  const tokens = text.toLowerCase().split(/\s+/)
  const bigrams: string[] = []
  for (let i = 0; i < tokens.length - 1; i++) {
    const bi = `${tokens[i]} ${tokens[i + 1]}`
    if (!STOP_WORDS.has(tokens[i]) && !STOP_WORDS.has(tokens[i + 1]) &&
        tokens[i].length >= 3 && tokens[i + 1].length >= 3) {
      bigrams.push(bi)
    }
  }

  return [...new Set([...words, ...bigrams])]
}

function detectSections(resume: string): Record<string, boolean> {
  const r = resume.toLowerCase()
  return {
    contact:    /(\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b|linkedin\.com\/in\/|\(\d{3}\)|\d{3}[-.\s]\d{3})/.test(r),
    summary:    /\b(summary|objective|profile|about me|professional summary|career summary)\b/.test(r),
    experience: /\b(experience|employment|work history|professional experience|positions held)\b/.test(r),
    education:  /\b(education|degree|bachelor|master|phd|mba|university|college|b\.s\.|m\.s\.|b\.e\.|m\.e\.)\b/.test(r),
    skills:     /\b(skills|technologies|tools|technical skills|competencies|proficiencies|languages)\b/.test(r),
    projects:   /\b(projects?|portfolio|contributions?|github)\b/.test(r),
  }
}

function countActionVerbs(resume: string): number {
  const words = new Set(resume.toLowerCase().split(/\W+/))
  return [...words].filter(w => ACTION_VERBS.has(w)).length
}

interface ATSResult {
  score: number
  keywordScore: number
  sectionScore: number
  lengthScore: number
  verbScore: number
  matched: string[]
  missing: string[]
  sections: Record<string, boolean>
  wordCount: number
  verbCount: number
  tips: string[]
}

function analyze(resume: string, jd: string): ATSResult {
  const jdKeywords = extractKeywords(jd)
  const resumeLower = resume.toLowerCase()

  const matched = jdKeywords.filter(k => resumeLower.includes(k))
  const missing = jdKeywords.filter(k => !resumeLower.includes(k))
    .filter(k => k.length > 3 && !k.includes(' ') ? true : k.split(' ').length > 1)
    .slice(0, 30)

  const sections = detectSections(resume)

  const wordCount = resume.split(/\s+/).filter(Boolean).length
  const verbCount = countActionVerbs(resume)

  // Keyword match: 40 pts
  const keywordScore = jdKeywords.length > 0
    ? Math.round((matched.length / Math.min(jdKeywords.length, 50)) * 40)
    : 0

  // Sections: 30 pts (5 pts each for contact/summary/experience/education/skills, bonus for projects)
  const sectionScore = Math.min(
    (sections.contact ? 6 : 0) +
    (sections.summary ? 6 : 0) +
    (sections.experience ? 8 : 0) +
    (sections.education ? 6 : 0) +
    (sections.skills ? 6 : 0) +
    (sections.projects ? 3 : 0),
    30
  )

  // Length: 15 pts
  const lengthScore =
    wordCount >= 300 && wordCount <= 800 ? 15 :
    wordCount >= 200 || (wordCount > 800 && wordCount <= 1200) ? 10 :
    wordCount >= 100 ? 5 : 2

  // Action verbs: 15 pts
  const verbScore = Math.min(verbCount * 2, 15)

  const score = Math.min(keywordScore + sectionScore + lengthScore + verbScore, 100)

  const tips: string[] = []
  if (keywordScore < 20) tips.push('Add more keywords from the job description to your resume.')
  if (!sections.summary) tips.push('Add a Professional Summary section at the top.')
  if (!sections.skills) tips.push('Add a dedicated Skills or Technologies section.')
  if (!sections.contact) tips.push('Include your email, phone, and LinkedIn URL.')
  if (wordCount < 300) tips.push(`Resume is too short (${wordCount} words). Aim for 350–700 words.`)
  if (wordCount > 900) tips.push(`Resume may be too long (${wordCount} words). Trim to 1–2 pages.`)
  if (verbCount < 5) tips.push('Use more action verbs (e.g. developed, optimized, led, delivered).')
  if (missing.length > 10) tips.push(`Add missing keywords: ${missing.slice(0, 5).join(', ')}…`)

  return {
    score, keywordScore, sectionScore, lengthScore, verbScore,
    matched, missing, sections, wordCount, verbCount, tips,
  }
}

// ── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: '-90px' }}>
        <span className="text-4xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-400 font-semibold">/ 100</span>
      </div>
      <p className="text-sm font-bold mt-1" style={{ color }}>
        {score >= 80 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Fair' : 'Needs Work'}
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ATSCheckPage() {
  const [resume, setResume] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState<ATSResult | null>(null)
  const [analyzed, setAnalyzed] = useState(false)

  const handleAnalyze = useCallback(() => {
    if (!resume.trim() || !jd.trim()) return
    setResult(analyze(resume, jd))
    setAnalyzed(true)
  }, [resume, jd])

  const scoreLabel = (pts: number, max: number) =>
    `${pts}/${max} pts`

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#16a34a] rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ATS Score Checker</h1>
              <p className="text-sm text-gray-500">
                See how well your resume matches a job description before applying
              </p>
            </div>
            <Link href="/resume-builder"
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-[#16a34a] hover:underline">
              Build resume <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Job Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Job Description <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Paste the full job posting including requirements and qualifications</p>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-700">
                Your Resume <span className="text-red-500">*</span>
              </label>
              <Link href="/resume-builder"
                className="flex items-center gap-1 text-xs text-[#16a34a] font-semibold hover:underline">
                <Upload className="w-3 h-3" /> Build with builder
              </Link>
            </div>
            <p className="text-xs text-gray-400 mb-3">Paste your resume as plain text (copy from your Word/PDF document)</p>
            <textarea
              value={resume}
              onChange={e => setResume(e.target.value)}
              placeholder="Paste your resume here…"
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

        {/* Results */}
        {analyzed && result && (
          <div className="space-y-5">
            {/* Score + breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Ring */}
                <div className="relative flex flex-col items-center shrink-0">
                  <ScoreRing score={result.score} />
                </div>

                {/* Breakdown */}
                <div className="flex-1 w-full space-y-3">
                  <h2 className="font-bold text-gray-900 mb-3">Score Breakdown</h2>
                  {[
                    { label: 'Keyword Match', score: result.keywordScore, max: 40, desc: `${result.matched.length} of top keywords found` },
                    { label: 'Resume Sections', score: result.sectionScore, max: 30, desc: `${Object.values(result.sections).filter(Boolean).length}/6 sections detected` },
                    { label: 'Resume Length', score: result.lengthScore, max: 15, desc: `${result.wordCount} words` },
                    { label: 'Action Verbs', score: result.verbScore, max: 15, desc: `${result.verbCount} unique verbs found` },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{item.label}</span>
                        <span className="text-gray-400 text-xs">{scoreLabel(item.score, item.max)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${(item.score / item.max) * 100}%`,
                              backgroundColor: item.score / item.max >= 0.7 ? '#16a34a' : item.score / item.max >= 0.4 ? '#d97706' : '#dc2626',
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-32 shrink-0">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              {/* Sections */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#16a34a]" /> Sections
                </h3>
                <div className="space-y-2">
                  {Object.entries(result.sections).map(([key, found]) => (
                    <div key={key} className="flex items-center gap-2.5">
                      {found
                        ? <CheckCircle className="w-4 h-4 text-[#16a34a] shrink-0" />
                        : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                      <span className={cn('text-sm capitalize', found ? 'text-gray-800' : 'text-red-500 font-medium')}>
                        {key === 'contact' ? 'Contact Info' : key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched keywords */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#16a34a]" /> Matched Keywords
                  <span className="ml-auto text-xs font-normal text-gray-400">{result.matched.length}</span>
                </h3>
                {result.matched.length === 0 ? (
                  <p className="text-sm text-gray-400">No matches yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                    {result.matched.slice(0, 40).map(k => (
                      <span key={k} className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing keywords */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" /> Missing Keywords
                  <span className="ml-auto text-xs font-normal text-gray-400">{result.missing.length}</span>
                </h3>
                {result.missing.length === 0 ? (
                  <p className="text-sm text-gray-400 text-green-700">All key terms found!</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                    {result.missing.map(k => (
                      <span key={k} className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            {result.tips.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Improvement Tips
                </h3>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                      <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3">
              <Link href="/resume-builder"
                className="flex items-center gap-2 px-5 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-xl text-sm transition-colors">
                <FileText className="w-4 h-4" /> Improve Resume in Builder
              </Link>
              <button
                onClick={() => { setResult(null); setAnalyzed(false); setResume(''); setJd('') }}
                className="px-5 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-600 font-semibold rounded-xl text-sm transition-colors">
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Empty state / how it works */}
        {!analyzed && (
          <div className="grid sm:grid-cols-3 gap-4 mt-2">
            {[
              { step: '1', title: 'Paste Job Description', desc: 'Copy the full job posting — requirements, qualifications, responsibilities.' },
              { step: '2', title: 'Paste Your Resume', desc: 'Paste as plain text. Or build one with our Resume Builder first.' },
              { step: '3', title: 'Get Your Score', desc: 'See keyword matches, missing terms, section checklist, and improvement tips.' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="w-8 h-8 bg-[#16a34a] text-white rounded-xl flex items-center justify-center font-black text-sm mb-3">
                  {item.step}
                </div>
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
