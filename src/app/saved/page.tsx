'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getSavedCompanies, unsaveCompany, SavedCompany } from '@/lib/api'

export default function SavedCompaniesPage() {
  const { user, loading: authLoading } = useAuth()
  const [companies, setCompanies] = useState<SavedCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    getSavedCompanies()
      .then(res => setCompanies(res.data))
      .catch(() => setError('Could not load saved companies.'))
      .finally(() => setLoading(false))
  }, [user, authLoading])

  const handleRemove = async (companyId: string) => {
    try {
      await unsaveCompany(companyId)
      setCompanies(prev => prev.filter(c => c.company_id !== companyId))
    } catch {
      // leave the item in place if the request fails
    }
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Sign in to view your saved companies</p>
          <Link href="/auth" className="mt-3 inline-block text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-blue-600" />
          Saved Companies
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {companies.length} company{companies.length !== 1 ? 'ies' : ''} saved
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {!error && companies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No saved companies yet</p>
            <Link href="/" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
              Search for companies to save
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {companies.map(c => (
            <div
              key={c.company_id}
              className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-200 transition-colors"
            >
              <Link href={`/companies/${c.company_id}`} className="flex-1">
                <p className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  {c.legal_name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Saved {new Date(c.saved_at).toLocaleDateString()}
                </p>
              </Link>
              <button
                onClick={() => handleRemove(c.company_id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                title="Remove from saved"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
