'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle, XCircle, TrendingUp,
  DollarSign, Building2, MapPin, Briefcase, Bookmark, BookmarkCheck,
  ThumbsUp, Globe, ExternalLink, Plus
} from 'lucide-react'
import { isAxiosError } from 'axios'
import { getCompanyCached, getCompanyH1B, saveCompany, unsaveCompany, getSavedCompanies, submitOPTReport, CompanyProfile, H1BYearSummary } from '@/lib/api'
import { formatWage, formatApprovalRate, cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-24" />
          <div className="h-36 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
        </div>
      </main>
    )
  }

  if (error || !company) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">{error || 'Company not found'}</p>
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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Hero header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-4 text-white relative overflow-hidden">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}} />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
                {company.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logo_url} alt={company.legal_name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">{company.legal_name}</h1>
                {company.dba_name && <p className="text-slate-300 text-sm mt-0.5">DBA: {company.dba_name}</p>}
                {company.industry && <p className="text-slate-400 text-xs mt-1">{company.industry}</p>}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                    isEnrolled ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-slate-600 text-slate-300'
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
            </div>
          </div>

          {/* External links */}
          <div className="relative flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors">
                <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
            {company.careers_url && (
              <a href={company.careers_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 px-3 py-1 rounded-lg border border-emerald-500/30 transition-colors">
                <Briefcase className="w-4 h-4" /> Careers Page <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>
        </div>

        {/* Stats grid */}
        {company.h1b_summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">H-1B last year</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {company.h1b_summary.total_petitions_last_year.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center',
                  company.h1b_summary.approval_rate >= 0.95 ? 'bg-green-50' :
                  company.h1b_summary.approval_rate >= 0.8 ? 'bg-yellow-50' : 'bg-red-50'
                )}>
                  <CheckCircle className={cn(
                    'w-3.5 h-3.5',
                    company.h1b_summary.approval_rate >= 0.95 ? 'text-green-600' :
                    company.h1b_summary.approval_rate >= 0.8 ? 'text-yellow-600' : 'text-red-600'
                  )} />
                </div>
                <span className="text-xs text-gray-500 font-medium">Approval rate</span>
              </div>
              <p className={cn(
                'text-2xl font-bold',
                company.h1b_summary.approval_rate >= 0.95 ? 'text-green-600' :
                company.h1b_summary.approval_rate >= 0.8 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {formatApprovalRate(company.h1b_summary.approval_rate)}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">Avg wage</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatWage(company.h1b_summary.avg_wage)}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">Top roles</span>
              </div>
              <div className="space-y-0.5">
                {company.h1b_summary.top_job_titles.slice(0, 2).map((t, i) => (
                  <p key={i} className="text-xs text-gray-700 truncate font-medium">{t}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* E-Verify details */}
        {company.everify && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-green-600" />
              </div>
              E-Verify Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className={cn('font-semibold capitalize', isEnrolled ? 'text-green-700' : 'text-gray-700')}>{company.everify.status}</p>
              </div>
              {company.everify.enrollment_date && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Enrolled since</p>
                  <p className="font-semibold text-gray-900">{company.everify.enrollment_date}</p>
                </div>
              )}
              {company.everify.workforce_size && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Workforce</p>
                  <p className="font-semibold text-gray-900">{company.everify.workforce_size}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Federal contractor</p>
                <p className={cn('font-semibold', company.everify.is_federal_contractor ? 'text-blue-700' : 'text-gray-700')}>
                  {company.everify.is_federal_contractor ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            {company.everify.hiring_states.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Hiring states</p>
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
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
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
                  <span className="text-[9px] text-gray-400 leading-none">{String(year.fiscal_year).slice(-2)}</span>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                    <th className="pb-2 font-medium">Year</th>
                    <th className="pb-2 font-medium">Petitions</th>
                    <th className="pb-2 font-medium text-green-600">Certified</th>
                    <th className="pb-2 font-medium text-red-500">Denied</th>
                    <th className="pb-2 font-medium">Avg Wage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {h1bHistory.map(year => (
                    <tr key={year.fiscal_year} className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 font-semibold text-gray-900">FY{year.fiscal_year}</td>
                      <td className="py-2.5 font-medium">{year.petitions.toLocaleString()}</td>
                      <td className="py-2.5 text-green-600 font-medium">{year.certified.toLocaleString()}</td>
                      <td className="py-2.5 text-red-500">{year.denied.toLocaleString()}</td>
                      <td className="py-2.5 text-gray-500">{formatWage(year.avg_wage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OPT report */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-3.5 h-3.5 text-amber-600" />
            </div>
            OPT / STEM OPT Support
          </h2>
          <p className="text-sm text-gray-500 mb-4">Has this company sponsored OPT or STEM OPT? Help others by sharing what you know.</p>
          {optSubmitted ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4" /> Thank you for your report!
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleOPTReport(true, true)} disabled={optLoading}
                className="px-4 py-2 text-sm font-medium bg-green-50 text-green-700 rounded-xl hover:bg-green-100 disabled:opacity-50 transition-colors border border-green-100">
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
                <p className="w-full text-xs text-gray-400 mt-1">
                  <Link href="/auth" className="text-blue-600 hover:underline">Sign in</Link> to submit a report
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
