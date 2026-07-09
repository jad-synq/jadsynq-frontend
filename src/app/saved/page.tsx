'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Trash2, Building2, CheckCircle, TrendingUp, Lock, Bell, BellOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getSavedCompanies, unsaveCompany, saveCompany, SavedCompany } from '@/lib/api'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

const MOCK_SAVED = [
  { name: 'Google LLC', everify: true, h1b: 5241 },
  { name: 'Amazon.com Services LLC', everify: true, h1b: 3802 },
  { name: 'Microsoft Corporation', everify: true, h1b: 2911 },
]

function UnauthenticatedView() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Bookmark className="w-5 h-5 text-[#16a34a]" />
          <h1 className="text-xl font-bold text-gray-900">Saved Companies</h1>
        </div>

        <div className="space-y-3 mb-6 relative">
          {MOCK_SAVED.map((c, i) => (
            <div
              key={c.name}
              className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4"
              style={{ opacity: 1 - i * 0.22 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {c.everify && (
                      <span className="flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle className="w-3 h-3" /> E-Verify
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <TrendingUp className="w-3 h-3" /> {c.h1b.toLocaleString()} H-1B
                    </span>
                  </div>
                </div>
              </div>
              <Trash2 className="w-4 h-4 text-gray-200" />
            </div>
          ))}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-[#16a34a]" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Save companies to track later</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Bookmark companies you&apos;re interested in and get email alerts when they post new jobs.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
          >
            <Bookmark className="w-4 h-4" />
            Sign in to save companies
          </Link>
          <p className="text-xs text-gray-400 mt-4">Free — no credit card required</p>
        </div>
      </div>
    </main>
  )
}

function AlertToggle({
  company,
  onToggle,
}: {
  company: SavedCompany
  onToggle: (id: string, newVal: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const [local, setLocal] = useState(company.alert_jobs)
  const [toast, setToast] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    const next = !local
    try {
      await saveCompany(company.company_id, next)
      setLocal(next)
      onToggle(company.company_id, next)
      if (next) {
        setToast(true)
        setTimeout(() => setToast(false), 3000)
      }
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={loading}
        title={local ? 'Email alerts on — click to disable' : 'Enable email alerts for new jobs'}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50',
          local
            ? 'bg-green-50 text-[#16a34a] border-green-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200'
            : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-green-50 hover:text-[#16a34a] hover:border-green-200'
        )}
      >
        {local ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
        {local ? 'Alerts on' : 'Alert me'}
      </button>
      {toast && (
        <div className="absolute right-0 top-full mt-1.5 z-10 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
          ✓ We&apos;ll email you when new jobs are posted
        </div>
      )}
    </div>
  )
}

export default function SavedCompaniesPage() {
  const { user, loading: authLoading } = useAuth()
  const [companies, setCompanies] = useState<SavedCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const alertCount = companies.filter(c => c.alert_jobs).length

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    getSavedCompanies()
      .then(res => setCompanies(res.data))
      .catch(() => setError('Could not load saved companies.'))
      .finally(() => setLoading(false))
  }, [user, authLoading])

  const handleRemove = async (companyId: string) => {
    try {
      await unsaveCompany(companyId)
      setCompanies(prev => prev.filter(c => c.company_id !== companyId))
    } catch { /* leave in place on error */ }
  }

  const handleAlertToggle = (id: string, val: boolean) => {
    setCompanies(prev => prev.map(c => c.company_id === id ? { ...c, alert_jobs: val } : c))
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </main>
    )
  }

  if (!user) return <UnauthenticatedView />

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#16a34a]" />
            Saved Companies
          </h1>
          {alertCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-[#16a34a] bg-green-50 px-2.5 py-1 rounded-full border border-green-100 font-semibold">
              <Bell className="w-3 h-3" /> {alertCount} alert{alertCount !== 1 ? 's' : ''} active
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {companies.length} company{companies.length !== 1 ? 'ies' : ''} saved
          {companies.length > 0 && ' · Toggle alerts to get email when new jobs are posted'}
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {!error && companies.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <Bookmark className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-1">No saved companies yet</p>
            <p className="text-gray-400 text-sm mb-4">
              Search for companies and click the bookmark icon to save them here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Search companies
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {companies.map(c => (
            <div
              key={c.company_id}
              className={cn(
                'flex items-center justify-between bg-white rounded-2xl border p-4 transition-colors',
                c.alert_jobs ? 'border-green-100 hover:border-green-200' : 'border-gray-100 hover:border-gray-200'
              )}
            >
              <Link href={`/companies/${c.company_id}`} className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-gray-900 hover:text-[#16a34a] transition-colors truncate">
                  {c.legal_name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Saved {new Date(c.saved_at).toLocaleDateString()}
                </p>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <AlertToggle company={c} onToggle={handleAlertToggle} />
                <Link
                  href={`/companies/${c.company_id}`}
                  className="text-xs text-[#16a34a] hover:text-[#15803d] font-medium px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                >
                  View →
                </Link>
                <button
                  onClick={() => handleRemove(c.company_id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
