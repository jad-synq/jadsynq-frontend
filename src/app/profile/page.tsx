'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  CheckCircle, Shield, Briefcase, Bookmark, Search,
  ChevronRight, TrendingUp, Award,
  Building2, LogOut, Settings, Mail,
  BarChart3, Sparkles, Target, Clock,
  ArrowUpRight, FileText, Star, Upload
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  getMe, updateMe, getApplications, getSavedCompanies,
  getResume, saveResume, UserResume,
  VisaType, AppStatus, JobApplication
} from '@/lib/api'
import { cn } from '@/lib/utils'
import BrandedLoader from '@/components/ui/BrandedLoader'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { extractResumeText } from '@/lib/pdf'

// ─── Constants ───────────────────────────────────────────────────────────────

const VISA_OPTIONS: {
  value: VisaType; label: string; desc: string
  bg: string; text: string; border: string; ring: string
}[] = [
  { value: 'OPT',      label: 'OPT',        desc: 'Optional Practical Training',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   ring: 'ring-blue-400'   },
  { value: 'STEM_OPT', label: 'STEM OPT',   desc: '24-month STEM extension',       bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', ring: 'ring-violet-400' },
  { value: 'H1B',      label: 'H-1B',       desc: 'Employer-sponsored visa',       bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', ring: 'ring-orange-400' },
  { value: 'GC',       label: 'Green Card', desc: 'Permanent resident',            bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',ring: 'ring-emerald-400'},
  { value: 'CITIZEN',  label: 'US Citizen', desc: 'No sponsorship needed',         bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200',   ring: 'ring-gray-400'   },
  { value: 'OTHER',    label: 'Other',      desc: 'Other visa status',             bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200',   ring: 'ring-gray-300'   },
]

const VISA_TIPS: Record<VisaType, { headline: string; body: string; next: string | null; urgent: boolean }> = {
  OPT:      { headline: 'OPT — 12 months remaining',         body: 'Focus on E-Verify enrolled companies with high H-1B approval rates. Start applications early — the H-1B lottery cap fills fast.',            next: 'Apply for STEM OPT extension if eligible',             urgent: true  },
  STEM_OPT: { headline: 'STEM OPT — up to 24 months',        body: 'Your employer must be E-Verify enrolled. Use this window to secure an H-1B sponsor. Look for companies with consecutive approval years.',    next: 'Secure H-1B sponsor before STEM OPT expires',          urgent: true  },
  H1B:      { headline: 'H-1B — employer sponsored',         body: 'You can transfer your H-1B to a new employer without re-entering the lottery. Target companies with EB-2/EB-3 Green Card pipelines.',        next: 'Consider initiating Green Card sponsorship (EB-2/EB-3)',urgent: false },
  GC:       { headline: 'Green Card — permanent resident',   body: 'You may work for any employer without restriction. No sponsorship needed. Explore career growth without visa constraints.',                   next: 'Eligible for citizenship after 5 years as a GC holder', urgent: false },
  CITIZEN:  { headline: 'US Citizen — no restrictions',      body: 'All companies are available to you. No sponsorship needed. Focus entirely on role fit, compensation, and growth.',                            next: null,                                                    urgent: false },
  OTHER:    { headline: 'Other visa status',                  body: 'Check with your employer or an immigration attorney to understand your work authorisation and sponsorship options.',                          next: null,                                                    urgent: false },
}

const STATUS_META: Record<AppStatus, { label: string; text: string; bg: string; bar: string; dot: string }> = {
  applied:      { label: 'Applied',       text: 'text-blue-700',    bg: 'bg-blue-50',    bar: 'bg-blue-400',    dot: 'bg-blue-400'    },
  phone_screen: { label: 'Phone Screen',  text: 'text-yellow-700',  bg: 'bg-yellow-50',  bar: 'bg-yellow-400',  dot: 'bg-yellow-400'  },
  onsite:       { label: 'On-site',       text: 'text-violet-700',  bg: 'bg-violet-50',  bar: 'bg-violet-400',  dot: 'bg-violet-400'  },
  offer:        { label: 'Offer',         text: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  rejected:     { label: 'Rejected',      text: 'text-red-600',     bg: 'bg-red-50',     bar: 'bg-red-400',     dot: 'bg-red-400'     },
  withdrawn:    { label: 'Withdrawn',     text: 'text-gray-500',    bg: 'bg-gray-100',   bar: 'bg-gray-300',    dot: 'bg-gray-300'    },
}

const JOURNEY = [
  { key: 'OPT',     label: 'OPT',        sub: '12 months',   after: ['STEM_OPT','H1B','GC','CITIZEN'] },
  { key: 'STEM_OPT',label: 'STEM OPT',   sub: '24 months',   after: ['H1B','GC','CITIZEN'] },
  { key: 'H1B',     label: 'H-1B',       sub: '3-yr + ext.', after: ['GC','CITIZEN'] },
  { key: 'GC',      label: 'Green Card', sub: 'Permanent',   after: ['CITIZEN'] },
  { key: 'CITIZEN', label: 'Citizenship',sub: 'After 5 yrs', after: [] },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function Avatar({ email }: { email: string }) {
  const initials = email.split('@')[0].slice(0, 2).toUpperCase()
  return (
    <div className="relative">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#0f7a34] flex items-center justify-center text-white text-2xl font-black shadow-lg border-4 border-white/20">
        {initials}
      </div>
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full" />
    </div>
  )
}

function MetricCard({ icon, value, label, sub, accent }: {
  icon: React.ReactNode; value: number | string; label: string; sub?: string; accent: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center mb-3', accent)}>
        {icon}
      </div>
      <p className="text-3xl font-black text-gray-900 leading-none">{value}</p>
      <p className="text-sm font-semibold text-gray-600 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Unauthenticated ─────────────────────────────────────────────────────────

function UnauthenticatedView() {
  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f2d1a] via-[#14532d] to-[#16a34a] px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded-2xl mb-5">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Your Profile</h1>
        <p className="text-green-200 max-w-sm mx-auto text-sm leading-relaxed">
          Track your H-1B job search, monitor application pipeline, and get visa-specific guidance.
        </p>
        <Link href="/auth"
          className="inline-flex items-center gap-2 mt-6 bg-white text-[#16a34a] font-bold text-sm px-7 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg">
          Get started free <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Feature list */}
      <div className="max-w-md mx-auto px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {[
            { icon: <BarChart3 className="w-4 h-4 text-[#16a34a]" />,   title: 'Application Dashboard',   desc: 'Pipeline view of every application stage' },
            { icon: <Target className="w-4 h-4 text-blue-500" />,        title: 'Visa Timeline',           desc: 'Step-by-step journey from OPT to Citizenship' },
            { icon: <Star className="w-4 h-4 text-amber-500" />,         title: 'Saved Companies',         desc: 'Bookmark sponsors and track their H-1B data' },
            { icon: <Shield className="w-4 h-4 text-violet-500" />,      title: 'Private by Default',      desc: 'Your data is never shared or sold' },
          ].map(f => (
            <div key={f.title} className="flex items-center gap-4 px-5 py-4">
              <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">{f.icon}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      <div className="bg-gradient-to-br from-[#0f2d1a] to-[#16a34a] h-44" />
      <div className="max-w-2xl mx-auto px-6 -mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <Skeleton className="h-4 w-32" />
            <SkeletonText lines={2} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [visaType, setVisaType]         = useState<VisaType | null>(null)
  const [selected, setSelected]         = useState<VisaType | null>(null)
  const [loading, setLoading]           = useState(true)
  const [slowLoad, setSlowLoad]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [saveOk, setSaveOk]             = useState(false)
  const [applications, setApps]         = useState<JobApplication[]>([])
  const [savedCount, setSavedCount]     = useState(0)
  const [tab, setTab]                   = useState<'overview' | 'visa' | 'settings'>('overview')
  const [resume, setResume]             = useState<UserResume | null>(null)
  const [resumePaste, setResumePaste]   = useState('')
  const [resumeSaving, setResumeSaving] = useState(false)
  const [resumeSaveOk, setResumeSaveOk] = useState(false)
  const [showReplaceResume, setShowReplaceResume] = useState(false)
  const resumeFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    const slowTimer = setTimeout(() => setSlowLoad(true), 5000)
    Promise.all([
      getMe(),
      getApplications().catch(() => ({ data: [] as JobApplication[] })),
      getSavedCompanies().catch(() => ({ data: [] })),
      getResume().catch(() => null),
    ]).then(([me, apps, saved, res]) => {
      setVisaType(me.data.visa_type as VisaType | null)
      setSelected(me.data.visa_type as VisaType | null)
      setApps(apps.data)
      setSavedCount(saved.data.length)
      setResume(res ? res.data : null)
    }).finally(() => {
      clearTimeout(slowTimer)
      setSlowLoad(false)
      setLoading(false)
    })
  }, [user, authLoading])

  if (authLoading || (loading && user)) return slowLoad ? <BrandedLoader /> : <LoadingSkeleton />
  if (!user) return <UnauthenticatedView />

  // Derived stats
  const counts = applications.reduce<Record<string, number>>((a, x) => {
    a[x.status] = (a[x.status] || 0) + 1; return a
  }, {})
  const active = (counts.applied || 0) + (counts.phone_screen || 0) + (counts.onsite || 0)
  const offers = counts.offer || 0
  const winRate = applications.length
    ? Math.round(((counts.offer || 0) / applications.length) * 100)
    : 0
  const handle = user.email?.split('@')[0] ?? 'User'
  const currentVisa = VISA_OPTIONS.find(v => v.value === visaType)
  const tip = visaType ? VISA_TIPS[visaType] : null

  const handleSaveResumePaste = async () => {
    if (!resumePaste.trim()) return
    setResumeSaving(true)
    try {
      const res = await saveResume({ resume_text: resumePaste, resume_data: null })
      setResume(res.data)
      setResumePaste('')
      setResumeSaveOk(true)
      setShowReplaceResume(false)
      setTimeout(() => setResumeSaveOk(false), 3000)
    } catch { /* ignore */ } finally { setResumeSaving(false) }
  }

  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const text = await extractResumeText(file)
    setResumePaste(text)
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true); setSaveOk(false)
    try {
      await updateMe(selected)
      setVisaType(selected); setSaveOk(true)
      setTimeout(() => setSaveOk(false), 3000)
    } catch { /**/ } finally { setSaving(false) }
  }

  const TABS = [
    { id: 'overview' as const, label: 'Overview',    icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'visa'     as const, label: 'Visa Status', icon: <Target className="w-3.5 h-3.5" />   },
    { id: 'settings' as const, label: 'Settings',    icon: <Settings className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="min-h-screen bg-[#f0fdf4]">

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-[#0f2d1a] via-[#14532d] to-[#166534] pb-0">
        <div className="max-w-2xl mx-auto px-6 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <Avatar email={user.email ?? 'U'} />
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">{handle}</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail className="w-3 h-3 text-green-400" />
                  <p className="text-xs text-green-300">{user.email}</p>
                </div>
                {currentVisa && (
                  <span className={cn(
                    'inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold border',
                    currentVisa.bg, currentVisa.text, currentVisa.border
                  )}>
                    {currentVisa.label}
                  </span>
                )}
              </div>
            </div>
            <button onClick={signOut}
              className="flex items-center gap-1.5 text-xs font-medium text-green-300 hover:text-red-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>

          {/* Inline stats strip */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {[
              { n: applications.length, l: 'Applied'   },
              { n: active,              l: 'Active'     },
              { n: offers,              l: 'Offers'     },
              { n: `${winRate}%`,       l: 'Win rate'   },
            ].map(s => (
              <div key={s.l} className="bg-white/10 backdrop-blur rounded-xl px-3 py-2.5 text-center border border-white/10">
                <p className="text-lg font-black text-white">{s.n}</p>
                <p className="text-[10px] text-green-300 mt-0.5 font-medium">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex gap-0.5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3 text-sm font-semibold rounded-t-xl transition-all',
                  tab === t.id
                    ? 'bg-[#f0fdf4] text-[#16a34a]'
                    : 'text-green-300/70 hover:text-green-200 hover:bg-white/5'
                )}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* ════ OVERVIEW ════ */}
        {tab === 'overview' && (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard icon={<Briefcase className="w-4 h-4 text-[#16a34a]" />}  value={applications.length} label="Total Applied"  accent="bg-green-50"  />
              <MetricCard icon={<TrendingUp className="w-4 h-4 text-blue-500" />}   value={active}              label="In Progress"    sub="active now"      accent="bg-blue-50"   />
              <MetricCard icon={<Award className="w-4 h-4 text-amber-500" />}       value={offers}              label="Offers"         sub="received"        accent="bg-amber-50"  />
              <MetricCard icon={<Bookmark className="w-4 h-4 text-violet-500" />}   value={savedCount}          label="Saved"          sub="companies"       accent="bg-violet-50" />
            </div>

            {/* Pipeline */}
            {applications.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-900">Application Pipeline</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{applications.length} total applications</p>
                  </div>
                  <Link href="/applications"
                    className="flex items-center gap-1 text-xs font-semibold text-[#16a34a] hover:underline">
                    Manage all <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Segmented bar */}
                <div className="flex h-2.5 rounded-full overflow-hidden mb-5 gap-px">
                  {Object.entries(STATUS_META).map(([s, m]) => {
                    const pct = applications.length ? ((counts[s] || 0) / applications.length) * 100 : 0
                    if (pct === 0) return null
                    return <div key={s} className={cn('h-full', m.bar)} style={{ width: `${pct}%` }} />
                  })}
                </div>

                <div className="space-y-2">
                  {Object.entries(STATUS_META).map(([s, m]) => {
                    const n = counts[s] || 0
                    if (n === 0) return null
                    const pct = Math.round((n / applications.length) * 100)
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', m.dot)} />
                        <span className="text-sm text-gray-600 flex-1">{m.label}</span>
                        <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', m.bar)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-500 w-5 text-right">{n}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center shadow-sm">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6 text-[#16a34a]" />
                </div>
                <p className="font-bold text-gray-700 mb-1">No applications yet</p>
                <p className="text-sm text-gray-400 mb-5">Browse jobs and log your first application in one click</p>
                <Link href="/jobs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#16a34a] text-white text-sm font-bold rounded-xl hover:bg-[#15803d] transition-colors">
                  <Sparkles className="w-4 h-4" /> Browse Jobs
                </Link>
              </div>
            )}

            {/* Recent activity */}
            {applications.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <h3 className="font-bold text-gray-900">Recent Activity</h3>
                  <Link href="/applications" className="text-xs font-semibold text-[#16a34a] hover:underline flex items-center gap-1">
                    View all <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {applications.slice(0, 6).map(app => {
                    const m = STATUS_META[app.status as AppStatus]
                    return (
                      <div key={app.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{app.company_name}</p>
                          <p className="text-xs text-gray-400 truncate">{app.job_title || '—'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold', m.bg, m.text)}>
                            {m.label}
                          </span>
                          {app.applied_date && (
                            <span className="text-[10px] text-gray-400">{app.applied_date}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* My Resume */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-violet-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">My Resume</p>
                  <p className="text-xs text-gray-400">Used for job matching in the &ldquo;For You&rdquo; tab</p>
                </div>
                {resume && (
                  <Link href="/resume-builder"
                    className="text-xs font-semibold text-[#16a34a] hover:underline flex items-center gap-1">
                    Edit in Builder <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={resumeFileRef}
                type="file"
                accept=".pdf,.txt,.text,application/pdf,text/plain"
                className="hidden"
                onChange={handleResumeFileUpload}
              />

              {resume && !showReplaceResume ? (
                <div className="px-5 py-4 space-y-3">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {resume.resume_text.split(/\s+/).filter(Boolean).length} words
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Updated {new Date(resume.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 leading-relaxed line-clamp-3 font-mono">
                    {resume.resume_text.slice(0, 150)}{resume.resume_text.length > 150 ? '…' : ''}
                  </p>
                  {resumeSaveOk && (
                    <span className="flex items-center gap-1 text-xs text-[#16a34a] font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Resume updated!
                    </span>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link href="/jobs"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-lg transition-colors">
                      <Sparkles className="w-3 h-3" /> See Matched Jobs
                    </Link>
                    <button
                      onClick={() => { setShowReplaceResume(true); setResumePaste('') }}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-gray-300 text-gray-600 text-xs font-semibold rounded-lg transition-colors">
                      <Upload className="w-3 h-3" /> Replace Resume
                    </button>
                    <button
                      onClick={() => { setResume(null); setResumePaste('') }}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 text-xs font-semibold rounded-lg border border-red-100 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 space-y-3">
                  {!resume && (
                    <p className="text-sm text-gray-500">No resume saved yet. Paste text or upload a .txt file to get job matches.</p>
                  )}

                  {/* File upload button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resumeFileRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-violet-300 hover:text-violet-600 text-gray-600 text-xs font-semibold rounded-lg transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Upload PDF or .txt
                    </button>
                    {resumePaste && (
                      <span className="text-xs text-emerald-600 font-semibold">
                        ✓ {resumePaste.split(/\s+/).filter(Boolean).length} words loaded
                      </span>
                    )}
                  </div>

                  <textarea
                    value={resumePaste}
                    onChange={e => setResumePaste(e.target.value)}
                    placeholder="Or paste your resume text here…"
                    rows={5}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] resize-none font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveResumePaste}
                      disabled={resumeSaving || !resumePaste.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-lg disabled:opacity-40 transition-colors">
                      {resumeSaving ? 'Saving…' : 'Save Resume'}
                    </button>
                    {showReplaceResume && (
                      <button
                        onClick={() => { setShowReplaceResume(false); setResumePaste('') }}
                        className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">
                        Cancel
                      </button>
                    )}
                    {resumeSaveOk && (
                      <span className="flex items-center gap-1 text-xs text-[#16a34a] font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> Saved!
                      </span>
                    )}
                  </div>
                  {!resume && (
                    <Link href="/resume-builder"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16a34a] hover:underline">
                      <FileText className="w-3.5 h-3.5" /> Build from scratch in Resume Builder →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Nav shortcuts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <p className="px-5 pt-4 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Quick Access</p>
              {[
                { href: '/jobs',         icon: <Sparkles className="w-4 h-4 text-[#16a34a]" />,   accent: 'bg-green-50',  label: 'Browse Jobs',        desc: 'Jobs with H-1B sponsorship data' },
                { href: '/',             icon: <Search className="w-4 h-4 text-blue-500" />,       accent: 'bg-blue-50',   label: 'Search Companies',   desc: 'Find verified H-1B sponsors' },
                { href: '/applications', icon: <Briefcase className="w-4 h-4 text-violet-500" />,  accent: 'bg-violet-50', label: 'My Applications',    desc: `${applications.length} tracked` },
                { href: '/saved',        icon: <Bookmark className="w-4 h-4 text-amber-500" />,    accent: 'bg-amber-50',  label: 'Saved Companies',    desc: `${savedCount} bookmarked` },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors border-t border-gray-50 first-of-type:border-0">
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', item.accent)}>{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ════ VISA STATUS ════ */}
        {tab === 'visa' && (
          <>
            {/* Tip card */}
            {tip && (
              <div className={cn(
                'rounded-2xl p-5 border',
                tip.urgent
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-green-50 border-green-200'
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    tip.urgent ? 'bg-amber-100' : 'bg-green-100')}>
                    {tip.urgent
                      ? <Clock className="w-4 h-4 text-amber-600" />
                      : <CheckCircle className="w-4 h-4 text-[#16a34a]" />}
                  </div>
                  <div>
                    <p className={cn('font-bold text-sm', tip.urgent ? 'text-amber-800' : 'text-green-800')}>
                      {tip.headline}
                    </p>
                    <p className={cn('text-sm mt-1 leading-relaxed', tip.urgent ? 'text-amber-700' : 'text-green-700')}>
                      {tip.body}
                    </p>
                    {tip.next && (
                      <div className={cn('mt-3 flex items-center gap-1.5 text-xs font-semibold',
                        tip.urgent ? 'text-amber-600' : 'text-green-600')}>
                        <ArrowUpRight className="w-3.5 h-3.5" /> Next step: {tip.next}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Visa selector */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-1">Work Authorization</h2>
              <p className="text-sm text-gray-400 mb-5">Select your current status so we can tailor results.</p>
              <div className="grid grid-cols-2 gap-2.5">
                {VISA_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setSelected(opt.value)}
                    className={cn(
                      'flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all',
                      selected === opt.value
                        ? cn(opt.bg, opt.text, opt.border, 'ring-2 ring-offset-1', opt.ring)
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/70'
                    )}>
                    <span className={cn('text-sm font-bold', selected === opt.value ? '' : 'text-gray-900')}>
                      {opt.label}
                    </span>
                    <span className={cn('text-xs mt-1', selected === opt.value ? 'opacity-70' : 'text-gray-400')}>
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-5">
                <button onClick={handleSave}
                  disabled={saving || selected === visaType || !selected}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold rounded-xl disabled:opacity-40 transition-colors">
                  {saving ? 'Saving…' : <><CheckCircle className="w-4 h-4" /> Save changes</>}
                </button>
                {saveOk && (
                  <span className="flex items-center gap-1.5 text-sm text-[#16a34a] font-semibold">
                    <CheckCircle className="w-4 h-4" /> Saved
                  </span>
                )}
              </div>
            </div>

            {/* Journey timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-1">International Work Journey</h3>
              <p className="text-xs text-gray-400 mb-5">Typical path from student visa to US citizen</p>
              <div className="relative">
                {/* Vertical connector */}
                <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-gray-100" />
                <div className="space-y-5">
                  {JOURNEY.map((step, i) => {
                    const realDone = visaType ? step.after.some(a => a === visaType) || (step.key !== 'CITIZEN' && ['GC','CITIZEN'].includes(visaType) && ['OPT','STEM_OPT','H1B'].includes(step.key)) || (step.key === 'GC' && visaType === 'CITIZEN') : false
                    const realActive = visaType === step.key
                    const realFuture = !realDone && !realActive
                    return (
                      <div key={step.key} className="flex items-start gap-4 relative">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black border-2 z-10',
                          realDone   ? 'bg-[#16a34a] border-[#16a34a] text-white' :
                          realActive ? 'bg-white border-[#16a34a] text-[#16a34a] ring-4 ring-green-100' :
                                       'bg-white border-gray-200 text-gray-300'
                        )}>
                          {realDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
                        </div>
                        <div className={cn('flex-1 pb-1', realFuture ? 'opacity-40' : '')}>
                          <div className="flex items-center gap-2">
                            <p className={cn('text-sm font-bold',
                              realDone || realActive ? 'text-gray-900' : 'text-gray-400')}>
                              {step.label}
                            </p>
                            {realActive && (
                              <span className="px-2 py-0.5 bg-green-100 text-[#16a34a] text-[10px] font-bold rounded-full">
                                You are here
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{step.sub}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════ SETTINGS ════ */}
        {tab === 'settings' && (
          <>
            {/* Account */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <p className="px-5 pt-4 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account</p>
              <div className="divide-y divide-gray-50">
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Email address</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                </div>
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Visa status</p>
                    <p className="text-xs text-gray-400 mt-0.5">{currentVisa?.label ?? 'Not set'}</p>
                  </div>
                  <button onClick={() => setTab('visa')}
                    className="text-xs font-semibold text-[#16a34a] hover:underline">
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <p className="px-5 pt-4 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Privacy</p>
              <div className="divide-y divide-gray-50">
                {[
                  { icon: <Shield className="w-4 h-4 text-[#16a34a]" />,    accent: 'bg-green-50',  title: 'Visa status is private',      desc: 'Only personalises your feed — never shared externally.' },
                  { icon: <Bookmark className="w-4 h-4 text-amber-500" />,  accent: 'bg-amber-50',  title: 'Saved companies are private',  desc: 'Only visible to you when logged in.' },
                  { icon: <Briefcase className="w-4 h-4 text-blue-500" />,  accent: 'bg-blue-50',   title: 'Applications are private',     desc: 'Your tracker is only accessible to you.' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 px-5 py-4">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', item.accent)}>{item.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats snapshot */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Your Data Snapshot</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { n: applications.length, l: 'Applications', bg: 'bg-green-50',  t: 'text-[#16a34a]' },
                  { n: savedCount,          l: 'Saved',        bg: 'bg-amber-50',  t: 'text-amber-600' },
                  { n: offers,              l: 'Offers',       bg: 'bg-violet-50', t: 'text-violet-600' },
                ].map(s => (
                  <div key={s.l} className={cn('rounded-xl p-3 text-center', s.bg)}>
                    <p className={cn('text-2xl font-black', s.t)}>{s.n}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Session</p>
              <button onClick={signOut}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl text-sm font-bold transition-all">
                <LogOut className="w-4 h-4" /> Sign out of JAD Synq
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
