'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, CheckCircle, TrendingUp, DollarSign, Building2,
  Briefcase, ExternalLink, Plus, ChevronRight, Bookmark,
  BookmarkCheck, Sparkles, X
} from 'lucide-react'
import { searchJobs, getJobTitleSuggestions, createApplication, saveCompany, unsaveCompany, JobRoleResult, JobTitleSuggestion } from '@/lib/api'
import CompanyLogo from '@/components/ui/CompanyLogo'
import { isAxiosError } from 'axios'
import { formatWage, formatApprovalRate, cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const POPULAR_ROLES = [
  'Software Engineer', 'Data Engineer', 'Data Scientist',
  'Machine Learning Engineer', 'Product Manager', 'Business Analyst',
  'Financial Analyst', 'Accountant', 'Mechanical Engineer',
  'Electrical Engineer', 'Civil Engineer', 'Nurse',
]

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

  const handleLogApp = () => {
    if (!user) { router.push('/auth'); return }
    onLogApp(job)
  }

  const indeedUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(job.job_title + ' ' + job.legal_name)}`
  const linkedinUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.job_title)}&company=${encodeURIComponent(job.legal_name)}`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all p-5">
      <div className="flex items-start gap-4">
        {/* Logo */}
        <CompanyLogo
          logoUrl={job.logo_url}
          domain={job.domain}
          name={job.legal_name}
          size="lg"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base truncate">{job.job_title}</h3>
              <Link href={`/companies/${job.company_id}`}
                className="text-sm text-[#16a34a] hover:underline font-semibold mt-0.5 inline-block">
                {job.legal_name}
              </Link>
            </div>
            <button onClick={handleSave} disabled={saveLoading}
              className={cn('p-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-40',
                saved ? 'text-[#16a34a] bg-green-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50')}>
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              <TrendingUp className="w-3 h-3" /> {job.petitions.toLocaleString()} H-1B petitions
            </span>
            {job.approval_rate !== null && (
              <span className={cn(
                'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border',
                job.approval_rate >= 0.95 ? 'text-green-700 bg-green-50 border-green-100' :
                job.approval_rate >= 0.8 ? 'text-yellow-700 bg-yellow-50 border-yellow-100' :
                'text-red-600 bg-red-50 border-red-100'
              )}>
                <CheckCircle className="w-3 h-3" /> {formatApprovalRate(job.approval_rate)} approval
              </span>
            )}
            {job.avg_wage && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                <DollarSign className="w-3 h-3" /> {formatWage(job.avg_wage)} avg
              </span>
            )}
            {isEnrolled && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle className="w-3 h-3" /> E-Verify
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleLogApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Log Application
            </button>
            {job.careers_url && (
              <a href={job.careers_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors">
                <Briefcase className="w-3.5 h-3.5" /> Careers Page <ExternalLink className="w-3 h-3" />
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
            <Link href={`/companies/${job.company_id}`}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-400 hover:text-gray-600 text-xs transition-colors">
              View company <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function LogAppModal({ job, onClose, onDone }: {
  job: JobRoleResult
  onClose: () => void
  onDone: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLog = async () => {
    setLoading(true)
    setError(null)
    try {
      await createApplication({
        company_name: job.legal_name,
        company_id: job.company_id,
        job_title: job.job_title,
        status: 'applied',
        applied_date: new Date().toISOString().split('T')[0],
      })
      onDone()
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        onClose()
        router.push('/auth')
        return
      }
      setError(
        isAxiosError(err) && err.response?.data?.detail
          ? String(err.response.data.detail)
          : 'Failed to log application. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Log Application</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-100">
          <p className="font-semibold text-gray-900">{job.job_title}</p>
          <p className="text-sm text-[#16a34a] font-medium mt-0.5">{job.legal_name}</p>
          {job.approval_rate !== null && (
            <p className="text-xs text-gray-500 mt-1">
              {formatApprovalRate(job.approval_rate)} H-1B approval rate · {job.petitions.toLocaleString()} petitions
            </p>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          This will add an entry to your Applications tracker with status &ldquo;Applied&rdquo;.
        </p>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex gap-2">
          <button onClick={handleLog} disabled={loading}
            className="flex-1 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Logging…' : '✓ Log as Applied'}
          </button>
          <button onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-xl transition-colors">
            Cancel
          </button>
        </div>
        <Link href="/applications"
          className="block text-center text-xs text-[#16a34a] hover:underline mt-3">
          View all applications →
        </Link>
      </div>
    </div>
  )
}

export default function JobsPage() {
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

  // Load popular titles on mount
  useEffect(() => {
    getJobTitleSuggestions('').then(res => setSuggestions(res.data)).catch(() => {})
  }, [])

  // Autocomplete
  useEffect(() => {
    if (!inputValue.trim() || inputValue.length < 2) return
    const t = setTimeout(() => {
      getJobTitleSuggestions(inputValue)
        .then(res => setSuggestions(res.data))
        .catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [inputValue])

  const doSearch = async (title: string, newOffset = 0) => {
    setLoading(true)
    setHasSearched(true)
    setShowSuggestions(false)
    try {
      const res = await searchJobs({ title, everify_only: everifyOnly, limit: LIMIT, offset: newOffset })
      setJobs(res.data.jobs)
      setTotal(res.data.total)
      setOffset(newOffset)
    } catch { setJobs([]) } finally { setLoading(false) }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    setQuery(inputValue)
    doSearch(inputValue)
  }

  const handleSuggestion = (title: string) => {
    setInputValue(title)
    setQuery(title)
    doSearch(title)
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-[#16a34a] rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Roles</h1>
              <p className="text-sm text-gray-500">Find companies that sponsored H-1B for your target role</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Search */}
        <form onSubmit={handleSubmit} className="relative mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="e.g. Software Engineer, Data Scientist, Nurse..."
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-white"
              />
              {/* Autocomplete dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden">
                  {suggestions.map(s => (
                    <button key={s.title} type="button"
                      onMouseDown={() => handleSuggestion(s.title)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-green-50 text-left transition-colors">
                      <span className="text-sm text-gray-900 font-medium">{s.title}</span>
                      <span className="text-xs text-gray-400">{s.company_count} companies</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="submit"
              className="px-6 py-3.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-xl text-sm transition-colors">
              Search
            </button>
          </div>

          {/* E-Verify toggle */}
          <div className="flex items-center gap-3 mt-3">
            <button type="button" onClick={() => setEverifyOnly(!everifyOnly)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                everifyOnly ? 'bg-[#16a34a] text-white border-[#16a34a]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}>
              <CheckCircle className="w-3.5 h-3.5" /> E-Verify enrolled only
            </button>
            {hasSearched && (
              <span className="text-xs text-gray-400">
                {loading ? 'Searching…' : `${total.toLocaleString()} results for "${query}"`}
              </span>
            )}
          </div>
        </form>

        {/* Popular roles (before search) */}
        {!hasSearched && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#16a34a]" />
              <p className="text-sm font-bold text-gray-700">Popular roles with H-1B sponsorship</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROLES.map(role => (
                <button key={role} onClick={() => handleSuggestion(role)}
                  className="px-4 py-2 bg-white border border-gray-200 hover:border-[#16a34a] hover:text-[#16a34a] hover:bg-green-50 text-gray-600 text-sm font-medium rounded-xl transition-all shadow-sm">
                  {role}
                </button>
              ))}
            </div>

            {/* How it works */}
            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {[
                { icon: <Search className="w-5 h-5 text-[#16a34a]" />, title: 'Search any role', desc: 'Type a job title to see every company that filed H-1B petitions for that role' },
                { icon: <TrendingUp className="w-5 h-5 text-blue-500" />, title: 'Real petition data', desc: 'See approval rates, petition counts, and average wages from government filings' },
                { icon: <Briefcase className="w-5 h-5 text-purple-500" />, title: 'Log & track', desc: 'One-click to add any role to your Applications tracker' },
              ].map(item => (
                <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center mb-3">{item.icon}</div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-36" />
            ))}
          </div>
        )}

        {!loading && hasSearched && jobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-1">No H-1B sponsorship data for &ldquo;{query}&rdquo;</p>
            <p className="text-sm text-gray-400 mb-4">Try a slightly different title, e.g. &ldquo;Software Developer&rdquo;</p>
            <button onClick={() => { setHasSearched(false); setInputValue('') }}
              className="text-sm text-[#16a34a] hover:underline font-medium">
              ← Try another role
            </button>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map((job, i) => (
              <JobCard key={`${job.company_id}-${job.job_title}-${i}`} job={job} onLogApp={setLogJob} />
            ))}

            {/* Load more */}
            {offset + LIMIT < total && (
              <button
                onClick={() => doSearch(query, offset + LIMIT)}
                className="w-full py-3 bg-white border border-gray-200 hover:border-[#16a34a] hover:text-[#16a34a] text-gray-600 text-sm font-semibold rounded-xl transition-all">
                Load more ({total - offset - LIMIT} remaining)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Log App modal */}
      {logJob && !logSuccess && (
        <LogAppModal
          job={logJob}
          onClose={() => setLogJob(null)}
          onDone={() => { setLogSuccess(true); setLogJob(null); setTimeout(() => setLogSuccess(false), 3000) }}
        />
      )}

      {/* Success toast */}
      {logSuccess && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 bg-[#16a34a] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-in">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">Application logged!</span>
          <Link href="/applications" className="text-sm underline ml-1">View →</Link>
        </div>
      )}
    </div>
  )
}
