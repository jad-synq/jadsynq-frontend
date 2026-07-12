'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { TrendingUp, Briefcase, ChevronRight, Database, Shield, RotateCcw, Sparkles } from 'lucide-react'
import SearchBar, { SearchFilters } from '@/components/search/SearchBar'
import SearchResultCard from '@/components/search/SearchResultCard'
import { searchCompanies, SearchResult } from '@/lib/api'
import { useMotionAllowed } from '@/hooks/useReducedMotion'

// Three.js/WebGL needs `window`/`document`, which don't exist during
// Next.js server-side rendering -- ssr:false defers this to the client only.
const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false })

export default function HomePage() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [lastQuery, setLastQuery] = useState('')
  const motionAllowed = useMotionAllowed()

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
    <div className="min-h-screen bg-[#f0fdf4]">

      {/* Hero / Search */}
      <div className={`relative overflow-hidden transition-all duration-300 ${hasSearched ? 'pt-6 pb-4 px-6' : 'pt-12 pb-6 px-6'}`}>

        {!hasSearched && (
          <>
            {motionAllowed && (
              <div className="hidden md:block absolute inset-0 z-0" aria-hidden="true">
                <HeroScene />
              </div>
            )}
            <div className="relative z-10 max-w-2xl mx-auto text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full mb-5 border border-green-200">
                <Sparkles className="w-3.5 h-3.5" />
                Real data from government filings
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                Find your next<br />
                <span className="text-[#16a34a]">H-1B sponsor</span>
              </h1>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                Search 80,000+ companies by sponsorship history and E-Verify status.
              </p>

              {/* Hero action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <Link href="/companies-list"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-green-200">
                  <Database className="w-4 h-4" /> Browse All Companies
                </Link>
                <Link href="/applications"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm border border-gray-200 shadow-sm transition-all">
                  <Briefcase className="w-4 h-4" /> Track Applications
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Search bar */}
        <div className="relative z-10 max-w-2xl mx-auto">
          {hasSearched && (
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => { setHasSearched(false); setResults([]); setError(null) }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#16a34a] transition-colors font-medium">
                <RotateCcw className="w-3.5 h-3.5" /> New search
              </button>
              {!loading && !error && results.length > 0 && (
                <Link href="/companies-list" className="text-xs text-[#16a34a] hover:underline font-medium">
                  Browse all →
                </Link>
              )}
            </div>
          )}
          <SearchBar onSearch={handleSearch} loading={loading} initialQuery={lastQuery} />
        </div>

        {/* Quick search + stats */}
        {!hasSearched && (
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="text-xs text-gray-400 w-full text-center mb-1">Popular searches</span>
              {['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Deloitte', 'Infosys', 'Cognizant'].map(co => (
                <button key={co} onClick={() => handleSearch(co, { everify_only: false, h1b_only: false })}
                  className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-full hover:border-[#16a34a] hover:text-[#16a34a] hover:bg-green-50 transition-all font-medium shadow-sm">
                  {co}
                </button>
              ))}
            </div>

            {/* Stats bar */}
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm mx-auto">
              {[
                { value: '80K+', label: 'Companies' },
                { value: '3.5M+', label: 'H-1B Filings' },
                { value: '100%', label: 'Gov. Data' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-green-100 py-4 px-3 text-center shadow-sm">
                  <p className="text-xl font-bold text-[#16a34a]">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feature cards — only before search */}
      {!hasSearched && (
        <div className="px-6 pb-12 max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5 text-center">What you can do</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Database className="w-5 h-5 text-[#16a34a]" />,
                bg: 'bg-green-50',
                border: 'hover:border-green-200',
                title: 'H-1B Intelligence',
                desc: 'Browse 80,000+ companies with real petition data from government filings.',
                cta: 'Browse companies',
                href: '/companies-list',
                color: 'text-[#16a34a]',
              },
              {
                icon: <Shield className="w-5 h-5 text-emerald-600" />,
                bg: 'bg-emerald-50',
                border: 'hover:border-emerald-200',
                title: 'E-Verify Status',
                desc: 'Find E-Verify enrolled companies — key for OPT & STEM OPT eligibility.',
                cta: 'E-Verify companies',
                href: '/companies-list',
                color: 'text-emerald-600',
              },
              {
                icon: <Briefcase className="w-5 h-5 text-teal-600" />,
                bg: 'bg-teal-50',
                border: 'hover:border-teal-200',
                title: 'Application Tracker',
                desc: 'Track every job application from applied to offer in one place.',
                cta: 'Track applications',
                href: '/applications',
                color: 'text-teal-600',
              },
            ].map(card => (
              <div key={card.title}
                className={`bg-white rounded-2xl border border-gray-100 ${card.border} p-6 hover:shadow-md transition-all`}>
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-4`}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{card.desc}</p>
                <Link href={card.href}
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${card.color} hover:opacity-80 transition-opacity`}>
                  {card.cta} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-6 bg-gradient-to-br from-[#14532d] to-[#166534] rounded-2xl p-7 text-center text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <TrendingUp className="w-9 h-9 mx-auto mb-3 text-green-300 relative" />
            <h3 className="font-bold text-xl mb-2 relative">Ready to find your next sponsor?</h3>
            <p className="text-green-200 text-sm mb-5 relative">Search by name and filter by H-1B history or E-Verify status.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
              <Link href="/companies-list"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-sm font-bold transition-colors">
                <Database className="w-4 h-4" /> Browse Companies
              </Link>
              <Link href="/applications"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold border border-white/20 transition-colors">
                <Briefcase className="w-4 h-4" /> Track Applications
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search results */}
      {hasSearched && (
        <div className="px-6 pb-12 max-w-2xl mx-auto">
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
              <button onClick={() => handleSearch(lastQuery, { everify_only: false, h1b_only: false })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
                <RotateCcw className="w-4 h-4" /> Try again
              </button>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-700 font-semibold text-lg mb-1">No results for &quot;{lastQuery}&quot;</p>
              <p className="text-gray-400 text-sm mb-5">Try a different spelling, or browse all companies</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button onClick={() => { setHasSearched(false); setResults([]) }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  <RotateCcw className="w-4 h-4" /> New search
                </button>
                <Link href="/companies-list"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#16a34a] text-white rounded-xl text-sm font-semibold hover:bg-[#15803d] transition-colors">
                  <Database className="w-4 h-4" /> Browse all companies
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="space-y-3">
              {results.map(result => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
