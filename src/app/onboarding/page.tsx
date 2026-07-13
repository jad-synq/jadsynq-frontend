'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Loader2, ArrowRight, Crosshair } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { updateMe, VisaType } from '@/lib/api'
import { COMMON_ROLES, US_CITIES, nearestCity } from '@/lib/onboardingOptions'
import { cn } from '@/lib/utils'

const VISA_OPTIONS: { value: VisaType; label: string; desc: string }[] = [
  { value: 'OPT', label: 'OPT', desc: 'Optional Practical Training' },
  { value: 'STEM_OPT', label: 'STEM OPT', desc: '24-month STEM extension' },
  { value: 'H1B', label: 'H-1B', desc: 'Employer-sponsored visa' },
  { value: 'GC', label: 'Green Card', desc: 'Permanent resident' },
  { value: 'CITIZEN', label: 'US Citizen', desc: 'No sponsorship needed' },
  { value: 'OTHER', label: 'Other', desc: 'Other visa status' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [step, setStep] = useState(0)
  const [visaType, setVisaType] = useState<VisaType | null>(null)
  const [targetRoles, setTargetRoles] = useState<string[]>([])
  const [yearsInput, setYearsInput] = useState('')
  const [anywhere, setAnywhere] = useState(true)
  const [targetCities, setTargetCities] = useState<string[]>([])
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
      </div>
    )
  }
  if (!user) {
    router.replace('/auth')
    return null
  }

  const toggleRole = (role: string) => {
    setTargetRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])
  }

  const toggleCity = (city: string) => {
    setTargetCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city])
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = nearestCity(pos.coords.latitude, pos.coords.longitude)
        setAnywhere(false)
        setTargetCities(prev => prev.includes(nearest.name) ? prev : [...prev, nearest.name])
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }

  const steps = [
    { title: 'What\'s your visa status?', valid: visaType !== null },
    { title: 'What roles are you targeting?', valid: targetRoles.length > 0 },
    { title: 'How many years of experience do you have?', valid: yearsInput.trim() !== '' && !isNaN(Number(yearsInput)) },
    { title: 'Where are you looking?', valid: anywhere || targetCities.length > 0 },
  ]
  const current = steps[step]

  const handleNext = () => {
    if (step < steps.length - 1) { setStep(step + 1); return }
    handleSubmit()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await updateMe({
        visa_type: visaType ?? undefined,
        target_roles: targetRoles,
        years_experience_override: Number(yearsInput),
        target_cities: anywhere ? [] : targetCities,
        onboarding_completed: true,
      })
      router.replace('/')
    } catch {
      setError('Something went wrong saving your details. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full">

        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors',
              i <= step ? 'bg-brand' : 'bg-line')} />
          ))}
        </div>

        <div className="bg-paper-raised rounded-2xl border border-line shadow-sm p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">
            Step {step + 1} of {steps.length}
          </p>
          <h1 className="font-display text-2xl font-bold text-ink mb-1">{current.title}</h1>
          <p className="text-sm text-muted mb-6">
            We use this to match you with jobs and companies suited to your situation. You can change all of this later in your profile.
          </p>

          {/* Step 0: visa type */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-2">
              {VISA_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setVisaType(opt.value)}
                  className={cn(
                    'text-left p-3.5 rounded-xl border-2 transition-all',
                    visaType === opt.value ? 'border-brand bg-brand/10' : 'border-line hover:border-brand/40'
                  )}
                >
                  <span className={cn('block text-sm font-bold', visaType === opt.value ? 'text-brand-deep' : 'text-ink')}>{opt.label}</span>
                  <span className="block text-xs text-muted mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 1: target roles */}
          {step === 1 && (
            <div>
              <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1">
                {COMMON_ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                      targetRoles.includes(role)
                        ? 'bg-brand text-white border-brand'
                        : 'bg-paper text-ink-soft border-line hover:border-brand/40'
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted mt-3">{targetRoles.length} selected — pick as many as apply.</p>
            </div>
          )}

          {/* Step 2: years experience */}
          {step === 2 && (
            <div>
              <input
                type="number"
                min={0}
                max={60}
                value={yearsInput}
                onChange={e => setYearsInput(e.target.value)}
                placeholder="e.g. 3"
                autoFocus
                className="w-32 px-4 py-3 rounded-xl text-lg font-semibold border border-line focus:outline-none focus:ring-2 focus:ring-brand bg-paper text-ink"
              />
              <p className="text-xs text-muted mt-3">
                This keeps senior roles from being recommended above your actual experience level. You can update it any time in your profile.
              </p>
            </div>
          )}

          {/* Step 3: target cities */}
          {step === 3 && (
            <div>
              <button
                onClick={() => setAnywhere(!anywhere)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 mb-3 transition-all',
                  anywhere ? 'border-brand bg-brand/10' : 'border-line'
                )}
              >
                <span className={cn('text-sm font-bold', anywhere ? 'text-brand-deep' : 'text-ink')}>Open to anywhere in the US</span>
                <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', anywhere ? 'border-brand bg-brand' : 'border-line')}>
                  {anywhere && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>

              {!anywhere && (
                <>
                  <button
                    onClick={handleUseLocation}
                    disabled={locating}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline mb-3 disabled:opacity-60"
                  >
                    {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
                    {locating ? 'Finding your location…' : 'Use my current location'}
                  </button>
                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                    {US_CITIES.map(city => (
                      <button
                        key={city.name}
                        onClick={() => toggleCity(city.name)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                          targetCities.includes(city.name)
                            ? 'bg-brand text-white border-brand'
                            : 'bg-paper text-ink-soft border-line hover:border-brand/40'
                        )}
                      >
                        <MapPin className="w-3 h-3" /> {city.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {error && <p className="text-sm text-signal mt-4">{error}</p>}

          <div className="flex items-center justify-between mt-7">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="text-sm text-muted hover:text-ink-soft font-medium disabled:opacity-0 transition-opacity"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!current.valid || submitting}
              className="flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-deep text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving…' : step === steps.length - 1 ? 'Finish' : 'Continue'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
