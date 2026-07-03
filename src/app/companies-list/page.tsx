'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, Filter, CheckCircle, TrendingUp, DollarSign } from 'lucide-react'
import { getCompanies, CompanyListItem } from '@/lib/api'
import { formatWage, formatApprovalRate, cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'petitions', label: 'H-1B Petitions' },
  { value: 'approval_rate', label: 'Approval Rate' },
  { value: 'avg_wage', label: 'Average Wage' },
  { value: 'name', label: 'Name (A-Z)' },
]

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [sort, setSort] = useState('petitions')
  const [everifyOnly, setEverifyOnly] = useState(false)
  const [h1bOnly, setH1bOnly] = useState(false)

  const PER_PAGE = 20

  const fetchCompanies = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await getCompanies({
        q: query || undefined,
        page: p,
        per_page: PER_PAGE,
        everify_only: everifyOnly,
        h1b_only: h1bOnly,
        sort: sort as 'petitions' | 'approval_rate' | 'avg_wage' | 'name',
      })
      setCompanies(res.data.companies)
      setTotal(res.data.total)
      setPage(p)
    } catch {
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }, [query, sort, everifyOnly, h1bOnly])

  useEffect(() => {
    fetchCompanies(1)
  }, [fetchCompanies])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(inputValue)
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Companies</h1>
          <p className="text-gray-500 text-sm">{total.toLocaleString()} companies with H-1B or E-Verify data</p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search companies..."
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-[#14532d] text-white rounded-xl text-sm font-medium hover:bg-[#0f3d20] transition-colors">
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={everifyOnly} onChange={(e) => setEverifyOnly(e.target.checked)}
                className="rounded border-gray-300 text-[#16a34a] focus:ring-[#4ade80]" />
              E-Verify enrolled only
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={h1bOnly} onChange={(e) => setH1bOnly(e.target.checked)}
                className="rounded border-gray-300 text-[#16a34a] focus:ring-[#4ade80]" />
              H-1B sponsors only
            </label>
          </div>
        </div>

        {/* Company List */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No companies found</div>
        ) : (
          <div className="space-y-2">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:border-[#bbf7d0] hover:shadow-sm transition-all"
              >
                {/* Logo */}
                <div className="w-10 h-10 shrink-0 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {company.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logo_url}
                      alt={company.legal_name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <span className="text-xs font-bold text-gray-400">
                      {company.legal_name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Company info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{company.legal_name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {company.everify_status === 'enrolled' && (
                      <span className="flex items-center gap-1 text-xs text-[#14532d]">
                        <CheckCircle className="w-3 h-3" /> E-Verify
                      </span>
                    )}
                    {company.h1b_petitions_last_year > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp className="w-3 h-3" /> {company.h1b_petitions_last_year.toLocaleString()} petitions
                      </span>
                    )}
                    {company.avg_wage && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <DollarSign className="w-3 h-3" /> {formatWage(company.avg_wage)} avg
                      </span>
                    )}
                  </div>
                </div>

                {/* Approval rate */}
                {company.approval_rate !== null && (
                  <div className="shrink-0 text-right">
                    <p className={cn(
                      "text-sm font-semibold",
                      company.approval_rate >= 0.95 ? "text-[#16a34a]" : company.approval_rate >= 0.8 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {formatApprovalRate(company.approval_rate)}
                    </p>
                    <p className="text-xs text-gray-400">approval</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => fetchCompanies(page - 1)}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages.toLocaleString()}
            </span>
            <button
              onClick={() => fetchCompanies(page + 1)}
              disabled={page === totalPages || loading}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
