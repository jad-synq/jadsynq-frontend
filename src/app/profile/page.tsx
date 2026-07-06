'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getMe, updateMe, VisaType } from '@/lib/api'
import { cn } from '@/lib/utils'

const VISA_OPTIONS: { value: VisaType; label: string; desc: string }[] = [
  { value: 'OPT', label: 'OPT', desc: 'Optional Practical Training' },
  { value: 'STEM_OPT', label: 'STEM OPT', desc: '24-month STEM OPT extension' },
  { value: 'H1B', label: 'H-1B', desc: 'H-1B visa holder' },
  { value: 'GC', label: 'Green Card', desc: 'Permanent resident' },
  { value: 'CITIZEN', label: 'US Citizen', desc: 'No sponsorship needed' },
  { value: 'OTHER', label: 'Other', desc: 'Other visa status' },
]

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

  if (authLoading || loading) {
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

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Sign in to view your profile</p>
          <Link href="/auth" className="mt-3 inline-block text-blue-600 hover:underline">Sign in</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Profile
        </h1>
        <p className="text-sm text-gray-500 mb-6">{user.email}</p>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Visa / Work Authorization</h2>
          <p className="text-sm text-gray-500 mb-4">
            Helps us surface the most relevant companies for your situation.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {VISA_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className={cn(
                  'flex flex-col items-start p-3 rounded-xl border text-left transition-colors',
                  selected === opt.value
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                )}
              >
                <span className={cn(
                  'text-sm font-semibold',
                  selected === opt.value ? 'text-blue-700' : 'text-gray-900'
                )}>
                  {opt.label}
                </span>
                <span className="text-xs text-gray-400 mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving || selected === visaType || !selected}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
