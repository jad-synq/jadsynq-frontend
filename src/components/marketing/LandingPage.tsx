'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles, Database, Shield, FileText, MessageCircle,
  BookOpen, CheckCircle2, ArrowRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

const VALUE_PROPS = [
  {
    icon: <Database className="w-5 h-5 text-brand" />,
    bg: 'bg-brand/10',
    title: 'H-1B Intelligence',
    desc: 'See exactly which companies have actually filed H-1B petitions — and how many were approved — before you apply.',
  },
  {
    icon: <Shield className="w-5 h-5 text-gold-deep" />,
    bg: 'bg-gold/15',
    title: 'E-Verify Status',
    desc: 'Instantly check E-Verify enrollment, the requirement that decides whether you\'re even eligible for OPT & STEM OPT roles.',
  },
  {
    icon: <Sparkles className="w-5 h-5 text-ink-soft" />,
    bg: 'bg-ink/5',
    title: 'AI Job Matching',
    desc: 'Your resume matched against live openings from real sponsors — ranked by fit, not just keywords.',
  },
  {
    icon: <FileText className="w-5 h-5 text-brand" />,
    bg: 'bg-brand/10',
    title: 'Resume & ATS Check',
    desc: 'Build a resume that clears applicant tracking systems, with a scorer that tells you exactly what\'s missing.',
  },
  {
    icon: <BookOpen className="w-5 h-5 text-gold-deep" />,
    bg: 'bg-gold/15',
    title: 'Interview Prep',
    desc: 'Practice answering the sponsorship question with confidence, and prep for role-specific interviews.',
  },
  {
    icon: <MessageCircle className="w-5 h-5 text-ink-soft" />,
    bg: 'bg-ink/5',
    title: 'AI Career Copilot',
    desc: 'Ask questions about any company, role, or your visa timeline and get answers grounded in real data.',
  },
]

const STATS = [
  { value: '80K+', label: 'Companies tracked' },
  { value: '3.5M+', label: 'H-1B filings' },
  { value: '100%', label: 'Government data' },
]

export default function LandingPage() {
  const { signInWithGoogle } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) { setError(error); setGoogleLoading(false) }
    // on success, browser is redirected to Google — nothing to do here
  }

  return (
    <div className="min-h-screen bg-paper">

      {/* Hero */}
      <div className="relative overflow-hidden px-6 pt-16 pb-14 text-center">
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/15 text-gold-deep text-xs font-bold rounded-full mb-6 border border-gold/40">
            <Sparkles className="w-3.5 h-3.5" />
            Built for OPT · STEM OPT · H-1B job seekers
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold text-ink mb-5 tracking-tight leading-[1.05] text-balance">
            Job search built around<br />
            one hard truth: <span className="text-brand italic">sponsorship</span>
          </h1>

          <p className="text-muted text-lg mb-9 max-w-lg mx-auto leading-relaxed">
            Every other job board makes you guess who will sponsor a visa. JADsynq shows
            you real H-1B filings and E-Verify status before you apply, then matches your
            resume against live openings from companies that actually say yes.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col items-center gap-3 mb-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full max-w-xs flex items-center justify-center gap-3 px-6 py-3.5 bg-paper-raised hover:bg-paper border border-line rounded-xl text-sm font-bold text-ink shadow-lg shadow-ink/5 transition-all disabled:opacity-60"
            >
              {googleLoading ? (
                <svg className="w-5 h-5 animate-spin text-muted" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <GoogleIcon />
              )}
              {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
            </button>

            <Link
              href="/auth"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand font-medium transition-colors"
            >
              Sign in or sign up with email <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {error && (
            <p className="text-sm text-signal mt-2">{error}</p>
          )}

          <p className="text-xs text-muted mt-4">Free forever · No credit card required</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-6 pb-14">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-3">
          {STATS.map(s => (
            <div key={s.label} className="bg-paper-raised rounded-lg border border-line py-4 px-3 text-center shadow-sm">
              <p className="font-display text-xl font-bold text-brand">{s.value}</p>
              <p className="text-xs text-muted mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Value props */}
      <div className="px-6 pb-14 max-w-4xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-5 text-center">Everything in one place</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VALUE_PROPS.map(card => (
            <div key={card.title} className="bg-paper-raised rounded-lg border border-line p-6 hover:shadow-md transition-all">
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center mb-4`}>
                {card.icon}
              </div>
              <h3 className="font-display font-bold text-ink mb-2 text-lg">{card.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust / reassurance strip */}
      <div className="px-6 pb-14 max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {[
            'Every data point traced to a real DOL or E-Verify filing',
            'Your visa status is private — never shared externally',
            'No recruiters, no spam — just data',
          ].map(item => (
            <span key={item} className="flex items-center gap-2 text-sm text-ink-soft font-medium">
              <CheckCircle2 className="w-4 h-4 text-brand shrink-0" /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-6 pb-16 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-ink to-brand-deep rounded-lg p-10 text-center text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <h3 className="font-display font-bold text-2xl sm:text-3xl mb-3 relative">Ready to find a sponsor who says yes?</h3>
          <p className="text-white/70 text-sm mb-7 relative max-w-md mx-auto">
            Create a free account and see your first matched jobs in under a minute.
          </p>
          <div className="relative flex justify-center">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-white/90 rounded-xl text-sm font-bold text-ink shadow-lg transition-all disabled:opacity-60"
            >
              <GoogleIcon />
              {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
