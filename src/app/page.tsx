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
    <div className="min-h-screen bg-paper">

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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/15 text-gold-deep text-xs font-bold rounded-full mb-5 border border-gold/40">
                <Sparkles className="w-3.5 h-3.5" />
                Real data from government filings
              </div>
              <h1 className="font-display text-4xl sm:text-6xl font-bold text-ink mb-4 tracking-tight leading-[1.05] text-balance">
                Find your next<br />
                <span className="text-brand italic">H-1B sponsor</span>
              </h1>
              <p className="text-muted text-lg mb-8 max-w-md mx-auto">
                Search 80,000+ companies by sponsorship history and E-Verify status.
              </p>

              {/* Hero action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <Link href="/companies-list"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand hover:bg-brand-deep text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-brand/20">
                  <Database className="w-4 h-4" /> Browse All Companies
                </Link>
                <Link href="/applications"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-paper-raised hover:bg-paper text-ink font-semibold rounded-lg text-sm border border-line shadow-sm transition-all">
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
                className="flex items-center gap-1.5 text-sm text-muted hover:text-brand transition-colors font-medium">
                <RotateCcw className="w-3.5 h-3.5" /> New search
              </button>
              {!loading && !error && results.length > 0 && (
                <Link href="/companies-list" className="text-xs text-brand hover:underline font-medium">
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
              <span className="text-xs text-muted w-full text-center mb-1">Popular searches</span>
              {['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Deloitte', 'Infosys', 'Cognizant'].map(co => (
                <button key={co} onClick={() => handleSearch(co, { everify_only: false, h1b_only: false })}
                  className="px-3 py-1.5 text-sm text-ink-soft bg-paper-raised border border-line rounded-full hover:border-brand hover:text-brand hover:bg-paper transition-all font-medium shadow-sm">
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
                <div key={s.label} className="bg-paper-raised rounded-lg border border-line py-4 px-3 text-center shadow-sm">
                  <p className="font-display text-xl font-bold text-brand">{s.value}</p>
                  <p className="text-xs text-muted mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Feature cards — only before search */}
      {!hasSearched && (
        <div className="px-6 pb-12 max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-5 text-center">What you can do</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Database className="w-5 h-5 text-brand" />,
                bg: 'bg-brand/10',
                border: 'hover:border-brand/30',
                title: 'H-1B Intelligence',
                desc: 'Browse 80,000+ companies with real petition data from government filings.',
                cta: 'Browse companies',
                href: '/companies-list',
                color: 'text-brand',
              },
              {
                icon: <Shield className="w-5 h-5 text-gold-deep" />,
                bg: 'bg-gold/15',
                border: 'hover:border-gold/40',
                title: 'E-Verify Status',
                desc: 'Find E-Verify enrolled companies — key for OPT & STEM OPT eligibility.',
                cta: 'E-Verify companies',
                href: '/companies-list',
                color: 'text-gold-deep',
              },
              {
                icon: <Briefcase className="w-5 h-5 text-ink-soft" />,
                bg: 'bg-ink/5',
                border: 'hover:border-ink/20',
                title: 'Application Tracker',
                desc: 'Track every job application from applied to offer in one place.',
                cta: 'Track applications',
                href: '/applications',
                color: 'text-ink-soft',
              },
            ].map(card => (
              <div key={card.title}
                className={`bg-paper-raised rounded-lg border border-line ${card.border} p-6 hover:shadow-md transition-all`}>
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-4`}>
                  {card.icon}
                </div>
                <h3 className="font-display font-bold text-ink mb-2 text-lg">{card.title}</h3>
                <p className="text-sm text-muted mb-4 leading-relaxed">{card.desc}</p>
                <Link href={card.href}
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${card.color} hover:opacity-80 transition-opacity`}>
                  {card.cta} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-6 bg-gradient-to-br from-ink to-brand-deep rounded-lg p-7 text-center text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <TrendingUp className="w-9 h-9 mx-auto mb-3 text-gold relative" />
            <h3 className="font-display font-bold text-2xl mb-2 relative">Ready to find your next sponsor?</h3>
            <p className="text-white/70 text-sm mb-5 relative">Search by name and filter by H-1B history or E-Verify status.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
              <Link href="/companies-list"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-deep text-white rounded-lg text-sm font-bold transition-colors">
                <Database className="w-4 h-4" /> Browse Companies
              </Link>
              <Link href="/applications"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold border border-white/20 transition-colors">
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
                <div key={i} className="bg-paper-raised rounded-lg border border-line p-5">
                  <div className="h-5 skeleton-shimmer rounded w-1/3 mb-3" />
                  <div className="h-4 skeleton-shimmer rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-12 bg-paper-raised rounded-lg border border-signal/20">
              <p className="text-signal font-medium mb-3">{error}</p>
              <button onClick={() => handleSearch(lastQuery, { everify_only: false, h1b_only: false })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-signal/10 text-signal rounded-lg text-sm font-medium hover:bg-signal/15 transition-colors">
                <RotateCcw className="w-4 h-4" /> Try again
              </button>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="text-center py-12 bg-paper-raised rounded-lg border border-line">
              <p className="text-ink font-semibold text-lg mb-1">No results for &quot;{lastQuery}&quot;</p>
              <p className="text-muted text-sm mb-5">Try a different spelling, or browse all companies</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button onClick={() => { setHasSearched(false); setResults([]) }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-paper text-ink rounded-lg text-sm font-medium hover:bg-line transition-colors">
                  <RotateCcw className="w-4 h-4" /> New search
                </button>
                <Link href="/companies-list"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-deep transition-colors">
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
