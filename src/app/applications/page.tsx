'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Briefcase, Plus, Trash2, ExternalLink, ChevronDown,
  Send, Phone, Users, PartyPopper, XCircle, MinusCircle,
  Pencil, X, CheckCircle, Building2, CalendarDays,
  StickyNote, Link2, TrendingUp, Award, Sparkles, ArrowUpRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  getApplications, createApplication, updateApplication, deleteApplication,
  JobApplication, AppStatus,
} from '@/lib/api'
import { cn } from '@/lib/utils'

// ─── Config ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<AppStatus, {
  label: string; icon: React.ReactNode
  text: string; bg: string; border: string; bar: string; dot: string
}> = {
  applied:      { label: 'Applied',      icon: <Send className="w-3.5 h-3.5" />,        text: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',   bar: 'bg-blue-400',    dot: 'bg-blue-400'    },
  phone_screen: { label: 'Phone Screen', icon: <Phone className="w-3.5 h-3.5" />,        text: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-200', bar: 'bg-yellow-400',  dot: 'bg-yellow-400'  },
  onsite:       { label: 'On-site',      icon: <Users className="w-3.5 h-3.5" />,        text: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200', bar: 'bg-violet-400',  dot: 'bg-violet-400'  },
  offer:        { label: 'Offer',        icon: <PartyPopper className="w-3.5 h-3.5" />,  text: 'text-gold-deep', bg: 'bg-gold/15', border: 'border-gold/40',bar: 'bg-gold', dot: 'bg-gold' },
  rejected:     { label: 'Rejected',     icon: <XCircle className="w-3.5 h-3.5" />,      text: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',    bar: 'bg-red-400',     dot: 'bg-red-400'     },
  withdrawn:    { label: 'Withdrawn',    icon: <MinusCircle className="w-3.5 h-3.5" />,  text: 'text-muted',    bg: 'bg-line',   border: 'border-line',   bar: 'bg-line',    dot: 'bg-line'    },
}

const ALL_STATUSES: AppStatus[] = ['applied', 'phone_screen', 'onsite', 'offer', 'rejected', 'withdrawn']
const ACTIVE_STATUSES: AppStatus[] = ['applied', 'phone_screen', 'onsite']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status, sm }: { status: AppStatus; sm?: boolean }) {
  const m = STATUS_META[status]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-semibold rounded-full border',
      sm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      m.text, m.bg, m.border
    )}>
      {m.icon} {m.label}
    </span>
  )
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface AppForm {
  company_name: string; job_title: string; job_url: string
  status: AppStatus; applied_date: string; notes: string
}

const EMPTY_FORM: AppForm = {
  company_name: '', job_title: '', job_url: '',
  status: 'applied', applied_date: new Date().toISOString().split('T')[0], notes: '',
}

function AppModal({ initial, title, submitLabel, onSubmit, onClose }: {
  initial: AppForm
  title: string
  submitLabel: string
  onSubmit: (f: AppForm) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<AppForm>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof AppForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company_name.trim()) return
    setLoading(true); setError(null)
    try { await onSubmit(form) }
    catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-paper-raised w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-paper-raised px-6 pt-5 pb-4 border-b border-line flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <div>
            <h2 className="font-bold text-ink text-base">{title}</h2>
            <p className="text-xs text-muted mt-0.5">All fields except company are optional</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-line transition-colors">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Company + Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-soft mb-1.5">
                Company <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input required value={form.company_name} onChange={set('company_name')}
                  className="w-full pl-9 pr-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="Google" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-soft mb-1.5">Job Title</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input value={form.job_title} onChange={set('job_title')}
                  className="w-full pl-9 pr-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="Software Engineer" />
              </div>
            </div>
          </div>

          {/* Status + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink-soft mb-1.5">Status</label>
              <select value={form.status} onChange={set('status')}
                className="w-full px-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent bg-paper-raised">
                {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-soft mb-1.5">Applied Date</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input type="date" value={form.applied_date} onChange={set('applied_date')}
                  className="w-full pl-9 pr-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent" />
              </div>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-bold text-ink-soft mb-1.5">Job Posting URL</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input type="url" value={form.job_url} onChange={set('job_url')}
                className="w-full pl-9 pr-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                placeholder="https://careers.google.com/jobs/..." />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-ink-soft mb-1.5">Notes</label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3 w-3.5 h-3.5 text-muted" />
              <textarea value={form.notes} onChange={set('notes')} rows={3}
                className="w-full pl-9 pr-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
                placeholder="Referral from Jane, remote role, FAANG target..." />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <XCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1 pb-2">
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand hover:bg-brand-deep text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors">
              {loading ? 'Saving…' : <><CheckCircle className="w-4 h-4" /> {submitLabel}</>}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-3 bg-line hover:bg-line text-ink-soft text-sm font-semibold rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Application Card ─────────────────────────────────────────────────────────

function AppCard({ app, onStatusChange, onDelete, onEdit }: {
  app: JobApplication
  onStatusChange: (id: string, status: AppStatus) => void
  onDelete: (id: string) => void
  onEdit: (app: JobApplication) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDelete = async () => {
    if (!confirm(`Remove "${app.company_name}" from your tracker?`)) return
    setDeleting(true)
    try { await deleteApplication(app.id); onDelete(app.id) }
    catch { setDeleting(false) }
  }

  const handleStatus = async (s: AppStatus) => {
    setMenuOpen(false)
    try { await updateApplication(app.id, { status: s }); onStatusChange(app.id, s) }
    catch { /**/ }
  }

  const m = STATUS_META[app.status as AppStatus]

  return (
    <div className={cn(
      'bg-paper-raised rounded-2xl border hover:shadow-md transition-all group',
      app.status === 'offer'    ? 'border-gold/40 bg-gradient-to-r from-paper-raised to-gold/10' :
      app.status === 'rejected' ? 'border-line opacity-75' :
      'border-line hover:border-line'
    )}>
      {/* Left accent bar */}
      <div className="flex">
        <div className={cn('w-1 rounded-l-2xl shrink-0', m.bar)} />

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Company + role */}
            <div className="flex items-start gap-3 min-w-0">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black border',
                m.bg, m.border
              )}>
                {app.company_name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-ink truncate">{app.company_name}</p>
                <p className="text-sm text-muted truncate mt-0.5">
                  {app.job_title || <span className="italic text-muted">No title set</span>}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(app)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-line text-muted hover:text-ink-soft transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors disabled:opacity-40">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {/* Status dropdown */}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <StatusBadge status={app.status as AppStatus} sm />
                <ChevronDown className="w-3 h-3 text-muted" />
              </button>
              {menuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-44 bg-paper-raised border border-line rounded-2xl shadow-xl py-1.5 z-20 overflow-hidden">
                  <p className="px-3 py-1 text-[10px] font-bold text-muted uppercase tracking-widest">Move to</p>
                  {ALL_STATUSES.map(s => (
                    <button key={s} onClick={() => handleStatus(s)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-paper transition-colors',
                        s === app.status ? 'font-bold' : 'text-ink-soft'
                      )}>
                      <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_META[s].dot)} />
                      {STATUS_META[s].label}
                      {s === app.status && <CheckCircle className="w-3.5 h-3.5 text-brand ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {app.applied_date && (
              <span className="flex items-center gap-1 text-xs text-muted">
                <CalendarDays className="w-3 h-3" /> {app.applied_date}
              </span>
            )}

            {app.job_url && (
              <a href={app.job_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-brand hover:underline font-medium">
                <ExternalLink className="w-3 h-3" /> View posting
              </a>
            )}
          </div>

          {app.notes && (
            <p className="mt-2.5 text-xs text-muted bg-paper rounded-xl px-3 py-2 line-clamp-2 border border-line">
              {app.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Unauthenticated ─────────────────────────────────────────────────────────

function UnauthenticatedView() {
  const mockApps = [
    { company: 'Google',    title: 'Software Engineer',    status: 'onsite'       as AppStatus },
    { company: 'Amazon',    title: 'SDE II',               status: 'phone_screen' as AppStatus },
    { company: 'Stripe',    title: 'Backend Engineer',     status: 'offer'        as AppStatus },
    { company: 'Microsoft', title: 'Software Engineer',    status: 'applied'      as AppStatus },
  ]
  return (
    <div className="min-h-screen bg-paper">
      <div className="bg-gradient-to-br from-ink via-ink to-brand-deep px-6 py-14 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 border border-white/20 rounded-2xl mb-4">
          <Briefcase className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">Application Tracker</h1>
        <p className="text-green-200 text-sm max-w-xs mx-auto">
          Track every job application — from first apply to offer letter.
        </p>
        <Link href="/auth"
          className="inline-flex items-center gap-2 mt-6 bg-paper-raised text-brand font-bold text-sm px-7 py-3 rounded-xl hover:bg-brand/10 transition-colors shadow-lg">
          Start tracking free <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="max-w-lg mx-auto px-6 -mt-6 space-y-2.5 pb-12">
        {mockApps.map((a, i) => (
          <div key={i} className={cn(
            'bg-paper-raised rounded-2xl border p-4 flex items-center gap-3',
            a.status === 'offer' ? 'border-gold/40' : 'border-line'
          )}>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border',
              STATUS_META[a.status].bg, STATUS_META[a.status].border, STATUS_META[a.status].text)}>
              {a.company[0]}
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink text-sm">{a.company}</p>
              <p className="text-xs text-muted">{a.title}</p>
            </div>
            <StatusBadge status={a.status} sm />
          </div>
        ))}
        <div className="text-center pt-4 text-xs text-muted">Sign in to track your own applications</div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function ApplicationsInner() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const prefill = searchParams.get('prefill') ?? ''
  const [apps, setApps]               = useState<JobApplication[]>([])
  const [loading, setLoading]         = useState(true)
  const [showAdd, setShowAdd]         = useState(false)
  const [editApp, setEditApp]         = useState<JobApplication | null>(null)
  const [filter, setFilter]           = useState<AppStatus | 'all'>('all')

  // Auto-open add modal when ?prefill= is present
  useEffect(() => {
    if (prefill && !authLoading && user) setShowAdd(true)
  }, [prefill, authLoading, user])

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    getApplications()
      .then(r => setApps(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading])

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-3">
          <div className="h-32 bg-paper-raised rounded-2xl border border-line animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-paper-raised rounded-2xl border border-line animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return <UnauthenticatedView />

  // Derived
  const counts = ALL_STATUSES.reduce<Record<string, number>>((a, s) => {
    a[s] = apps.filter(x => x.status === s).length; return a
  }, {})
  const active  = ACTIVE_STATUSES.reduce((s, st) => s + (counts[st] || 0), 0)
  const offers  = counts.offer || 0
  const winRate = apps.length ? Math.round((offers / apps.length) * 100) : 0
  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  const handleAdd = async (f: AppForm) => {
    const res = await createApplication({
      company_name: f.company_name.trim(),
      job_title:    f.job_title || undefined,
      job_url:      f.job_url   || undefined,
      status:       f.status,
      applied_date: f.applied_date || undefined,
      notes:        f.notes       || undefined,
    })
    setApps(prev => [res.data, ...prev])
    setShowAdd(false)
  }

  const handleEdit = async (f: AppForm) => {
    if (!editApp) return
    const res = await updateApplication(editApp.id, {
      status:       f.status,
      job_title:    f.job_title  || undefined,
      job_url:      f.job_url    || undefined,
      applied_date: f.applied_date || undefined,
      notes:        f.notes      || undefined,
    })
    setApps(prev => prev.map(a => a.id === editApp.id ? res.data : a))
    setEditApp(null)
  }

  const handleStatusChange = (id: string, status: AppStatus) =>
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))

  const handleDelete = (id: string) =>
    setApps(prev => prev.filter(a => a.id !== id))

  return (
    <div className="min-h-screen bg-paper">

      {/* Header */}
      <div className="bg-paper-raised border-b border-line">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-display text-xl font-bold text-ink flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand" /> Application Tracker
              </h1>
              <p className="text-xs text-muted mt-0.5">{apps.length} application{apps.length !== 1 ? 's' : ''} tracked</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand hover:bg-brand-deep text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Add Application
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { n: apps.length, l: 'Total',    icon: <Briefcase className="w-3.5 h-3.5" />, color: 'text-brand bg-brand/10'  },
              { n: active,      l: 'Active',   icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'text-blue-600 bg-blue-50'    },
              { n: offers,      l: 'Offers',   icon: <Award className="w-3.5 h-3.5" />,      color: 'text-amber-600 bg-amber-50'  },
              { n: `${winRate}%`,l:'Win Rate', icon: <Sparkles className="w-3.5 h-3.5" />,   color: 'text-violet-600 bg-violet-50'},
            ].map(s => (
              <div key={s.l} className="bg-paper border border-line rounded-xl px-3 py-2.5 text-center">
                <p className="text-lg font-black text-ink">{s.n}</p>
                <p className="text-[10px] font-semibold text-muted mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Segmented pipeline bar */}
          {apps.length > 0 && (
            <div className="mb-4">
              <div className="flex h-2 rounded-full overflow-hidden gap-px bg-line">
                {ALL_STATUSES.map(s => {
                  const pct = (counts[s] || 0) / apps.length * 100
                  if (pct === 0) return null
                  return <div key={s} className={cn('h-full', STATUS_META[s].bar)} style={{ width: `${pct}%` }} />
                })}
              </div>
              <div className="flex gap-3 mt-2 flex-wrap">
                {ALL_STATUSES.filter(s => (counts[s] || 0) > 0).map(s => (
                  <span key={s} className="flex items-center gap-1 text-[10px] text-muted">
                    <span className={cn('w-2 h-2 rounded-full', STATUS_META[s].dot)} />
                    {STATUS_META[s].label} ({counts[s]})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setFilter('all')}
              className={cn(
                'shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                filter === 'all'
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-line text-muted hover:bg-line'
              )}>
              All ({apps.length})
            </button>
            {ALL_STATUSES.filter(s => (counts[s] || 0) > 0).map(s => (
              <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
                  filter === s
                    ? cn(STATUS_META[s].bg, STATUS_META[s].text, STATUS_META[s].border)
                    : 'bg-line text-muted border-transparent hover:bg-line'
                )}>
                {STATUS_META[s].icon} {STATUS_META[s].label} ({counts[s]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-2xl mx-auto px-6 py-5 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-paper-raised rounded-2xl border border-dashed border-line p-12 text-center">
            <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6 text-brand" />
            </div>
            <p className="font-bold text-ink-soft mb-1">
              {filter === 'all' ? 'No applications yet' : `No ${STATUS_META[filter as AppStatus].label} applications`}
            </p>
            <p className="text-sm text-muted mb-5">
              {filter === 'all'
                ? 'Log your first application or browse jobs to find H-1B sponsors'
                : 'Try a different filter'}
            </p>
            {filter === 'all' && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-deep transition-colors">
                  <Plus className="w-4 h-4" /> Add Application
                </button>
                <Link href="/jobs"
                  className="flex items-center gap-2 px-5 py-2.5 bg-paper-raised border border-line text-ink-soft text-sm font-semibold rounded-xl hover:bg-paper transition-colors">
                  <Sparkles className="w-4 h-4 text-brand" /> Browse Jobs
                </Link>
              </div>
            )}
          </div>
        ) : (
          filtered.map(app => (
            <AppCard key={app.id} app={app}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={setEditApp}
            />
          ))
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <AppModal
          title="Log New Application"
          submitLabel="Add Application"
          initial={{ ...EMPTY_FORM, company_name: prefill || EMPTY_FORM.company_name }}
          onSubmit={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Edit modal */}
      {editApp && (
        <AppModal
          title={`Edit — ${editApp.company_name}`}
          submitLabel="Save Changes"
          initial={{
            company_name: editApp.company_name,
            job_title:    editApp.job_title    ?? '',
            job_url:      editApp.job_url      ?? '',
            status:       editApp.status as AppStatus,
            applied_date: editApp.applied_date ?? '',
            notes:        editApp.notes        ?? '',
          }}
          onSubmit={handleEdit}
          onClose={() => setEditApp(null)}
        />
      )}
    </div>
  )
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-paper">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-paper-raised rounded-2xl border border-line animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <ApplicationsInner />
    </Suspense>
  )
}
