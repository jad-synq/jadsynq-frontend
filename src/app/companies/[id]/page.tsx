'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle, CheckCircle2, XCircle, TrendingUp,
  DollarSign, Building2, MapPin, Briefcase, Bookmark, BookmarkCheck,
  ThumbsUp, Globe, ExternalLink, Plus, BookOpen, Flame, Lightbulb
} from 'lucide-react'
import { isAxiosError } from 'axios'
import { getCompanyCached, getCompanyH1B, saveCompany, unsaveCompany, getSavedCompanies, submitOPTReport, getJobListings, createApplication, CompanyProfile, H1BYearSummary, JobListingResult, HiringActivity } from '@/lib/api'
import { formatWage, formatApprovalRate, cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import CompanyLogo, { linkedinCompanyUrl, careersUrl } from '@/components/ui/CompanyLogo'
import { SkeletonHero, SkeletonStat, SkeletonCard, Skeleton, Sparkline } from '@/components/ui/Skeleton'

const COMPANY_SIZE_LABEL: Record<string, string> = {
  startup: 'Startup',
  small_medium: '50-500 employees',
  medium_large: '500-5K employees',
  mnc: '5K+ employees (MNC)',
}

const HIRING_ACTIVITY_LABEL: Record<HiringActivity, string> = {
  actively_hiring: 'Actively hiring',
  moderate: 'Hiring at a steady pace',
  slow: 'Slow hiring',
  no_recent_activity: 'No active job postings',
}

const HIRING_ACTIVITY_STYLE: Record<HiringActivity, string> = {
  actively_hiring: 'bg-brand/10 text-brand-deep border-brand/20',
  moderate: 'bg-blue-50 text-blue-700 border-blue-100',
  slow: 'bg-amber-50 text-amber-700 border-amber-100',
  no_recent_activity: 'bg-paper text-muted border-line',
}

function OpenPositions({ listings, companyName, user, onAuth }: {
  listings: JobListingResult[]
  companyName: string
  user: import('@supabase/supabase-js').User | null
  onAuth: () => void
}) {
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set())
  const [loggingId, setLoggingId] = useState<string | null>(null)

  const handleLog = async (job: JobListingResult) => {
    if (!user) { onAuth(); return }
    setLoggingId(job.id)
    try {
      await createApplication({
        company_name: companyName, company_id: job.company_id,
        job_title: job.title, job_url: job.url,
        status: 'applied', applied_date: new Date().toISOString().split('T')[0],
      })
      setLoggedIds(prev => new Set([...prev, job.id]))
    } catch { /* ignore */ } finally { setLoggingId(null) }
  }

  const timeAgo = (iso: string | null) => {
    if (!iso) return null
    const diff = Date.now() - new Date(iso).getTime()
    const d = Math.floor(diff / 86400000)
    if (d === 0) return 'today'
    if (d === 1) return 'yesterday'
    if (d < 30) return `${d}d ago`
    if (d < 365) return `${Math.floor(d / 30)}mo ago`
    return `${Math.floor(d / 365)}y ago`
  }

  return (
    <div className="bg-paper-raised rounded-2xl border border-line p-6 mb-4">
      <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
        <div className="w-7 h-7 bg-brand/10 rounded-lg flex items-center justify-center">
          <Briefcase className="w-3.5 h-3.5 text-brand" />
        </div>
        Open Positions
        <span className="text-sm font-normal text-muted ml-1">({listings.length})</span>
      </h2>
      <div className="divide-y divide-gray-50">
        {listings.map(job => {
          const posted = timeAgo(job.posted_at)
          const isLogged = loggedIds.has(job.id)
          const isLogging = loggingId === job.id
          return (
            <div key={job.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink text-sm leading-tight">{job.title}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {job.location && (
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </span>
                    )}
                    {job.department && (
                      <span className="text-xs text-muted">{job.department}</span>
                    )}
                    {job.avg_wage && (
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <DollarSign className="w-3 h-3" /> {job.avg_wage >= 1000 ? `$${Math.round(job.avg_wage / 1000)}k` : `$${Math.round(job.avg_wage)}`} avg
                      </span>
                    )}
                    {posted && <span className="text-xs text-muted">{posted}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleLog(job)} disabled={isLogging || isLogged}
                    className={cn('flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-60',
                      isLogged ? 'bg-brand/10 text-brand-deep border-brand/30' : 'bg-paper hover:bg-line text-ink-soft border-line')}>
                    {isLogged ? <><CheckCircle2 className="w-3 h-3" /> Logged</> : <><Plus className="w-3 h-3" /> Log</>}
                  </button>
                  <a href={job.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-brand hover:bg-brand-deep text-white rounded-lg transition-colors">
                    Apply <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CompanyPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user } = useAuth()

  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [h1bHistory, setH1bHistory] = useState<H1BYearSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [optSubmitted, setOptSubmitted] = useState(false)
  const [optLoading, setOptLoading] = useState(false)
  const [listings, setListings] = useState<JobListingResult[]>([])
  const [listingsLoaded, setListingsLoaded] = useState(false)

  useEffect(() => {
    if (!user) { setIsSaved(false); return }
    getSavedCompanies()
      .then(res => setIsSaved(res.data.some(c => c.company_id === id)))
      .catch(() => setIsSaved(false))
  }, [user, id])

  const toggleSave = async () => {
    if (!user) { router.push('/auth'); return }
    setSaveLoading(true)
    try {
      if (isSaved) { await unsaveCompany(id); setIsSaved(false) }
      else { await saveCompany(id); setIsSaved(true) }
    } catch { /* ignore */ } finally { setSaveLoading(false) }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, h1bRes] = await Promise.all([getCompanyCached(id), getCompanyH1B(id)])
        setCompany(companyRes.data)
        setH1bHistory(h1bRes.data)
      } catch (err) {
        setError(isAxiosError(err) && err.response?.status === 404 ? 'Company not found' : 'Something went wrong.')
      } finally { setLoading(false) }
    }
    fetchData()
  }, [id])

  useEffect(() => {
    getJobListings({ company_id: id, limit: 20 })
      .then(res => setListings(res.data.listings))
      .catch(() => {})
      .finally(() => setListingsLoaded(true))
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-paper">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-5 w-16" />
          <SkeletonHero />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
          </div>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </main>
    )
  }

  if (error || !company) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted text-lg">{error || 'Company not found'}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">Back to search</Link>
        </div>
      </main>
    )
  }

  const isEnrolled = company.everify?.status === 'enrolled'

  const handleOPTReport = async (supportsOpt: boolean, supportsStemOpt: boolean) => {
    if (!user) { router.push('/auth'); return }
    setOptLoading(true)
    try {
      await submitOPTReport(id, { supports_opt: supportsOpt, supports_stem_opt: supportsStemOpt })
      setOptSubmitted(true)
    } catch { /* ignore */ } finally { setOptLoading(false) }
  }

  const maxPetitions = h1bHistory.length > 0 ? Math.max(...h1bHistory.map(y => y.petitions)) : 0

  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-ink-soft mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Hero header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-4 text-white relative overflow-hidden">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}} />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <CompanyLogo
                logoUrl={company.logo_url}
                domain={company.domain}
                name={company.legal_name}
                size="lg"
                className="shadow-lg"
              />
              <div>
                <h1 className="font-display text-2xl font-bold text-white leading-tight">{company.legal_name}</h1>
                {company.dba_name && <p className="text-slate-300 text-sm mt-0.5">DBA: {company.dba_name}</p>}
                {company.industry && <p className="text-slate-400 text-xs mt-1">{company.industry}</p>}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                    isEnrolled ? 'bg-brand/20 text-[#8fd9ae] border border-brand/40' : 'bg-slate-600 text-slate-300'
                  )}>
                    {isEnrolled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {isEnrolled ? 'E-Verify Enrolled' : 'Not E-Verify'}
                  </span>
                  {company.ein && <span className="text-xs text-slate-400">EIN: {company.ein}</span>}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={toggleSave}
                disabled={saveLoading}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50',
                  isSaved ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                )}
              >
                {isSaved ? <><BookmarkCheck className="w-4 h-4" /> Saved</> : <><Bookmark className="w-4 h-4" /> Save</>}
              </button>
              <button
                onClick={() => {
                  if (!user) { router.push('/auth'); return }
                  router.push(`/applications?prefill=${encodeURIComponent(company.legal_name)}`)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Log App
              </button>
              <Link
                href={`/interview-prep?role=${encodeURIComponent(company.legal_name)}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" /> Prep for Interview
              </Link>
            </div>
          </div>

          {/* External links */}
          <div className="relative flex items-center gap-3 mt-4 pt-4 border-t border-white/10 flex-wrap">
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors">
                <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
            <a href={careersUrl(company.careers_url, company.legal_name)} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm bg-gold/20 text-[#f2cd8a] hover:text-gold px-3 py-1 rounded-lg border border-gold/40 transition-colors">
              <Briefcase className="w-4 h-4" /> Careers <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href={linkedinCompanyUrl(company.domain, company.legal_name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg border transition-colors"
              style={{ background: 'rgba(10,102,194,0.15)', borderColor: 'rgba(10,102,194,0.35)', color: '#93c5fd' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(10,102,194,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(10,102,194,0.15)')}
            >
              {/* LinkedIn icon */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Enrichment badges */}
        {(company.is_public !== null || company.employee_count || company.funding_stage ||
          company.founded_year || company.incorporation_state || company.sic_description) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {company.is_public && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                <TrendingUp className="w-3 h-3" /> Publicly Traded
              </span>
            )}
            {company.funding_stage && !company.is_public && (
              <span className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border',
                company.funding_stage.toLowerCase().includes('seed') ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                company.funding_stage.toLowerCase().includes('series') ? 'bg-purple-50 text-purple-700 border-purple-100' :
                'bg-slate-50 text-slate-600 border-slate-100'
              )}>
                {company.funding_stage}
              </span>
            )}
            {company.employee_count && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-paper text-ink-soft border border-line">
                {company.employee_count >= 10000
                  ? `${Math.round(company.employee_count / 1000)}k+ employees`
                  : company.employee_count >= 1000
                  ? `${(company.employee_count / 1000).toFixed(1)}k employees`
                  : `${company.employee_count.toLocaleString()} employees`}
              </span>
            )}
            {company.company_size && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gold/15 text-gold-deep border border-gold/30">
                {COMPANY_SIZE_LABEL[company.company_size]}
              </span>
            )}
            {company.hiring_activity && (
              <span className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border', HIRING_ACTIVITY_STYLE[company.hiring_activity])}>
                {company.hiring_activity === 'actively_hiring' && <Flame className="w-3 h-3" />}
                {HIRING_ACTIVITY_LABEL[company.hiring_activity]}
                {company.open_jobs_count > 0 && ` (${company.open_jobs_count})`}
              </span>
            )}
            {company.total_funding_usd && !company.is_public && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand/10 text-brand-deep border border-brand/20">
                <DollarSign className="w-3 h-3" />
                {company.total_funding_usd >= 1_000_000_000
                  ? `$${(company.total_funding_usd / 1e9).toFixed(1)}B raised`
                  : `$${Math.round(company.total_funding_usd / 1e6)}M raised`}
              </span>
            )}
            {company.founded_year && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-paper text-ink-soft border border-line">
                Est. {company.founded_year}
              </span>
            )}
            {company.incorporation_state && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-paper text-ink-soft border border-line">
                <MapPin className="w-3 h-3" /> Inc. in {company.incorporation_state}
              </span>
            )}
            {company.sic_description && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {company.sic_description}
              </span>
            )}
          </div>
        )}

        {/* Stats grid */}
        {company.h1b_summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-paper-raised rounded-2xl border border-line p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-xs text-muted font-medium">H-1B last year</span>
                </div>
                {h1bHistory.length >= 2 && (
                  <Sparkline data={h1bHistory.slice().reverse().map(y => y.petitions)} width={48} height={20} />
                )}
              </div>
              <p className="text-2xl font-bold text-ink">
                {company.h1b_summary.total_petitions_last_year.toLocaleString()}
              </p>
            </div>

            <div className="bg-paper-raised rounded-2xl border border-line p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center',
                  company.h1b_summary.approval_rate >= 0.95 ? 'bg-brand/10' :
                  company.h1b_summary.approval_rate >= 0.8 ? 'bg-yellow-50' : 'bg-red-50'
                )}>
                  <CheckCircle className={cn(
                    'w-3.5 h-3.5',
                    company.h1b_summary.approval_rate >= 0.95 ? 'text-brand' :
                    company.h1b_summary.approval_rate >= 0.8 ? 'text-yellow-600' : 'text-red-600'
                  )} />
                </div>
                <span className="text-xs text-muted font-medium">Approval rate</span>
              </div>
              <p className={cn(
                'text-2xl font-bold',
                company.h1b_summary.approval_rate >= 0.95 ? 'text-brand' :
                company.h1b_summary.approval_rate >= 0.8 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {formatApprovalRate(company.h1b_summary.approval_rate)}
              </p>
            </div>

            <div className="bg-paper-raised rounded-2xl border border-line p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <span className="text-xs text-muted font-medium">Avg wage</span>
              </div>
              <p className="text-2xl font-bold text-ink">{formatWage(company.h1b_summary.avg_wage)}</p>
            </div>

            <div className="bg-paper-raised rounded-2xl border border-line p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <span className="text-xs text-muted font-medium">Top roles</span>
              </div>
              <div className="space-y-0.5">
                {company.h1b_summary.top_job_titles.slice(0, 2).map((t, i) => (
                  <p key={i} className="text-xs text-ink-soft truncate font-medium">{t}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* E-Verify details */}
        {company.everify && (
          <div className="bg-paper-raised rounded-2xl border border-line p-6 mb-4">
            <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <div className="w-7 h-7 bg-brand/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-brand" />
              </div>
              E-Verify Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-paper rounded-xl p-3">
                <p className="text-xs text-muted mb-1">Status</p>
                <p className={cn('font-semibold capitalize', isEnrolled ? 'text-brand-deep' : 'text-ink-soft')}>{company.everify.status}</p>
              </div>
              {company.everify.enrollment_date && (
                <div className="bg-paper rounded-xl p-3">
                  <p className="text-xs text-muted mb-1">Enrolled since</p>
                  <p className="font-semibold text-ink">{company.everify.enrollment_date}</p>
                </div>
              )}
              {company.everify.workforce_size && (
                <div className="bg-paper rounded-xl p-3">
                  <p className="text-xs text-muted mb-1">Workforce</p>
                  <p className="font-semibold text-ink">{company.everify.workforce_size}</p>
                </div>
              )}
              <div className="bg-paper rounded-xl p-3">
                <p className="text-xs text-muted mb-1">Federal contractor</p>
                <p className={cn('font-semibold', company.everify.is_federal_contractor ? 'text-blue-700' : 'text-ink-soft')}>
                  {company.everify.is_federal_contractor ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            {company.everify.hiring_states.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Hiring states</p>
                <div className="flex flex-wrap gap-1.5">
                  {company.everify.hiring_states.map(state => (
                    <span key={state} className="px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-700">
                      {state}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* H-1B history with bar chart */}
        {h1bHistory.length > 0 && (
          <div className="bg-paper-raised rounded-2xl border border-line p-6 mb-4">
            <h2 className="font-semibold text-ink mb-5 flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              </div>
              H-1B Filing History
            </h2>

            {/* Mini bar chart */}
            <div className="flex items-end gap-1.5 h-16 mb-5">
              {h1bHistory.slice().reverse().map(year => (
                <div key={year.fiscal_year} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors cursor-default"
                    style={{ height: `${maxPetitions > 0 ? Math.max(4, (year.petitions / maxPetitions) * 52) : 4}px` }}
                    title={`FY${year.fiscal_year}: ${year.petitions.toLocaleString()} petitions`}
                  />
                  <span className="text-[9px] text-muted leading-none">{String(year.fiscal_year).slice(-2)}</span>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted text-xs border-b border-line">
                    <th className="pb-2 font-medium">Year</th>
                    <th className="pb-2 font-medium">Petitions</th>
                    <th className="pb-2 font-medium text-brand">Certified</th>
                    <th className="pb-2 font-medium text-red-500">Denied</th>
                    <th className="pb-2 font-medium">Avg Wage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {h1bHistory.map(year => (
                    <tr key={year.fiscal_year} className="text-ink-soft hover:bg-paper/50 transition-colors">
                      <td className="py-2.5 font-semibold text-ink">FY{year.fiscal_year}</td>
                      <td className="py-2.5 font-medium">{year.petitions.toLocaleString()}</td>
                      <td className="py-2.5 text-brand font-medium">{year.certified.toLocaleString()}</td>
                      <td className="py-2.5 text-red-500">{year.denied.toLocaleString()}</td>
                      <td className="py-2.5 text-muted">{formatWage(year.avg_wage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Application strategy */}
        {company.application_strategy.length > 0 && (
          <div className="bg-paper-raised rounded-2xl border border-line p-6 mb-4">
            <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <div className="w-7 h-7 bg-gold/15 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-gold-deep" />
              </div>
              How to Apply Here
            </h2>
            <ul className="space-y-2.5">
              {company.application_strategy.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-ink-soft leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Open Positions */}
        {listingsLoaded && listings.length > 0 && (
          <OpenPositions listings={listings} companyName={company.legal_name} user={user} onAuth={() => router.push('/auth')} />
        )}

        {/* OPT report */}
        <div className="bg-paper-raised rounded-2xl border border-line p-6">
          <h2 className="font-semibold text-ink mb-1 flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-3.5 h-3.5 text-amber-600" />
            </div>
            OPT / STEM OPT Support
          </h2>
          <p className="text-sm text-muted mb-4">Has this company sponsored OPT or STEM OPT? Help others by sharing what you know.</p>
          {optSubmitted ? (
            <div className="flex items-center gap-2 text-sm text-brand-deep bg-brand/10 rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4" /> Thank you for your report!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleOPTReport(true, true)} disabled={optLoading}
                className="px-4 py-2 text-sm font-medium bg-brand/10 text-brand-deep rounded-xl hover:bg-brand/15 disabled:opacity-50 transition-colors border border-brand/20">
                ✅ Supports OPT + STEM OPT
              </button>
              <button onClick={() => handleOPTReport(true, false)} disabled={optLoading}
                className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 disabled:opacity-50 transition-colors border border-blue-100">
                👍 OPT only
              </button>
              <button onClick={() => handleOPTReport(false, false)} disabled={optLoading}
                className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors border border-red-100">
                ❌ Does not support
              </button>
              {!user && (
                <p className="w-full text-xs text-muted mt-1">
                  <Link href="/auth" className="text-blue-600 hover:underline">Sign in</Link> to submit a report
                </p>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Data disclaimer */}
      <div className="mt-6 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 leading-relaxed">
        <strong>Data disclaimer:</strong> H-1B and E-Verify data is sourced from public U.S. government filings.
        Past sponsorship history does not guarantee future sponsorship.{' '}
        <Link href="/disclaimer" className="underline hover:text-amber-900">Learn more</Link>
      </div>

    </main>
  )
}
