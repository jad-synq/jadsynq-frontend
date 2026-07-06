'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Briefcase, Plus, Trash2, ExternalLink, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  getApplications, createApplication, updateApplication, deleteApplication,
  JobApplication, AppStatus,
} from '@/lib/api'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<AppStatus, string> = {
  applied: 'Applied',
  phone_screen: 'Phone Screen',
  onsite: 'Onsite',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

const STATUS_COLORS: Record<AppStatus, string> = {
  applied: 'bg-blue-50 text-blue-700',
  phone_screen: 'bg-purple-50 text-purple-700',
  onsite: 'bg-orange-50 text-orange-700',
  offer: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
  withdrawn: 'bg-gray-50 text-gray-500',
}

const ALL_STATUSES: AppStatus[] = ['applied', 'phone_screen', 'onsite', 'offer', 'rejected', 'withdrawn']

function StatusBadge({ status }: { status: AppStatus }) {
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function AddApplicationForm({ onAdd, onCancel }: {
  onAdd: (app: JobApplication) => void
  onCancel: () => void
}) {
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [status, setStatus] = useState<AppStatus>('applied')
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await createApplication({
        company_name: companyName.trim(),
        job_title: jobTitle || undefined,
        job_url: jobUrl || undefined,
        status,
        applied_date: appliedDate || undefined,
        notes: notes || undefined,
      })
      onAdd(res.data)
    } catch {
      setError('Failed to add application.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-blue-200 p-5 mb-4">
      <h3 className="font-semibold text-gray-900 mb-4">New Application</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Company *</label>
          <input
            required
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Google"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Job Title</label>
          <input
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Software Engineer"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as AppStatus)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Applied Date</label>
          <input
            type="date"
            value={appliedDate}
            onChange={e => setAppliedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Job URL</label>
          <input
            type="url"
            value={jobUrl}
            onChange={e => setJobUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Referral from Jane, remote-friendly..."
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Adding...' : 'Add Application'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function ApplicationCard({ app, onStatusChange, onDelete }: {
  app: JobApplication
  onStatusChange: (id: string, status: AppStatus) => void
  onDelete: (id: string) => void
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Remove this application?')) return
    setDeleting(true)
    try {
      await deleteApplication(app.id)
      onDelete(app.id)
    } catch {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: AppStatus) => {
    setShowStatusMenu(false)
    try {
      await updateApplication(app.id, { status: newStatus })
      onStatusChange(app.id, newStatus)
    } catch {
      // silently revert on failure
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-blue-100 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{app.company_name}</p>
          {app.job_title && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{app.job_title}</p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-1"
              >
                <StatusBadge status={app.status} />
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {showStatusMenu && (
                <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10">
                  {ALL_STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50',
                        s === app.status ? 'font-medium text-blue-600' : 'text-gray-700'
                      )}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {app.applied_date && (
              <span className="text-xs text-gray-400">{app.applied_date}</span>
            )}
            {app.job_url && (
              <a
                href={app.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" /> Job posting
              </a>
            )}
          </div>
          {app.notes && (
            <p className="text-xs text-gray-400 mt-2 truncate">{app.notes}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0 disabled:opacity-40"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [apps, setApps] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<AppStatus | 'all'>('all')

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    getApplications()
      .then(res => setApps(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading])

  const handleAdd = (app: JobApplication) => {
    setApps(prev => [app, ...prev])
    setShowForm(false)
  }

  const handleStatusChange = (id: string, status: AppStatus) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const handleDelete = (id: string) => {
    setApps(prev => prev.filter(a => a.id !== id))
  }

  const filtered = filterStatus === 'all' ? apps : apps.filter(a => a.status === filterStatus)

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length
    return acc
  }, {} as Record<AppStatus, number>)

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Sign in to track your applications</p>
          <Link href="/auth" className="mt-3 inline-block text-blue-600 hover:underline">Sign in</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Applications
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{apps.length} total</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {/* Pipeline summary */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              className={cn(
                'flex flex-col items-center p-2 rounded-xl border text-xs transition-colors',
                filterStatus === s
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              )}
            >
              <span className={cn('text-lg font-bold', filterStatus === s ? 'text-blue-700' : 'text-gray-900')}>
                {counts[s]}
              </span>
              <span className="text-gray-500 mt-0.5 leading-tight text-center">
                {STATUS_LABELS[s].replace(' ', '\n')}
              </span>
            </button>
          ))}
        </div>

        {showForm && (
          <AddApplicationForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {filterStatus === 'all' ? 'No applications yet' : `No ${STATUS_LABELS[filterStatus]} applications`}
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Add your first application
              </button>
            )}
          </div>
        )}

        <div className="space-y-2">
          {filtered.map(app => (
            <ApplicationCard
              key={app.id}
              app={app}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
