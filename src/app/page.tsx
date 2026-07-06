'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Briefcase, ChevronRight, Database, Shield } from 'lucide-react'
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
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                JAD Synq
              </h1>
              <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto px-2">
                Search US companies by H-1B sponsorship history and E-Verify enrollment.
                Real data from government filings.
              </p>
            </div>
          )}

          {hasSearched && (
            <div className="mb-6">
              <a href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                JAD Synq
              </a>
            </div>
          )}

          <SearchBar
            onSearch={handleSearch}
            loading={loading}
            initialQuery={lastQuery}
          />

          {!hasSearched && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'].map(company => (
                <button
                  key={company}
                  onClick={() => handleSearch(company, { everify_only: false, h1b_only: false })}
                  className="px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  {company}
                </button>
              ))}
            </div>
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
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No companies found for &quot;{lastQuery}&quot;</p>
              <p className="text-gray-400 text-sm mt-1">Try a different name or remove filters</p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-3">
                {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{lastQuery}&quot;
              </p>
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
