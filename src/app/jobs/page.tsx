'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, CheckCircle, CheckCircle2, TrendingUp, DollarSign, Building2,
  Briefcase, ExternalLink, Plus, ChevronRight, Bookmark,
  BookmarkCheck, Sparkles, X, MapPin, Layers, Zap, Upload, FileText,
  AlertTriangle, ChevronDown, ChevronUp, BookOpen, Target
} from 'lucide-react'
import {
  searchJobs, getJobTitleSuggestions, getJobListings,
  getJobMatches, getResume, saveResume, getMe,
  createApplication, saveCompany, unsaveCompany,
  JobRoleResult, JobTitleSuggestion, JobListingResult, JobMatchResult,
} from '@/lib/api'
import { extractResumeText } from '@/lib/pdf'
import { SkeletonCard } from '@/components/ui/Skeleton'
import CompanyLogo from '@/components/ui/CompanyLogo'
import { isAxiosError } from 'axios'
import { formatWage, formatApprovalRate, cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { analyze, ATSResult } from '@/lib/ats'
import { useCopilotStore } from '@/lib/copilotStore'

const POPULAR_ROLES = [
  'Software Engineer', 'Data Engineer', 'Data Scientist',
  'Machine Learning Engineer', 'Product Manager', 'Business Analyst',
  'Financial Analyst', 'Accountant', 'Mechanical Engineer',
  'Electrical Engineer', 'Civil Engineer', 'Nurse',
]

const EXPERIENCE_LEVEL_MAX_YEARS: Record<'entry' | 'mid' | 'senior', number | undefined> = {
  entry: 2,
  mid: 5,
  senior: undefined,
}

const POSTED_WITHIN_HOURS: Record<'24h' | '3d' | 'week' | 'month', number> = {
  '24h': 24,
  '3d': 72,
  week: 24 * 7,
  month: 24 * 30,
}

const ATS_LABEL: Record<string, string> = {
  greenhouse: 'Greenhouse',
  lever: 'Lever',
  ashby: 'Ashby',
  workday: 'Workday',
}

const ATS_COLOR: Record<string, string> = {
  greenhouse: 'bg-brand/10 text-brand-deep border-brand/20',
  lever: 'bg-blue-50 text-blue-700 border-blue-100',
  ashby: 'bg-purple-50 text-purple-700 border-purple-100',
  workday: 'bg-orange-50 text-orange-700 border-orange-100',
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

// ── Gap Analysis ─────────────────────────────────────────────────────────────

type GapCategory = 'tech' | 'tool' | 'soft' | 'other'
interface GapItem { keyword: string; count: number; category: GapCategory }

function computeGaps(items: ScoredJob[]): GapItem[] {
  const counts = new Map<string, { count: number; category: GapCategory }>()
  const add = (kws: string[], cat: GapCategory) => {
    for (const kw of kws) {
      const e = counts.get(kw)
      if (e) e.count++
      else counts.set(kw, { count: 1, category: cat })
    }
  }
  for (const { ats } of items) {
    // A JD that's just a job title (no real description ever got scraped)
    // produces a near-empty keyword set -- counting its "missing" keywords
    // would mean a handful of thin listings drive what looks like a broad
    // skill gap across the whole match list.
    if (ats.jdTooThin) continue
    add(ats.missingBuckets.tech, 'tech')
    add(ats.missingBuckets.tools, 'tool')
    add(ats.missingBuckets.soft, 'soft')
  }
  return Array.from(counts.entries())
    .map(([keyword, { count, category }]) => ({ keyword, count, category }))
    .filter(g => g.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
}

const GAP_STYLE: Record<GapCategory, string> = {
  tech:  'bg-violet-50 text-violet-700 border-violet-100',
  tool:  'bg-sky-50 text-sky-700 border-sky-100',
  soft:  'bg-amber-50 text-amber-700 border-amber-100',
  other: 'bg-paper text-ink-soft border-line',
}
const GAP_LABEL: Record<GapCategory, string> = {
  tech: 'Tech', tool: 'Tool', soft: 'Soft skill', other: 'Keyword',
}

function GapAnalysisPanel({ gaps, totalJobs }: { gaps: GapItem[]; totalJobs: number }) {
  const [expanded, setExpanded] = useState(false)
  if (gaps.length === 0) return null
  const shown = expanded ? gaps : gaps.slice(0, 8)

  return (
    <div className="mb-4 bg-paper-raised rounded-2xl border border-amber-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink">Skill Gap Analysis</p>
          <p className="text-xs text-muted">
            Skills missing from your resume that appear in your top {totalJobs} matches
          </p>
        </div>
        <a
          href="/ats-check"
          className="shrink-0 text-xs text-brand hover:underline font-semibold"
        >
          Fix resume →
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {shown.map(g => (
          <span
            key={g.keyword}
            title={`${GAP_LABEL[g.category]} — missing in ${g.count} of ${totalJobs} matched jobs`}
            className={cn('flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', GAP_STYLE[g.category])}
          >
            {g.keyword}
            <span className="bg-white/70 text-[10px] font-bold px-1 rounded-full leading-none py-0.5">
              {g.count}
            </span>
          </span>
        ))}
      </div>

      {gaps.length > 8 && (
        <button
          onClick={() => setExpanded(x => !x)}
          className="mt-3 flex items-center gap-1 text-xs text-muted hover:text-ink-soft font-medium transition-colors"
        >
          {expanded
            ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
            : <><ChevronDown className="w-3.5 h-3.5" /> Show {gaps.length - 8} more gaps</>
          }
        </button>
      )}
    </div>
  )
}

// ── Match Card (For You tab) ──────────────────────────────────────────────────

interface ScoredJob {
  job: JobMatchResult
  ats: ATSResult
  overqualifiedGap: boolean
  targetMatch: boolean
}

function MatchCard({ item, resumeYears }: { item: ScoredJob; resumeYears: number | null }) {
  const { user } = useAuth()
  const router = useRouter()
  const openCopilot = useCopilotStore(s => s.open)
  const [logged, setLogged] = useState(false)
  const [logging, setLogging] = useState(false)
  const { job, ats, overqualifiedGap, targetMatch } = item
  const score = ats.score
  const scoreColor = score >= 75 ? 'text-gold-deep' : score >= 50 ? 'text-amber-500' : 'text-red-500'
  const scoreBg   = score >= 75 ? 'bg-gold/15 border-gold/40' : score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
  const atsLabel  = ATS_LABEL[job.ats_source] || job.ats_source
  const atsColor  = ATS_COLOR[job.ats_source]  || 'bg-paper text-ink-soft border-line'
  const posted    = timeAgo(job.posted_at)

  const techTags    = ats.matchedBuckets.tech.slice(0, 5)
  const toolsTags   = ats.matchedBuckets.tools.slice(0, 5)
  const missingTags = [
    ...ats.missingBuckets.tech,
    ...ats.missingBuckets.tools,
    ...ats.missingBuckets.soft,
  ].slice(0, 4)

  const handleCheckMatch = () => {
    try {
      const jd = `${job.title} ${job.department ?? ''} ${job.description_snippet ?? ''}`
      localStorage.setItem('jadsynq_prefill_jd', jd.trim())
    } catch { /* ignore */ }
    router.push('/ats-check')
  }

  const handleExplainMatch = () => {
    if (!user) { router.push('/auth'); return }
    openCopilot({
      title: job.title,
      company: job.legal_name,
      matched_keywords: [...ats.matchedBuckets.tech, ...ats.matchedBuckets.tools],
      missing_keywords: [...ats.missingBuckets.tech, ...ats.missingBuckets.tools],
    })
  }

  const handleLog = async () => {
    if (!user) { router.push('/auth'); return }
    setLogging(true)
    try {
      await createApplication({
        company_name: job.legal_name, company_id: job.company_id,
        job_title: job.title, job_url: job.url,
        status: 'applied', applied_date: new Date().toISOString().split('T')[0],
      })
      setLogged(true)
    } catch { /* ignore */ } finally { setLogging(false) }
  }

  return (
    <div className="bg-paper-raised rounded-2xl border border-line hover:border-brand/30 hover:shadow-md transition-all p-5">
      {/* Top row: logo + info + score */}
      <div className="flex items-start gap-4">
        <CompanyLogo logoUrl={job.logo_url} domain={job.domain} name={job.legal_name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-ink text-base leading-tight">{job.title}</h3>
              <Link href={`/companies/${job.company_id}`}
                className="text-sm text-brand hover:underline font-semibold mt-0.5 inline-block">
                {job.legal_name}
              </Link>
            </div>
            {/* Score badge */}
            {ats.jdTooThin ? (
              <div className="shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border bg-paper border-line"
                title="This job has no full description yet, so a match score can't be calculated accurately.">
                <span className="text-xs font-bold text-muted">No score</span>
                <span className="text-[10px] text-muted">yet</span>
              </div>
            ) : (
              <div className={cn('shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border', scoreBg)}>
                <span className={cn('text-2xl font-black leading-none', scoreColor)}>{score}</span>
                <span className="text-[10px] text-muted font-semibold">/100</span>
                <span className={cn('text-[10px] font-bold mt-0.5', scoreColor)}>Match</span>
              </div>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-2 mt-2">
            {targetMatch && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gold/15 text-gold-deep border border-gold/40">
                <Target className="w-3 h-3" /> Matches your targets
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <MapPin className="w-3 h-3" /> {job.location}
              </span>
            )}
            {job.department && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <Layers className="w-3 h-3" /> {job.department}
              </span>
            )}
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', atsColor)}>
              {atsLabel}
            </span>
            {posted && <span className="text-xs text-muted ml-auto">{posted}</span>}
          </div>

          {overqualifiedGap && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 w-fit">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Requires {job.min_years_experience}+ years experience — your resume shows ~{resumeYears}
            </div>
          )}
        </div>
      </div>

      {/* Keyword rows */}
      {(techTags.length > 0 || toolsTags.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {techTags.map(k => (
            <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-gold/15 text-gold-deep border border-gold/30 font-medium">
              {k}
            </span>
          ))}
          {toolsTags.map(k => (
            <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
              {k}
            </span>
          ))}
        </div>
      )}

      {missingTags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {missingTags.map(k => (
            <span key={k} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100 font-medium">
              missing: {k}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mt-3">
        <a href={job.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-1.5 bg-brand hover:bg-brand-deep text-white text-xs font-bold rounded-lg transition-colors">
          Apply Now <ExternalLink className="w-3 h-3" />
        </a>
        <button onClick={handleLog} disabled={logging || logged}
          className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-60',
            logged ? 'bg-brand/10 text-brand-deep border-brand/30' : 'bg-paper hover:bg-line text-ink-soft border-line')}>
          {logged ? <><CheckCircle2 className="w-3.5 h-3.5" /> Logged</> : <><Plus className="w-3.5 h-3.5" /> Log App</>}
        </button>
        <button onClick={handleCheckMatch}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold rounded-lg border border-violet-200 transition-colors">
          <Zap className="w-3 h-3" /> Check Match
        </button>
        <button onClick={handleExplainMatch}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/15 hover:bg-gold/25 text-gold-deep text-xs font-semibold rounded-lg border border-gold/40 transition-colors">
          <Sparkles className="w-3 h-3" /> Explain Match
        </button>
        <Link href={`/interview-prep?role=${encodeURIComponent(job.title)}`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors">
          <BookOpen className="w-3 h-3" /> Prep for Interview
        </Link>
      </div>
    </div>
  )
}

// ── Live Listing Card ─────────────────────────────────────────────────────────

function ListingCard({ listing }: { listing: JobListingResult }) {
  const { user } = useAuth()
  const router = useRouter()
  const [logged, setLogged] = useState(false)
  const [logging, setLogging] = useState(false)
  const atsLabel = ATS_LABEL[listing.ats_source] || listing.ats_source
  const atsColor = ATS_COLOR[listing.ats_source] || 'bg-paper text-ink-soft border-line'
  const posted = timeAgo(listing.posted_at || listing.scraped_at)

  const handleLog = async () => {
    if (!user) { router.push('/auth'); return }
    setLogging(true)
    try {
      await createApplication({
        company_name: listing.legal_name, company_id: listing.company_id,
        job_title: listing.title, job_url: listing.url,
        status: 'applied', applied_date: new Date().toISOString().split('T')[0],
      })
      setLogged(true)
    } catch { /* ignore */ } finally { setLogging(false) }
  }

  return (
    <div className="bg-paper-raised rounded-2xl border border-line hover:border-brand/30 hover:shadow-md transition-all p-5">
      <div className="flex items-start gap-4">
        <CompanyLogo
          logoUrl={listing.logo_url}
          domain={listing.domain}
          name={listing.legal_name}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-ink text-base leading-tight">{listing.title}</h3>
              <Link href={`/companies/${listing.company_id}`}
                className="text-sm text-brand hover:underline font-semibold mt-0.5 inline-block">
                {listing.legal_name}
              </Link>
            </div>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0', atsColor)}>
              {atsLabel}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {listing.location && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <MapPin className="w-3 h-3" /> {listing.location}
              </span>
            )}
            {listing.department && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <Layers className="w-3 h-3" /> {listing.department}
              </span>
            )}
            {listing.employment_type && (
              <span className="text-xs text-muted">{listing.employment_type}</span>
            )}
            {listing.avg_wage && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <DollarSign className="w-3 h-3" /> {formatWage(listing.avg_wage)} avg H-1B
              </span>
            )}
            {posted && (
              <span className="text-xs text-muted ml-auto">{posted}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <a href={listing.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-brand hover:bg-brand-deep text-white text-xs font-bold rounded-lg transition-colors">
              Apply Now <ExternalLink className="w-3 h-3" />
            </a>
            <button onClick={handleLog} disabled={logging || logged}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-60',
                logged ? 'bg-brand/10 text-brand-deep border-brand/30' : 'bg-paper hover:bg-line text-ink-soft border-line')}>
              {logged ? <><CheckCircle2 className="w-3.5 h-3.5" /> Logged</> : <><Plus className="w-3.5 h-3.5" /> Log App</>}
            </button>
            <Link href={`/companies/${listing.company_id}`}
              className="flex items-center gap-1 px-3 py-1.5 text-muted hover:text-ink-soft text-xs transition-colors">
              H-1B data <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── H-1B Petition Card ────────────────────────────────────────────────────────

function JobCard({ job, onLogApp }: { job: JobRoleResult; onLogApp: (j: JobRoleResult) => void }) {
  const { user } = useAuth()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const isEnrolled = job.everify_status === 'enrolled'

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) { router.push('/auth'); return }
    setSaveLoading(true)
    try {
      if (saved) { await unsaveCompany(job.company_id); setSaved(false) }
      else { await saveCompany(job.company_id); setSaved(true) }
    } catch { /* ignore */ } finally { setSaveLoading(false) }
  }

  const indeedUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(job.job_title + ' ' + job.legal_name)}`
  const linkedinUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.job_title)}&company=${encodeURIComponent(job.legal_name)}`

  return (
    <div className="bg-paper-raised rounded-2xl border border-line hover:border-brand/30 hover:shadow-md transition-all p-5">
      <div className="flex items-start gap-4">
        <CompanyLogo logoUrl={job.logo_url} domain={job.domain} name={job.legal_name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-ink text-base truncate">{job.job_title}</h3>
              <Link href={`/companies/${job.company_id}`}
                className="text-sm text-brand hover:underline font-semibold mt-0.5 inline-block">
                {job.legal_name}
              </Link>
            </div>
            <button onClick={handleSave} disabled={saveLoading}
              className={cn('p-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-40',
                saved ? 'text-brand bg-brand/10' : 'text-muted hover:text-muted hover:bg-paper')}>
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              <TrendingUp className="w-3 h-3" /> {job.petitions.toLocaleString()} H-1B petitions
            </span>
            {job.approval_rate !== null && (
              <span className={cn(
                'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border',
                job.approval_rate >= 0.95 ? 'text-brand-deep bg-brand/10 border-brand/20' :
                job.approval_rate >= 0.8 ? 'text-yellow-700 bg-yellow-50 border-yellow-100' :
                'text-red-600 bg-red-50 border-red-100'
              )}>
                <CheckCircle className="w-3 h-3" /> {formatApprovalRate(job.approval_rate)} approval
              </span>
            )}
            {job.avg_wage && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-ink-soft bg-paper px-2.5 py-1 rounded-full border border-line">
                <DollarSign className="w-3 h-3" /> {formatWage(job.avg_wage)} avg
              </span>
            )}
            {isEnrolled && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-gold-deep bg-gold/15 px-2.5 py-1 rounded-full border border-gold/30">
                <CheckCircle className="w-3 h-3" /> E-Verify
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={() => { if (!user) { router.push('/auth'); return }; onLogApp(job) }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand-deep text-white text-xs font-bold rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Log Application
            </button>
            {job.careers_url && (
              <a href={job.careers_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-paper hover:bg-line text-ink-soft text-xs font-semibold rounded-lg border border-line transition-colors">
                <Briefcase className="w-3.5 h-3.5" /> Careers <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <a href={indeedUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100 transition-colors">
              Indeed <ExternalLink className="w-3 h-3" />
            </a>
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold rounded-lg border border-sky-100 transition-colors">
              LinkedIn <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Log App Modal ─────────────────────────────────────────────────────────────

function LogAppModal({ job, onClose, onDone }: { job: JobRoleResult; onClose: () => void; onDone: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLog = async () => {
    setLoading(true); setError(null)
    try {
      await createApplication({
        company_name: job.legal_name, company_id: job.company_id,
        job_title: job.job_title, status: 'applied',
        applied_date: new Date().toISOString().split('T')[0],
      })
      onDone()
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) { onClose(); router.push('/auth'); return }
      setError(isAxiosError(err) && err.response?.data?.detail
        ? String(err.response.data.detail) : 'Failed to log application.')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-paper-raised rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">Log Application</h3>
          <button onClick={onClose} className="text-muted hover:text-ink-soft"><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-brand/10 rounded-xl p-4 mb-4 border border-brand/20">
          <p className="font-semibold text-ink">{job.job_title}</p>
          <p className="text-sm text-brand font-medium mt-0.5">{job.legal_name}</p>
        </div>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex gap-2">
          <button onClick={handleLog} disabled={loading}
            className="flex-1 py-2.5 bg-brand hover:bg-brand-deep text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Logging…' : '✓ Log as Applied'}
          </button>
          <button onClick={onClose}
            className="px-4 py-2.5 bg-line hover:bg-line text-ink-soft text-sm font-medium rounded-xl transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [tab, setTab] = useState<'foryou' | 'live' | 'h1b'>('foryou')

  const { user } = useAuth()

  // For You state
  const [forYouLoading, setForYouLoading] = useState(false)
  const [forYouFetched, setForYouFetched] = useState(false)
  const [forYouNoResume, setForYouNoResume] = useState(false)
  const [scoredJobs, setScoredJobs] = useState<ScoredJob[]>([])
  const [resumeYears, setResumeYears] = useState<number | null>(null)
  const [gaps, setGaps] = useState<GapItem[]>([])
  const [resumeWordCount, setResumeWordCount] = useState(0)
  const [inlineResumePaste, setInlineResumePaste] = useState('')
  const [inlineResumeSaving, setInlineResumeSaving] = useState(false)
  const [inlineResumeError, setInlineResumeError] = useState('')
  const inlineFileRef = useRef<HTMLInputElement>(null)

  // Live listings state
  const [liveQuery, setLiveQuery] = useState('')
  const [liveInput, setLiveInput] = useState('')
  const [liveLocation, setLiveLocation] = useState('')
  const [listings, setListings] = useState<JobListingResult[]>([])
  const [liveTotal, setLiveTotal] = useState(0)
  const [liveOffset, setLiveOffset] = useState(0)
  const [liveLoading, setLiveLoading] = useState(false)
  const [liveSearched, setLiveSearched] = useState(false)
  const [liveEmploymentType, setLiveEmploymentType] = useState('')
  const [liveExperienceLevel, setLiveExperienceLevel] = useState<'' | 'entry' | 'mid' | 'senior'>('')
  const [liveMinWage, setLiveMinWage] = useState('')
  const [liveMaxWage, setLiveMaxWage] = useState('')
  const [livePostedWithin, setLivePostedWithin] = useState<'' | '24h' | '3d' | 'week' | 'month'>('')
  const [liveRecommendedOnly, setLiveRecommendedOnly] = useState(false)
  const [liveTargetRoles, setLiveTargetRoles] = useState<string[]>([])
  const [liveTargetCities, setLiveTargetCities] = useState<string[]>([])

  // H-1B state
  const [query, setQuery] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [jobs, setJobs] = useState<JobRoleResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [everifyOnly, setEverifyOnly] = useState(false)
  const [suggestions, setSuggestions] = useState<JobTitleSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [logJob, setLogJob] = useState<JobRoleResult | null>(null)
  const [logSuccess, setLogSuccess] = useState(false)
  const [offset, setOffset] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const LIMIT = 20

  // Load For You matches when tab is active and user is logged in
  useEffect(() => {
    if (tab !== 'foryou' || !user || forYouFetched) return
    setForYouLoading(true)
    setForYouNoResume(false)
    Promise.all([
      getJobMatches({ limit: 30 }),
      getResume().catch(() => null),
    ]).then(([matchRes, resumeRes]) => {
      const resumeText = resumeRes?.data?.resume_text ?? ''
      const resumeYears = matchRes.data.resume_years
      const targetRoles = matchRes.data.target_roles
      const targetCities = matchRes.data.target_cities
      setResumeYears(resumeYears)
      setResumeWordCount(matchRes.data.resume_word_count)
      const scored: ScoredJob[] = matchRes.data.jobs.map(job => {
        const jdText = `${job.title} ${job.department ?? ''} ${job.description_snippet ?? ''}`
        const ats = analyze(resumeText, jdText)
        // A 1-year tolerance so a resume showing 3 years isn't demoted for
        // a "3+ years" posting -- only flag postings that ask for
        // meaningfully more experience than the resume shows.
        const overqualifiedGap = (
          resumeYears != null &&
          job.min_years_experience != null &&
          job.min_years_experience > resumeYears + 1
        )
        const titleLower = job.title.toLowerCase()
        const locationLower = (job.location ?? '').toLowerCase()
        const targetMatch = (
          targetRoles.some(role => titleLower.includes(role.toLowerCase())) ||
          targetCities.some(city => locationLower.includes(city.toLowerCase().split(',')[0]))
        )
        return { job, ats, overqualifiedGap, targetMatch }
      })
      // Jobs with a real, usable job description sort by match score first;
      // jobs where the scraper never backfilled a description (JD is just a
      // title/department) get pushed to the end instead of being interleaved
      // by a score that isn't measuring much of anything. Jobs that ask for
      // more experience than the resume shows get demoted below both, since
      // a high keyword-overlap score doesn't mean much if the seniority bar
      // is out of reach. Jobs matching a stated target role/city get a boost
      // within whatever tier they land in.
      scored.sort((a, b) => {
        if (a.ats.jdTooThin !== b.ats.jdTooThin) return a.ats.jdTooThin ? 1 : -1
        if (a.overqualifiedGap !== b.overqualifiedGap) return a.overqualifiedGap ? 1 : -1
        if (a.targetMatch !== b.targetMatch) return a.targetMatch ? -1 : 1
        return b.ats.score - a.ats.score
      })
      setScoredJobs(scored)
      setGaps(computeGaps(scored))
      setForYouFetched(true)
    }).catch(err => {
      if (isAxiosError(err) && err.response?.status === 404) {
        setForYouNoResume(true)
      }
      setForYouFetched(true)
    }).finally(() => setForYouLoading(false))
  }, [tab, user, forYouFetched])

  // Load live listings on mount
  useEffect(() => {
    fetchListings('', '', 0)
  }, [])

  // Load target roles/cities for the "Recommended only" filter
  useEffect(() => {
    if (!user) return
    getMe().then(res => {
      setLiveTargetRoles(res.data.target_roles)
      setLiveTargetCities(res.data.target_cities)
    }).catch(() => {})
  }, [user])

  // Load popular H-1B titles on mount
  useEffect(() => {
    getJobTitleSuggestions('').then(res => setSuggestions(res.data)).catch(() => {})
  }, [])

  // H-1B autocomplete
  useEffect(() => {
    if (!inputValue.trim() || inputValue.length < 2) return
    const t = setTimeout(() => {
      getJobTitleSuggestions(inputValue).then(res => setSuggestions(res.data)).catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [inputValue])

  const fetchListings = async (title: string, location: string, newOffset: number) => {
    setLiveLoading(true)
    setLiveSearched(true)
    try {
      const res = await getJobListings({
        title: title || undefined,
        location: location || undefined,
        employment_type: liveEmploymentType || undefined,
        max_experience_years: liveExperienceLevel ? EXPERIENCE_LEVEL_MAX_YEARS[liveExperienceLevel] : undefined,
        min_wage: liveMinWage ? Number(liveMinWage) : undefined,
        max_wage: liveMaxWage ? Number(liveMaxWage) : undefined,
        posted_within_hours: livePostedWithin ? POSTED_WITHIN_HOURS[livePostedWithin] : undefined,
        limit: LIMIT,
        offset: newOffset,
      })
      setListings(res.data.listings)
      setLiveTotal(res.data.total)
      setLiveOffset(newOffset)
    } catch { setListings([]) } finally { setLiveLoading(false) }
  }

  const handleLiveSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setLiveQuery(liveInput)
    fetchListings(liveInput, liveLocation, 0)
  }

  const doSearch = async (title: string, newOffset = 0) => {
    setLoading(true); setHasSearched(true); setShowSuggestions(false)
    try {
      const res = await searchJobs({ title, everify_only: everifyOnly, limit: LIMIT, offset: newOffset })
      setJobs(res.data.jobs); setTotal(res.data.total); setOffset(newOffset)
    } catch { setJobs([]) } finally { setLoading(false) }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    setQuery(inputValue); doSearch(inputValue)
  }

  const handleSuggestion = (title: string) => {
    setInputValue(title); setQuery(title); doSearch(title)
  }

  const handleInlineFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const text = await extractResumeText(file)
    setInlineResumePaste(text)
    setInlineResumeError('')
  }

  const handleInlineResumeSave = async () => {
    const text = inlineResumePaste.trim()
    if (!text) { setInlineResumeError('Please paste your resume text or upload a .txt file'); return }
    if (text.split(/\s+/).length < 30) { setInlineResumeError('Resume seems too short — paste the full text'); return }
    setInlineResumeError('')
    setInlineResumeSaving(true)
    try {
      await saveResume({ resume_text: text, resume_data: null })
      setInlineResumePaste('')
      setForYouNoResume(false)
      setForYouFetched(false)
      setScoredJobs([])
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } }
      const status = axiosErr?.response?.status
      const detail = axiosErr?.response?.data?.detail
      if (status === 401) {
        setInlineResumeError('Session expired — please sign out and sign back in')
      } else if (detail) {
        setInlineResumeError(`Failed to save: ${detail}`)
      } else {
        setInlineResumeError('Failed to save — please try again')
      }
      console.error('[resume save]', err)
    }
    finally { setInlineResumeSaving(false) }
  }

  // Client-side filter over the current page of live listings -- matches
  // the same logic as the "For You" target-role/city boost, but as a hard
  // filter here since this tab has no server-side notion of "target".
  const hasLiveTargets = liveTargetRoles.length > 0 || liveTargetCities.length > 0
  const displayedListings = liveRecommendedOnly
    ? listings.filter(l => {
        const titleLower = l.title.toLowerCase()
        const locationLower = (l.location ?? '').toLowerCase()
        return (
          liveTargetRoles.some(role => titleLower.includes(role.toLowerCase())) ||
          liveTargetCities.some(city => locationLower.includes(city.toLowerCase().split(',')[0]))
        )
      })
    : listings

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="bg-paper-raised border-b border-line">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Jobs</h1>
              <p className="text-sm text-muted">Live openings + H-1B sponsorship data from verified employers</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-line rounded-xl p-1 w-fit">
            <button
              onClick={() => setTab('foryou')}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                tab === 'foryou' ? 'bg-paper-raised text-ink shadow-sm' : 'text-muted hover:text-ink-soft')}>
              <Sparkles className="w-4 h-4 text-violet-500" />
              For You
              {scoredJobs.length > 0 && (
                <span className="bg-violet-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {scoredJobs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('live')}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                tab === 'live' ? 'bg-paper-raised text-ink shadow-sm' : 'text-muted hover:text-ink-soft')}>
              <Zap className="w-4 h-4 text-brand" />
              Live Openings
              {liveTotal > 0 && (
                <span className="bg-brand text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {liveTotal.toLocaleString()}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('h1b')}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                tab === 'h1b' ? 'bg-paper-raised text-ink shadow-sm' : 'text-muted hover:text-ink-soft')}>
              <TrendingUp className="w-4 h-4 text-blue-500" />
              H-1B Sponsors
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">

        {/* ── For You Tab ── */}
        {tab === 'foryou' && (
          <>
            {/* Not signed in */}
            {!user && (
              <div className="text-center py-16 bg-paper-raised rounded-2xl border border-line">
                <Sparkles className="w-10 h-10 text-line mx-auto mb-3" />
                <p className="font-semibold text-ink-soft mb-1">Sign in to see jobs matched to your resume</p>
                <p className="text-sm text-muted mb-5">We&apos;ll score every open position against your skills automatically</p>
                <Link href="/auth"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-deep transition-colors">
                  Sign in / Sign up
                </Link>
              </div>
            )}

            {/* Loading skeleton */}
            {user && forYouLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* No resume saved — inline upload */}
            {user && !forYouLoading && forYouNoResume && (
              <div className="bg-paper-raised rounded-2xl border border-dashed border-line p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-bold text-ink">Add your resume to see matched jobs</p>
                    <p className="text-sm text-muted">We&apos;ll rank every open role by how well it matches your skills</p>
                  </div>
                </div>

                {/* Paste area */}
                <textarea
                  value={inlineResumePaste}
                  onChange={e => { setInlineResumePaste(e.target.value); setInlineResumeError('') }}
                  placeholder="Paste your resume text here…"
                  rows={7}
                  className="w-full px-3 py-2.5 text-xs border border-line rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none font-mono mb-3"
                />

                {inlineResumeError && (
                  <p className="text-xs text-red-500 mb-2">{inlineResumeError}</p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={inlineFileRef}
                    type="file"
                    accept=".pdf,.txt,.text,application/pdf,text/plain"
                    className="hidden"
                    onChange={handleInlineFilePick}
                  />
                  <button
                    onClick={() => inlineFileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-line hover:border-line text-ink-soft text-xs font-semibold rounded-lg transition-colors">
                    <Upload className="w-3.5 h-3.5" /> Upload PDF or .txt
                  </button>
                  <button
                    onClick={handleInlineResumeSave}
                    disabled={inlineResumeSaving || !inlineResumePaste.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-brand hover:bg-brand-deep text-white text-xs font-bold rounded-lg disabled:opacity-40 transition-colors">
                    {inlineResumeSaving ? 'Saving…' : <><Sparkles className="w-3.5 h-3.5" /> Save &amp; See Matches</>}
                  </button>
                  <Link href="/resume-builder"
                    className="text-xs text-muted hover:text-brand hover:underline ml-auto">
                    Build from scratch →
                  </Link>
                </div>

                <p className="text-xs text-muted mt-3">
                  Upload your PDF resume directly, or paste the text above.
                </p>
              </div>
            )}

            {/* Results */}
            {user && !forYouLoading && !forYouNoResume && scoredJobs.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <p className="text-sm font-bold text-ink-soft">
                    {scoredJobs.length} jobs ranked by match to your resume
                  </p>
                  {resumeWordCount > 0 && (
                    <span className="text-xs text-muted">({resumeWordCount} word resume)</span>
                  )}
                  <button
                    onClick={() => { setForYouFetched(false); setScoredJobs([]); setGaps([]) }}
                    className="ml-auto text-xs text-brand hover:underline font-medium">
                    Refresh
                  </button>
                </div>
                <GapAnalysisPanel gaps={gaps} totalJobs={scoredJobs.length} />
                <div className="space-y-3">
                  {scoredJobs.map(item => (
                    <MatchCard key={item.job.id} item={item} resumeYears={resumeYears} />
                  ))}
                </div>
              </>
            )}

            {/* Fetched but no jobs */}
            {user && !forYouLoading && !forYouNoResume && forYouFetched && scoredJobs.length === 0 && (
              <div className="text-center py-16 bg-paper-raised rounded-2xl border border-line">
                <Building2 className="w-10 h-10 text-line mx-auto mb-3" />
                <p className="font-semibold text-ink-soft mb-1">No matched jobs found right now</p>
                <p className="text-sm text-muted">Check back after more jobs are scraped</p>
              </div>
            )}
          </>
        )}

        {/* ── Live Openings Tab ── */}
        {tab === 'live' && (
          <>
            <form onSubmit={handleLiveSearch} className="mb-6">
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={liveInput}
                    onChange={e => setLiveInput(e.target.value)}
                    placeholder="Job title, role, or keyword…"
                    className="w-full pl-11 pr-4 py-3.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-paper-raised"
                  />
                </div>
                <div className="relative w-44">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={liveLocation}
                    onChange={e => setLiveLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full pl-9 pr-3 py-3.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-paper-raised"
                  />
                </div>
                <button type="submit"
                  className="px-6 py-3.5 bg-brand hover:bg-brand-deep text-white font-bold rounded-xl text-sm transition-colors">
                  Search
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                <select
                  value={liveEmploymentType}
                  onChange={e => setLiveEmploymentType(e.target.value)}
                  className="px-3 py-2 border border-line rounded-lg text-xs font-medium bg-paper-raised text-ink-soft focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Any employment type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
                <select
                  value={liveExperienceLevel}
                  onChange={e => setLiveExperienceLevel(e.target.value as typeof liveExperienceLevel)}
                  className="px-3 py-2 border border-line rounded-lg text-xs font-medium bg-paper-raised text-ink-soft focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Any experience level</option>
                  <option value="entry">Entry level (0-2 yrs)</option>
                  <option value="mid">Mid level (0-5 yrs)</option>
                  <option value="senior">Senior (no cap)</option>
                </select>
                <input
                  type="number"
                  min={0}
                  value={liveMinWage}
                  onChange={e => setLiveMinWage(e.target.value)}
                  placeholder="Min $"
                  className="w-24 px-3 py-2 border border-line rounded-lg text-xs font-medium bg-paper-raised text-ink-soft focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <input
                  type="number"
                  min={0}
                  value={liveMaxWage}
                  onChange={e => setLiveMaxWage(e.target.value)}
                  placeholder="Max $"
                  className="w-24 px-3 py-2 border border-line rounded-lg text-xs font-medium bg-paper-raised text-ink-soft focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <select
                  value={livePostedWithin}
                  onChange={e => setLivePostedWithin(e.target.value as typeof livePostedWithin)}
                  className="px-3 py-2 border border-line rounded-lg text-xs font-medium bg-paper-raised text-ink-soft focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">Any time posted</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="3d">Last 3 days</option>
                  <option value="week">Last week</option>
                  <option value="month">Last month</option>
                </select>
                <button
                  type="button"
                  onClick={() => fetchListings(liveQuery, liveLocation, 0)}
                  className="px-3 py-2 bg-paper hover:bg-line text-ink-soft text-xs font-semibold rounded-lg border border-line transition-colors"
                >
                  Apply filters
                </button>
                {hasLiveTargets && (
                  <button
                    type="button"
                    onClick={() => setLiveRecommendedOnly(!liveRecommendedOnly)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors',
                      liveRecommendedOnly ? 'bg-brand text-white border-brand' : 'bg-gold/15 text-gold-deep border-gold/30 hover:bg-gold/25'
                    )}
                  >
                    <Target className="w-3.5 h-3.5" /> Recommended only
                  </button>
                )}
              </div>

              {liveSearched && !liveLoading && (
                <p className="text-xs text-muted">
                  {liveTotal.toLocaleString()} live openings from H-1B sponsors
                  {liveQuery && ` matching "${liveQuery}"`}
                </p>
              )}
            </form>

            {liveLoading && (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {!liveLoading && displayedListings.length === 0 && liveSearched && (
              <div className="text-center py-16 bg-paper-raised rounded-2xl border border-line">
                <Briefcase className="w-10 h-10 text-line mx-auto mb-3" />
                <p className="font-semibold text-ink-soft mb-1">
                  {liveRecommendedOnly ? 'No matches on this page' : 'No live openings found'}
                </p>
                <p className="text-sm text-muted mb-4">
                  {liveRecommendedOnly
                    ? 'Try loading more results, or turn off "Recommended only"'
                    : 'Try a different keyword or check back after the next scrape'}
                </p>
                <button onClick={() => {
                  setLiveInput(''); setLiveLocation('')
                  setLiveEmploymentType(''); setLiveExperienceLevel(''); setLiveMinWage(''); setLiveMaxWage('')
                  setLivePostedWithin(''); setLiveRecommendedOnly(false)
                  fetchListings('', '', 0)
                }}
                  className="text-sm text-brand hover:underline font-medium">
                  Show all openings
                </button>
              </div>
            )}

            {!liveLoading && displayedListings.length > 0 && (
              <div className="space-y-3">
                {displayedListings.map(l => <ListingCard key={l.id} listing={l} />)}
                {liveOffset + LIMIT < liveTotal && (
                  <button
                    onClick={() => fetchListings(liveQuery, liveLocation, liveOffset + LIMIT)}
                    className="w-full py-3 bg-paper-raised border border-line hover:border-brand hover:text-brand text-ink-soft text-sm font-semibold rounded-xl transition-all">
                    Load more ({liveTotal - liveOffset - LIMIT} remaining)
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* ── H-1B Sponsors Tab ── */}
        {tab === 'h1b' && (
          <>
            <form onSubmit={handleSubmit} className="relative mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => { setInputValue(e.target.value); setShowSuggestions(true) }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder="e.g. Software Engineer, Data Scientist, Nurse..."
                    className="w-full pl-11 pr-4 py-3.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-paper-raised"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-paper-raised border border-line rounded-xl shadow-xl z-20 overflow-hidden">
                      {suggestions.map(s => (
                        <button key={s.title} type="button"
                          onMouseDown={() => handleSuggestion(s.title)}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-brand/10 text-left transition-colors">
                          <span className="text-sm text-ink font-medium">{s.title}</span>
                          <span className="text-xs text-muted">{s.company_count} companies</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit"
                  className="px-6 py-3.5 bg-brand hover:bg-brand-deep text-white font-bold rounded-xl text-sm transition-colors">
                  Search
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button type="button" onClick={() => setEverifyOnly(!everifyOnly)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                    everifyOnly ? 'bg-brand text-white border-brand' : 'bg-paper-raised text-ink-soft border-line hover:border-line')}>
                  <CheckCircle className="w-3.5 h-3.5" /> E-Verify enrolled only
                </button>
                {hasSearched && (
                  <span className="text-xs text-muted">
                    {loading ? 'Searching…' : `${total.toLocaleString()} results for "${query}"`}
                  </span>
                )}
              </div>
            </form>

            {!hasSearched && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-brand" />
                  <p className="text-sm font-bold text-ink-soft">Popular roles with H-1B sponsorship</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_ROLES.map(role => (
                    <button key={role} onClick={() => handleSuggestion(role)}
                      className="px-4 py-2 bg-paper-raised border border-line hover:border-brand hover:text-brand hover:bg-brand/10 text-ink-soft text-sm font-medium rounded-xl transition-all shadow-sm">
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {!loading && hasSearched && jobs.length === 0 && (
              <div className="text-center py-16 bg-paper-raised rounded-2xl border border-line">
                <Building2 className="w-10 h-10 text-line mx-auto mb-3" />
                <p className="font-semibold text-ink-soft mb-1">No H-1B data for &ldquo;{query}&rdquo;</p>
                <p className="text-sm text-muted mb-4">Try a slightly different title</p>
                <button onClick={() => { setHasSearched(false); setInputValue('') }}
                  className="text-sm text-brand hover:underline font-medium">← Try another role</button>
              </div>
            )}

            {!loading && jobs.length > 0 && (
              <div className="space-y-3">
                {jobs.map((job, i) => (
                  <JobCard key={`${job.company_id}-${job.job_title}-${i}`} job={job} onLogApp={setLogJob} />
                ))}
                {offset + LIMIT < total && (
                  <button onClick={() => doSearch(query, offset + LIMIT)}
                    className="w-full py-3 bg-paper-raised border border-line hover:border-brand hover:text-brand text-ink-soft text-sm font-semibold rounded-xl transition-all">
                    Load more ({total - offset - LIMIT} remaining)
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {logJob && (
        <LogAppModal job={logJob} onClose={() => setLogJob(null)}
          onDone={() => { setLogSuccess(true); setLogJob(null); setTimeout(() => setLogSuccess(false), 3000) }} />
      )}

      {logSuccess && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 bg-brand text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">Application logged!</span>
          <Link href="/applications" className="text-sm underline ml-1">View →</Link>
        </div>
      )}
    </div>
  )
}
