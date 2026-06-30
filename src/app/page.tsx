'use client'

import { useState } from 'react'
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
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero / Search Section */}
      <div className={`transition-all duration-300 ${hasSearched ? 'py-8' : 'py-24'}`}>
        <div className="max-w-4xl mx-auto px-4">
          {!hasSearched && (
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                JAD Synq
              </h1>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
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
