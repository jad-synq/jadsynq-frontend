'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Briefcase, ChevronRight, Database, Shield, RotateCcw } from 'lucide-react'
import SearchBar, { SearchFilters } from '@/components/search/SearchBar'
import SearchResultCard from '@/components/search/SearchResultCard'
import { searchCompanies, SearchResult } from '@/lib/api'

export default function HomePage() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [lastQuery, setLastQuery] = useState('')

  const handleSearch = async (query: string, filters: SearchFilters) => {
    setLoading(true)
    setError(null)
    setLastQuery(query)
    setHasSearched(true)

    try {
      const response = await searchCompanies(query, {
        state: filters.state,
        everify_only: filters.everify_only || undefined,
        h1b_only: filters.h1b_only || undefined,
        limit: 20,
      })
      setResults(response.data)
    } catch {
      setError('Something went wrong. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero / Search Section */}
      <div className={`transition-all duration-300 ${hasSearched ? 'py-6 sm:py-8' : 'py-12 sm:py-24'}`}>
        <div className="max-w-4xl mx-auto px-4">
          {!hasSearched && (
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-4 border border-blue-100">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                Real data from government filings
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Find your next<br className="hidden sm:block" /> H-1B sponsor
              </h1>
              <p className="text-base sm:text-lg text-gray-500 max-w-lg mx-auto px-2 mb-6">
                Search 80,000+ US companies by H-1B sponsorship history and E-Verify enrollment.
              </p>
              {/* Hero CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Link
                  href="/companies-list"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md shadow-blue-100"
                >
                  <Database className="w-4 h-4" />
                  Browse All Companies
                </Link>
                <Link
                  href="/applications"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors border border-gray-200 shadow-sm"
                >
                  <Briefcase className="w-4 h-4" />
                  Track Applications
                </Link>
              </div>
            </div>
          )}

          {hasSearched && (
            <div className="mb-4 flex items-center justify-between">
              <a href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                JAD Synq
              </a>
              <button
                onClick={() => { setHasSearched(false); setResults([]); setError(null) }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> New search
              </button>
            </div>
          )}

          <SearchBar
            onSearch={handleSearch}
            loading={loading}
            initialQuery={lastQuery}
          />

          {!hasSearched && (
            <>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <span className="text-xs text-gray-400 w-full text-center mb-1">Try searching for</span>
                {['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Deloitte', 'Infosys'].map(company => (
                  <button
                    key={company}
                    onClick={() => handleSearch(company, { everify_only: false, h1b_only: false })}
                    className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                  >
                    {company}
                  </button>
                ))}
              </div>

              {/* Stats bar */}
              <div className="mt-8 grid grid-cols-3 gap-3 max-w-lg mx-auto text-center">
                {[
                  { value: '80,000+', label: 'Companies' },
                  { value: '3.5M+', label: 'H-1B Filings' },
                  { value: '100%', label: 'Gov. Data' },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-xl border border-gray-100 py-3 px-2">
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Feature Cards — only shown before search */}
      {!hasSearched && (
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
            What you can do with JAD Synq
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">H-1B Intelligence</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Browse 80,000+ companies with real H-1B petition data from government filings.
              </p>
              <Link
                href="/companies-list"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Browse all companies <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">E-Verify Status</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                See which companies are enrolled in E-Verify — a key indicator for OPT and STEM-OPT eligibility.
              </p>
              <button
                onClick={() => handleSearch('', { everify_only: true, h1b_only: false })}
                className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                E-Verify companies <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-purple-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Application Tracker</h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Track every job application — from applied to offer — with status updates and notes.
              </p>
              <Link
                href="/applications"
                className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
              >
                Track applications <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-90" />
            <h3 className="font-bold text-lg mb-1">Ready to find your next sponsor?</h3>
            <p className="text-blue-100 text-sm mb-4">
              Search by company name and filter by H-1B history or E-Verify enrollment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/companies-list"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors"
              >
                <Database className="w-4 h-4" />
                Browse Companies
              </Link>
              <Link
                href="/applications"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-400 transition-colors border border-blue-400"
              >
                <Briefcase className="w-4 h-4" />
                Track Applications
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && (
        <div className="max-w-4xl mx-auto px-4 pb-16">
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-5 bg-gray-100 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12 bg-white rounded-2xl border border-red-100">
              <p className="text-red-500 font-medium mb-3">{error}</p>
              <button
                onClick={() => handleSearch(lastQuery, { everify_only: false, h1b_only: false })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Try again
              </button>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-700 font-semibold text-lg mb-1">No results for &quot;{lastQuery}&quot;</p>
              <p className="text-gray-400 text-sm mb-5">Try a different spelling, or browse all companies</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => { setHasSearched(false); setResults([]) }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> New search
                </button>
                <Link
                  href="/companies-list"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Database className="w-4 h-4" /> Browse all companies
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">
                  {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{lastQuery}&quot;
                </p>
                <Link href="/companies-list" className="text-xs text-blue-600 hover:underline font-medium">
                  Browse all →
                </Link>
              </div>
              <div className="space-y-3">
                {results.map(result => (
                  <SearchResultCard key={result.id} result={result} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  )
}
