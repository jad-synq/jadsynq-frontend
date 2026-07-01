'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle, XCircle, TrendingUp,
  DollarSign, Building2, MapPin, Briefcase, Bookmark, BookmarkCheck
} from 'lucide-react'
import { isAxiosError } from 'axios'
import { getCompany, getCompanyH1B, saveCompany, unsaveCompany, getSavedCompanies, CompanyProfile, H1BYearSummary } from '@/lib/api'
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

  useEffect(() => {
    if (!user) {
      setIsSaved(false)
      return
    }
    getSavedCompanies()
      .then(res => setIsSaved(res.data.some(c => c.company_id === id)))
      .catch(() => setIsSaved(false))
  }, [user, id])

  const toggleSave = async () => {
    if (!user) {
      router.push('/auth')
      return
    }
    setSaveLoading(true)
    try {
      if (isSaved) {
        await unsaveCompany(id)
        setIsSaved(false)
      } else {
        await saveCompany(id)
        setIsSaved(true)
      }
    } catch {
      // silently ignore -- not critical to surface a toast for this yet
    } finally {
      setSaveLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, h1bRes] = await Promise.all([
          getCompany(id),
          getCompanyH1B(id),
        ])
        setCompany(companyRes.data)
        setH1bHistory(h1bRes.data)
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) {
          setError('Company not found')
        } else {
          setError('Something went wrong. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-1/2 mt-4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
              ))}
            </div>
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
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to search
          </Link>
        </div>
      </main>
    )
  }

  const isEnrolled = company.everify?.status === 'enrolled'

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {company.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element -- Clearbit logo URLs are external, next/image requires domain allowlisting
                <img
                  src={company.logo_url}
                  alt={company.legal_name}
                  className="w-14 h-14 rounded-xl object-contain border border-gray-100 bg-white p-1 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.legal_name}</h1>
                {company.dba_name && (
                  <p className="text-gray-500 mt-1">DBA: {company.dba_name}</p>
                )}
                {company.aliases.length > 1 && (
                  <p className="text-sm text-gray-400 mt-1">
                    Also known as: {company.aliases.filter(a => a !== company.legal_name).join(', ')}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      🌐 Website
                    </a>
                  )}
                  {company.careers_url && (
                    <a href={company.careers_url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline flex items-center gap-1">
                      💼 Careers
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                isEnrolled
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-50 text-gray-500"
              )}>
                {isEnrolled
                  ? <><CheckCircle className="w-4 h-4" /> E-Verify Enrolled</>
                  : <><XCircle className="w-4 h-4" /> Not E-Verify Enrolled</>
                }
              </div>
              <button
                onClick={toggleSave}
                disabled={saveLoading}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  "disabled:opacity-50",
                  isSaved
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                )}
              >
                {isSaved
                  ? <><BookmarkCheck className="w-4 h-4" /> Saved</>
                  : <><Bookmark className="w-4 h-4" /> Save</>
                }
              </button>
            </div>
          </div>

          {company.ein && (
            <p className="text-sm text-gray-400 mt-3">EIN: {company.ein}</p>
          )}
        </div>

        {/* Stats grid */}
        {company.h1b_summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">H-1B Petitions (last year)</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {company.h1b_summary.total_petitions_last_year.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Approval Rate</span>
              </div>
              <p className={cn(
                "text-2xl font-bold",
                company.h1b_summary.approval_rate >= 0.95 ? "text-green-600" :
                company.h1b_summary.approval_rate >= 0.80 ? "text-yellow-600" : "text-red-600"
              )}>
                {formatApprovalRate(company.h1b_summary.approval_rate)}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Average Wage</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatWage(company.h1b_summary.avg_wage)}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm">Top Job Titles</span>
              </div>
              <div className="space-y-1 mt-1">
                {company.h1b_summary.top_job_titles.slice(0, 3).map((title, i) => (
                  <p key={i} className="text-sm text-gray-700">{title}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* E-Verify details */}
        {company.everify && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              E-Verify Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium text-gray-900 capitalize">{company.everify.status}</p>
              </div>
              {company.everify.enrollment_date && (
                <div>
                  <p className="text-gray-500">Enrolled Since</p>
                  <p className="font-medium text-gray-900">{company.everify.enrollment_date}</p>
                </div>
              )}
              {company.everify.workforce_size && (
                <div>
                  <p className="text-gray-500">Workforce Size</p>
                  <p className="font-medium text-gray-900">{company.everify.workforce_size}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Federal Contractor</p>
                <p className="font-medium text-gray-900">
                  {company.everify.is_federal_contractor ? 'Yes' : 'No'}
                </p>
              </div>
              {company.everify.hiring_states.length > 0 && (
                <div className="col-span-2">
                  <p className="text-gray-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Hiring States
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {company.everify.hiring_states.map(state => (
                      <span key={state} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-gray-600">
                        {state}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* H-1B yearly history */}
        {h1bHistory.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              H-1B Filing History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Year</th>
                    <th className="pb-2 font-medium">Petitions</th>
                    <th className="pb-2 font-medium">Certified</th>
                    <th className="pb-2 font-medium">Denied</th>
                    <th className="pb-2 font-medium">Avg Wage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {h1bHistory.map(year => (
                    <tr key={year.fiscal_year} className="text-gray-700">
                      <td className="py-2.5 font-medium">FY{year.fiscal_year}</td>
                      <td className="py-2.5">{year.petitions.toLocaleString()}</td>
                      <td className="py-2.5 text-green-600">{year.certified.toLocaleString()}</td>
                      <td className="py-2.5 text-red-500">{year.denied.toLocaleString()}</td>
                      <td className="py-2.5">{formatWage(year.avg_wage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
