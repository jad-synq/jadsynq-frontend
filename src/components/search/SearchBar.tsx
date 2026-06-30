'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void
  loading?: boolean
  initialQuery?: string
}

export interface SearchFilters {
  state?: string
  everify_only: boolean
  h1b_only: boolean
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

export default function SearchBar({ onSearch, loading, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    everify_only: false,
    h1b_only: false,
  })
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length >= 1) {
      onSearch(query.trim(), filters)
    }
  }

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const activeFilterCount = [
    filters.state,
    filters.everify_only,
    filters.h1b_only,
  ].filter(Boolean).length

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company name..."
            className={cn(
              "w-full pl-11 sm:pl-12 pr-20 sm:pr-28 py-3 sm:py-4 text-sm sm:text-base rounded-2xl border border-gray-200",
              "bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
              "placeholder:text-gray-400 transition-shadow"
            )}
          />
          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-lg transition-colors relative",
                showFilters || activeFilterCount > 0
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              type="submit"
              disabled={loading || query.trim().length < 1}
              className={cn(
                "px-2.5 sm:px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium",
                "hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors whitespace-nowrap"
              )}
            >
              <Search className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">
                {loading ? 'Searching...' : 'Search'}
              </span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-2 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">State</label>
                <select
                  value={filters.state || ''}
                  onChange={(e) => setFilters(f => ({ ...f, state: e.target.value || undefined }))}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All states</option>
                  {US_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.everify_only}
                  onChange={(e) => setFilters(f => ({ ...f, everify_only: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                E-Verify enrolled only
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.h1b_only}
                  onChange={(e) => setFilters(f => ({ ...f, h1b_only: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                H-1B sponsors only
              </label>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters({ everify_only: false, h1b_only: false, state: undefined })}
                  className="text-sm text-red-500 hover:text-red-700 ml-auto"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
