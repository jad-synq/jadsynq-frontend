'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  User, CheckCircle, Shield, Briefcase, Bookmark, Search,
  ChevronRight, TrendingUp, Clock, Award, Target,
  Building2, LogOut, Settings, Bell, Mail,
  CalendarDays, BarChart3, Sparkles
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getMe, updateMe, getApplications, getSavedCompanies, VisaType, AppStatus, JobApplication } from '@/lib/api'
import { cn } from '@/lib/utils'

const VISA_OPTIONS: { value: VisaType; label: string; desc: string; color: string; ring: string }[] = [
  { value: 'OPT',     label: 'OPT',        desc: 'Optional Practical Training',  color: 'border-blue-200 bg-blue-50 text-blue-700',    ring: 'ring-blue-400' },
  { value: 'STEM_OPT',label: 'STEM OPT',   desc: '24-month STEM extension',      color: 'border-purple-200 bg-purple-50 text-purple-700', ring: 'ring-purple-400' },
  { value: 'H1B',     label: 'H-1B',       desc: 'H-1B visa holder',             color: 'border-orange-200 bg-orange-50 text-orange-700', ring: 'ring-orange-400' },
  { value: 'GC',      label: 'Green Card', desc: 'Permanent resident',           color: 'border-green-200 bg-green-50 text-green-700',  ring: 'ring-green-400' },
  { value: 'CITIZEN', label: 'US Citizen', desc: 'No sponsorship needed',        color: 'border-gray-200 bg-gray-50 text-gray-700',     ring: 'ring-gray-400' },
  { value: 'OTHER',   label: 'Other',      desc: 'Other visa status',            color: 'border-gray-200 bg-gray-50 text-gray-700',     ring: 'ring-gray-400' },
]

const VISA_TIPS: Record<VisaType, { title: string; tip: string; next: string | null }> = {
  OPT:      { title: 'You\'re on OPT', tip: 'You have up to 12 months to find H-1B sponsorship. Focus on E-Verify enrolled companies.', next: 'Apply for STEM OPT extension if eligible' },
  STEM_OPT: { title: 'You\'re on STEM OPT', tip: '24-month extension gives you more time. Your employer must be E-Verify enrolled.', next: 'Get H-1B sponsor before STEM OPT expires' },
  H1B:      { title: 'You\'re on H-1B', tip: 'You can transfer your H-1B to a new employer. Look for companies with high approval rates.', next: 'Consider Green Card sponsorship (EB-2/EB-3)' },
  GC:       { title: 'Green Card Holder', tip: 'You can work anywhere without sponsorship restrictions.', next: 'Consider US citizenship after 5 years' },
  CITIZEN:  { title: 'US Citizen', tip: 'No sponsorship needed — all companies are available to you.', next: null },
  OTHER:    { title: 'Other Visa Status', tip: 'Check with your employer or attorney about your work authorization.', next: null },
}

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; bg: string; dot: string }> = {
  applied:      { label: 'Applied',       color: 'text-blue-700',   bg: 'bg-blue-50',   dot: 'bg-blue-400' },
  phone_screen: { label: 'Phone Screen',  color: 'text-yellow-700', bg: 'bg-yellow-50', dot: 'bg-yellow-400' },
  onsite:       { label: 'Onsite',        color: 'text-purple-700', bg: 'bg-purple-50', dot: 'bg-purple-400' },
  offer:        { label: 'Offer',         color: 'text-green-700',  bg: 'bg-green-50',  dot: 'bg-green-400' },
  rejected:     { label: 'Rejected',      color: 'text-red-600',    bg: 'bg-red-50',    dot: 'bg-red-400' },
  withdrawn:    { label: 'Withdrawn',     color: 'text-gray-500',   bg: 'bg-gray-50',   dot: 'bg-gray-300' },
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', color)}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function UnauthenticatedView() {
  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#16a34a] rounded-2xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-gray-500 max-w-xs mx-auto">
            Track applications, save companies, and get personalised H-1B insights.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What you get</p>
          <div className="space-y-3">
            {[
              { icon: <BarChart3 className="w-4 h-4 text-[#16a34a]" />, text: 'Application pipeline dashboard' },
              { icon: <Target className="w-4 h-4 text-blue-500" />, text: 'Visa timeline & sponsorship tips' },
              { icon: <Bookmark className="w-4 h-4 text-amber-500" />, text: 'Save companies & track progress' },
              { icon: <Bell className="w-4 h-4 text-purple-500" />, text: 'Alerts for H-1B sponsor companies' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">{item.icon}</div>
                <p className="text-sm text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#16a34a] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Private by default</p>
              <p className="text-xs text-gray-500 mt-0.5">Your data is never shared. Visa status only personalises your experience.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#16a34a] rounded-2xl p-6 text-center text-white">
          <p className="font-bold text-lg mb-1">Ready to track your job search?</p>
          <p className="text-green-200 text-sm mb-4">Sign in to unlock your profile dashboard.</p>
          <Link href="/auth"
            className="inline-block bg-white text-[#16a34a] font-bold text-sm px-8 py-2.5 rounded-xl hover:bg-green-50 transition-colors">
            Get started free →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [visaType, setVisaType] = useState<VisaType | null>(null)
  const [selected, setSelected] = useState<VisaType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [savedCount, setSavedCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'visa' | 'settings'>('overview')

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    Promise.all([
      getMe(),
      getApplications().catch(() => ({ data: [] })),
      getSavedCompanies().catch(() => ({ data: [] })),
    ]).then(([me, apps, saved]) => {
      setVisaType(me.data.visa_type as VisaType | null)
      setSelected(me.data.visa_type as VisaType | null)
      setApplications(apps.data)
      setSavedCount(saved.data.length)
    }).finally(() => setLoading(false))
  }, [user, authLoading])

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen bg-[#f0fdf4]">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return <UnauthenticatedView />

  // Compute stats
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const activeApps = (statusCounts['applied'] || 0) + (statusCounts['phone_screen'] || 0) + (statusCounts['onsite'] || 0)
  const offers = statusCounts['offer'] || 0
  const recentApps = [...applications].slice(0, 5)

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    setSaved(false)
    try {
      await updateMe(selected)
      setVisaType(selected)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  const visaTip = visaType ? VISA_TIPS[visaType] : null

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      {/* Hero header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#16a34a] flex items-center justify-center text-white text-xl font-bold shadow-sm">
                {(user.email ?? '?')[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.email?.split('@')[0]}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                {visaType && (
                  <span className={cn(
                    'inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border',
                    VISA_OPTIONS.find(v => v.value === visaType)?.color
                  )}>
                    {VISA_OPTIONS.find(v => v.value === visaType)?.label}
                  </span>
                )}
              </div>
            </div>
            <button onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 border-b border-gray-100">
            {([
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { id: 'visa',     label: 'Visa Status', icon: <Target className="w-3.5 h-3.5" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
                  activeTab === tab.id
                    ? 'border-[#16a34a] text-[#16a34a]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<Briefcase className="w-4.5 h-4.5 text-[#16a34a]" style={{ width: 18, height: 18 }} />}
                label="Total Applied"
                value={applications.length}
                color="bg-green-50"
              />
              <StatCard
                icon={<TrendingUp className="w-4.5 h-4.5 text-blue-500" style={{ width: 18, height: 18 }} />}
                label="In Progress"
                value={activeApps}
                sub="active interviews"
                color="bg-blue-50"
              />
              <StatCard
                icon={<Award className="w-4.5 h-4.5 text-amber-500" style={{ width: 18, height: 18 }} />}
                label="Offers"
                value={offers}
                color="bg-amber-50"
              />
              <StatCard
                icon={<Bookmark className="w-4.5 h-4.5 text-purple-500" style={{ width: 18, height: 18 }} />}
                label="Saved"
                value={savedCount}
                sub="companies"
                color="bg-purple-50"
              />
            </div>

            {/* Application pipeline */}
            {applications.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Application Pipeline</h3>
                  <Link href="/applications" className="text-xs text-[#16a34a] font-semibold hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="space-y-2.5">
                  {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                    const count = statusCounts[status] || 0
                    if (count === 0 && status !== 'applied') return null
                    const pct = applications.length > 0 ? (count / applications.length) * 100 : 0
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div className={cn('w-2 h-2 rounded-full shrink-0', cfg.dot)} />
                        <span className="text-sm text-gray-600 w-28 shrink-0">{cfg.label}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', cfg.dot)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-6 text-right shrink-0">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent applications */}
            {recentApps.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Recent Applications</h3>
                  <Link href="/applications" className="text-xs text-[#16a34a] font-semibold hover:underline">
                    Manage →
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentApps.map(app => {
                    const cfg = STATUS_CONFIG[app.status as AppStatus]
                    return (
                      <div key={app.id} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{app.company_name}</p>
                          <p className="text-xs text-gray-400 truncate">{app.job_title || 'No title'}</p>
                        </div>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold shrink-0', cfg.bg, cfg.color)}>
                          {cfg.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <Briefcase className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-500 mb-1">No applications yet</p>
                <p className="text-xs text-gray-400 mb-4">Search for jobs and log your first application</p>
                <Link href="/jobs"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#16a34a] text-white text-sm font-bold rounded-xl">
                  <Sparkles className="w-3.5 h-3.5" /> Browse jobs
                </Link>
              </div>
            )}

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
              {[
                { href: '/jobs',          icon: <Sparkles className="w-4 h-4 text-[#16a34a]" />,  label: 'Browse Jobs',         desc: 'Find H-1B sponsor roles' },
                { href: '/',              icon: <Search className="w-4 h-4 text-blue-500" />,      label: 'Search Companies',    desc: 'Find H-1B sponsors' },
                { href: '/applications',  icon: <Briefcase className="w-4 h-4 text-purple-500" />, label: 'My Applications',     desc: 'Track job applications' },
                { href: '/saved',         icon: <Bookmark className="w-4 h-4 text-amber-500" />,   label: 'Saved Companies',     desc: `${savedCount} bookmarked` },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── VISA TAB ── */}
        {activeTab === 'visa' && (
          <div className="space-y-5">
            {/* Visa tip banner */}
            {visaTip && (
              <div className="bg-[#16a34a] rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" />
                  <p className="font-bold text-sm">{visaTip.title}</p>
                </div>
                <p className="text-green-100 text-sm leading-relaxed">{visaTip.tip}</p>
                {visaTip.next && (
                  <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                    <Clock className="w-3.5 h-3.5 text-green-200 shrink-0" />
                    <p className="text-xs text-green-100 font-medium">Next: {visaTip.next}</p>
                  </div>
                )}
              </div>
            )}

            {/* Visa selector */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-1">Work Authorization</h2>
              <p className="text-sm text-gray-500 mb-4">
                Helps us surface the most relevant companies for your situation.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {VISA_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setSelected(opt.value)}
                    className={cn(
                      'flex flex-col items-start p-3.5 rounded-xl border text-left transition-all',
                      selected === opt.value
                        ? cn(opt.color, 'ring-2 ring-offset-1', opt.ring)
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                    )}>
                    <span className={cn('text-sm font-semibold', selected === opt.value ? '' : 'text-gray-900')}>
                      {opt.label}
                    </span>
                    <span className={cn('text-xs mt-0.5', selected === opt.value ? 'opacity-80' : 'text-gray-400')}>
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-5">
                <button onClick={handleSave}
                  disabled={saving || selected === visaType || !selected}
                  className="px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors">
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                {saved && (
                  <span className="flex items-center gap-1.5 text-sm text-[#16a34a] font-medium">
                    <CheckCircle className="w-4 h-4" /> Saved!
                  </span>
                )}
                {visaType && !saved && (
                  <span className="text-xs text-gray-400">
                    Current: {VISA_OPTIONS.find(o => o.value === visaType)?.label}
                  </span>
                )}
              </div>
            </div>

            {/* Visa journey */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Typical international journey</h3>
              <div className="space-y-3">
                {[
                  { step: 'OPT', desc: '12-month post-graduation work auth', done: visaType ? ['STEM_OPT','H1B','GC','CITIZEN'].includes(visaType) : false, active: visaType === 'OPT' },
                  { step: 'STEM OPT', desc: '24-month extension for STEM graduates', done: visaType ? ['H1B','GC','CITIZEN'].includes(visaType) : false, active: visaType === 'STEM_OPT' },
                  { step: 'H-1B', desc: 'Employer-sponsored specialty occupation visa', done: visaType ? ['GC','CITIZEN'].includes(visaType) : false, active: visaType === 'H1B' },
                  { step: 'Green Card', desc: 'Permanent resident status (EB-2/EB-3)', done: visaType === 'CITIZEN', active: visaType === 'GC' },
                  { step: 'US Citizen', desc: 'Full citizenship after 5 years as GC', done: false, active: visaType === 'CITIZEN' },
                ].map((item, i) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 border-2',
                      item.done ? 'bg-[#16a34a] border-[#16a34a] text-white' :
                      item.active ? 'border-[#16a34a] text-[#16a34a] bg-green-50' :
                      'border-gray-200 text-gray-400 bg-white'
                    )}>
                      {item.done ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <div>
                      <p className={cn('text-sm font-semibold',
                        item.done || item.active ? 'text-gray-900' : 'text-gray-400')}>
                        {item.step} {item.active && <span className="text-xs font-normal text-[#16a34a] ml-1">← you are here</span>}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div className="space-y-5">
            {/* Account info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Account</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email address</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Verified</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member since</p>
                      <p className="text-xs text-gray-500">JAD Synq account</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Privacy</h3>
              <div className="space-y-3">
                {[
                  { icon: <Shield className="w-4 h-4 text-[#16a34a]" />, title: 'Visa status is private', desc: 'Only used to personalise your feed — never shared.' },
                  { icon: <Bookmark className="w-4 h-4 text-amber-500" />, title: 'Saved companies are private', desc: 'Only visible to you.' },
                  { icon: <Briefcase className="w-4 h-4 text-blue-500" />, title: 'Applications are private', desc: 'Your job tracker is only accessible to you.' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{item.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Your Data</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-gray-900">{applications.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Applications</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-gray-900">{savedCount}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Saved</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-gray-900">{offers}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Offers</p>
                </div>
              </div>
            </div>

            {/* Sign out */}
            <button onClick={signOut}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-2xl text-sm font-semibold transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
