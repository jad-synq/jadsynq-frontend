'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, CheckCircle, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getMe, updateMe, VisaType } from '@/lib/api'
import { cn } from '@/lib/utils'

const VISA_OPTIONS: { value: VisaType; label: string; desc: string; color: string }[] = [
  { value: 'OPT', label: 'OPT', desc: 'Optional Practical Training', color: 'border-blue-200 bg-blue-50 text-blue-700' },
  { value: 'STEM_OPT', label: 'STEM OPT', desc: '24-month STEM extension', color: 'border-purple-200 bg-purple-50 text-purple-700' },
  { value: 'H1B', label: 'H-1B', desc: 'H-1B visa holder', color: 'border-orange-200 bg-orange-50 text-orange-700' },
  { value: 'GC', label: 'Green Card', desc: 'Permanent resident', color: 'border-green-200 bg-green-50 text-green-700' },
  { value: 'CITIZEN', label: 'US Citizen', desc: 'No sponsorship needed', color: 'border-gray-200 bg-gray-50 text-gray-700' },
  { value: 'OTHER', label: 'Other', desc: 'Other visa status', color: 'border-gray-200 bg-gray-50 text-gray-700' },
]

function UnauthenticatedView() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
            <User className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-gray-500 max-w-xs mx-auto">
            Set your visa status so we can highlight the most relevant companies for you.
          </p>
        </div>

        {/* Visa options preview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Work Authorization</p>
          <div className="grid grid-cols-2 gap-2 opacity-60 pointer-events-none select-none">
            {VISA_OPTIONS.map(opt => (
              <div
                key={opt.value}
                className={cn('flex flex-col items-start p-3 rounded-xl border', opt.color)}
              >
                <span className="text-sm font-semibold">{opt.label}</span>
                <span className="text-xs mt-0.5 opacity-80">{opt.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">Private by default</p>
              <p className="text-xs text-gray-500 mt-0.5">Your visa status is only used to personalise your experience — it&apos;s never shared.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 rounded-2xl p-6 text-center text-white">
          <p className="font-semibold text-lg mb-1">Personalise your experience</p>
          <p className="text-blue-200 text-sm mb-4">Sign in to set your visa status and save preferences.</p>
          <Link
            href="/auth"
            className="inline-block bg-white text-blue-700 font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [visaType, setVisaType] = useState<VisaType | null>(null)
  const [selected, setSelected] = useState<VisaType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    getMe()
      .then(res => {
        setVisaType(res.data.visa_type)
        setSelected(res.data.visa_type)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, authLoading])

  if (authLoading || (loading && user)) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-8 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  if (!user) return <UnauthenticatedView />

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    setSaved(false)
    try {
      await updateMe(selected)
      setVisaType(selected)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // silently ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Work Authorization</h2>
          <p className="text-sm text-gray-500 mb-4">
            Helps us surface the most relevant companies for your situation.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {VISA_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className={cn(
                  'flex flex-col items-start p-3 rounded-xl border text-left transition-all',
                  selected === opt.value
                    ? cn(opt.color, 'ring-2 ring-offset-1 ring-blue-400')
                    : 'border-gray-100 bg-white hover:border-gray-200'
                )}
              >
                <span className={cn(
                  'text-sm font-semibold',
                  selected === opt.value ? '' : 'text-gray-900'
                )}>
                  {opt.label}
                </span>
                <span className={cn(
                  'text-xs mt-0.5',
                  selected === opt.value ? 'opacity-80' : 'text-gray-400'
                )}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving || selected === visaType || !selected}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
            {visaType && !saved && (
              <span className="text-xs text-gray-400">Current: {VISA_OPTIONS.find(o => o.value === visaType)?.label}</span>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
