'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, TrendingUp, DollarSign, SlidersHorizontal, Building2, ChevronLeft, ChevronRight as ChevronRightIcon, X, Bookmark, BookmarkCheck, ThumbsUp } from 'lucide-react'
import { getCompaniesCached, CompanyListItem, saveCompany, unsaveCompany } from '@/lib/api'
import BrandedLoader from '@/components/ui/BrandedLoader'
import { SkeletonCard, Sparkline } from '@/components/ui/Skeleton'
import CompanyLogo, { linkedinCompanyUrl } from '@/components/ui/CompanyLogo'
import { formatWage, formatApprovalRate, cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { TeaserFade, TeaserCTA } from '@/components/ui/TeaserGate'

const FREE_VISIBLE = 10

function SaveButton({ companyId }: { companyId: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push('/auth'); return }
    setLoading(true)
    try {
      if (saved) { await unsaveCompany(companyId); setSaved(false) }
      else { await saveCompany(companyId); setSaved(true) }
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      title={saved ? 'Unsave' : 'Save company'}
      className={cn(
        'p-2 rounded-lg transition-colors disabled:opacity-40 shrink-0',
        saved ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-muted hover:text-muted hover:bg-paper'
      )}
    >
      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
    </button>
  )
}

const SORT_OPTIONS = [
  { value: 'petitions', label: 'Most H-1B Petitions' },
  { value: 'approval_rate', label: 'Highest Approval Rate' },
  { value: 'avg_wage', label: 'Highest Average Wage' },
  { value: 'name', label: 'Name (A–Z)' },
]

const COMPANY_SIZE_OPTIONS: { value: 'startup' | 'small_medium' | 'medium_large' | 'mnc'; label: string }[] = [
  { value: 'startup', label: 'Startup (<50)' },
  { value: 'small_medium', label: 'Small-Medium (50-500)' },
  { value: 'medium_large', label: 'Medium-Large (500-5K)' },
  { value: 'mnc', label: 'MNC (5K+)' },
]

const COMPANY_SIZE_LABEL: Record<string, string> = {
  startup: 'Startup',
  small_medium: '50-500',
  medium_large: '500-5K',
  mnc: '5K+ (MNC)',
}

export default function CompaniesPage() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [slowLoad, setSlowLoad] = useState(false)
  const [query, setQuery] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [sort, setSort] = useState('petitions')
  const [optAcceptingOnly, setOptAcceptingOnly] = useState(false)
  const [h1bOnly, setH1bOnly] = useState(false)
  const [companySize, setCompanySize] = useState<'' | 'startup' | 'small_medium' | 'medium_large' | 'mnc'>('')
  const [showFilters, setShowFilters] = useState(false)

  const PER_PAGE = 50

  const fetchCompanies = useCallback(async (p = 1, attempt = 1) => {
    setLoading(true)
    const slowTimer = attempt === 1 ? setTimeout(() => setSlowLoad(true), 5000) : null
    try {
      const res = await getCompaniesCached({
        q: query || undefined,
        page: p,
        per_page: PER_PAGE,
        opt_accepting_only: optAcceptingOnly,
        h1b_only: h1bOnly,
        sort: sort as 'petitions' | 'approval_rate' | 'avg_wage' | 'name',
        company_size: companySize || undefined,
      })
      setCompanies(res.data.companies)
      setTotal(res.data.total)
      setPage(p)
    } catch {
      if (attempt === 1) {
        // Retry once — backend may have been cold-starting
        await new Promise(r => setTimeout(r, 2000))
        fetchCompanies(p, 2)
        return
      }
      setCompanies([])
    } finally {
      if (slowTimer) clearTimeout(slowTimer)
      setSlowLoad(false)
      setLoading(false)
    }
  }, [query, sort, optAcceptingOnly, h1bOnly, companySize])

  useEffect(() => { fetchCompanies(1) }, [fetchCompanies])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setQuery(inputValue) }
  const clearSearch = () => { setInputValue(''); setQuery('') }

  const totalPages = Math.ceil(total / PER_PAGE)
  const activeFilters = [optAcceptingOnly && 'OPT/STEM OPT accepting', h1bOnly && 'H-1B sponsors', companySize && COMPANY_SIZE_LABEL[companySize]].filter(Boolean)

  const gated = !user && page === 1 && companies.length > FREE_VISIBLE
  const visibleCompanies = gated ? companies.slice(0, FREE_VISIBLE) : companies
  const teaserCompanies = gated ? companies.slice(FREE_VISIBLE, FREE_VISIBLE + 3) : []

  const renderCompanyRow = (company: CompanyListItem, i: number) => (
    <Link
      key={company.id}
      href={`/companies/${company.id}`}
      className="flex items-center gap-4 bg-paper-raised rounded-2xl border border-line p-4 hover:border-blue-200 hover:shadow-sm transition-all group"
    >
      {/* Rank */}
      <span className="text-xs text-muted font-semibold w-5 shrink-0 text-right">
        {(page - 1) * PER_PAGE + i + 1}
      </span>

      {/* Logo */}
      <CompanyLogo
        logoUrl={company.logo_url}
        domain={company.domain}
        name={company.legal_name}
        size="md"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink group-hover:text-blue-600 transition-colors truncate">{company.legal_name}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {company.opt_accepting && (
            <span className="flex items-center gap-1 text-xs text-brand-deep font-medium">
              <ThumbsUp className="w-3 h-3" /> OPT/STEM OPT accepting
            </span>
          )}
          {company.h1b_petitions_last_year > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <TrendingUp className="w-3 h-3 text-blue-400" /> {company.h1b_petitions_last_year.toLocaleString()} H-1B
            </span>
          )}
          {company.avg_wage && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <DollarSign className="w-3 h-3" /> {formatWage(company.avg_wage)} avg
            </span>
          )}
          {company.company_size && (
            <span className="text-xs font-medium text-gold-deep bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
              {COMPANY_SIZE_LABEL[company.company_size]}
            </span>
          )}
        </div>
      </div>

      {/* Sparkline trend */}
      {company.petition_trend?.length >= 2 && (
        <div className="shrink-0 hidden sm:flex flex-col items-end gap-0.5">
          <Sparkline data={company.petition_trend} width={56} height={22} />
          <span className="text-[9px] text-muted font-medium">trend</span>
        </div>
      )}

      {/* Approval badge */}
      {company.approval_rate !== null && (
        <div className={cn(
          'shrink-0 px-3 py-1.5 rounded-xl text-sm font-bold',
          company.approval_rate >= 0.95 ? 'bg-brand/10 text-brand-deep' :
          company.approval_rate >= 0.8 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'
        )}>
          {formatApprovalRate(company.approval_rate)}
        </div>
      )}

      {/* LinkedIn icon */}
      <a
        href={linkedinCompanyUrl(company.domain, company.legal_name)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        title="View on LinkedIn"
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#0a66c2] hover:bg-blue-50 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>

      <SaveButton companyId={company.id} />
    </Link>
  )

  return (
    <main className="min-h-screen bg-paper">
      {/* Page header */}
      <div className="bg-paper-raised border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Company Database</h1>
              <p className="text-sm text-muted mt-1">
                {loading ? '…' : <><span className="font-semibold text-brand">{total.toLocaleString()}</span> companies with H-1B or E-Verify data</>}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand-deep rounded-full border border-brand/20 font-medium">
                <span className="w-2 h-2 rounded-full bg-brand inline-block" /> E-Verify enrolled
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> H-1B sponsor
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search company name..."
              className="w-full pl-10 pr-10 py-3 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-paper-raised"
            />
            {inputValue && (
              <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink-soft">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button type="submit" className="px-5 py-3 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-deep transition-colors">
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-colors',
              (showFilters || activeFilters.length > 0) ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-line bg-paper-raised text-ink-soft hover:border-line'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>
        </form>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-paper-raised border border-line rounded-xl p-4 mb-3 flex flex-wrap gap-6 items-center">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Sort by</label>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setSort(o.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      sort === o.value ? 'bg-blue-600 text-white' : 'bg-line text-ink-soft hover:bg-line'
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Filter</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOptAcceptingOnly(!optAcceptingOnly)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    optAcceptingOnly ? 'bg-brand text-white' : 'bg-line text-ink-soft hover:bg-line'
                  )}
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> OPT/STEM OPT accepting
                </button>
                <button
                  onClick={() => setH1bOnly(!h1bOnly)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    h1bOnly ? 'bg-brand text-white' : 'bg-line text-ink-soft hover:bg-line'
                  )}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> H-1B sponsors only
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Company size</label>
              <div className="flex flex-wrap gap-2">
                {COMPANY_SIZE_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    onClick={() => setCompanySize(companySize === o.value ? '' : o.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      companySize === o.value ? 'bg-brand text-white' : 'bg-line text-ink-soft hover:bg-line'
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {(query || activeFilters.length > 0) && !showFilters && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {query && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-line text-ink-soft rounded-full text-sm">
                &ldquo;{query}&rdquo;
                <button onClick={clearSearch} className="text-muted hover:text-ink-soft"><X className="w-3 h-3" /></button>
              </span>
            )}
            {optAcceptingOnly && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-brand/10 text-brand-deep rounded-full text-sm border border-brand/20">
                OPT/STEM OPT accepting <button onClick={() => setOptAcceptingOnly(false)} className="opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
              </span>
            )}
            {h1bOnly && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100">
                H-1B sponsors <button onClick={() => setH1bOnly(false)} className="opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
              </span>
            )}
            {companySize && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-gold/15 text-gold-deep rounded-full text-sm border border-gold/30">
                {COMPANY_SIZE_LABEL[companySize]} <button onClick={() => setCompanySize('')} className="opacity-60 hover:opacity-100"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Company list */}
        {loading ? (
          <div className="space-y-3">
            {slowLoad ? (
              <BrandedLoader />
            ) : (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            )}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16 bg-paper-raised rounded-2xl border border-line">
            <Building2 className="w-10 h-10 text-line mx-auto mb-3" />
            <p className="text-muted font-medium">No companies found</p>
            <p className="text-sm text-muted mt-1">Try adjusting your search or filters</p>
            <button onClick={clearSearch} className="mt-3 text-sm text-blue-600 hover:underline">Clear search</button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {visibleCompanies.map((company, i) => renderCompanyRow(company, i))}
            </div>

            {gated && teaserCompanies.length > 0 && (
              <>
                <div className="space-y-2 mt-2">
                  <TeaserFade>
                    <div className="space-y-2">
                      {teaserCompanies.map((company, i) => renderCompanyRow(company, FREE_VISIBLE + i))}
                    </div>
                  </TeaserFade>
                </div>
                <TeaserCTA
                  title={`See all ${total.toLocaleString()} companies`}
                  description="Sign in free to browse the full database, get personalized matches by visa & experience, and save companies you're interested in."
                />
              </>
            )}
          </>
        )}

        {/* Pagination */}
        {!gated && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => fetchCompanies(page - 1)}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-line rounded-xl disabled:opacity-40 hover:bg-paper transition-colors bg-paper-raised"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-muted font-medium">
              Page {page} of {totalPages.toLocaleString()}
            </span>
            <button
              onClick={() => fetchCompanies(page + 1)}
              disabled={page === totalPages || loading}
              className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-line rounded-xl disabled:opacity-40 hover:bg-paper transition-colors bg-paper-raised"
            >
              Next <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
