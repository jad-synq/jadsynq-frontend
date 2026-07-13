'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'

// Full-page gate for tools that are inherently account-bound (resume builder, ATS check, etc.)
export function FullPageAuthGate({ icon: Icon = Lock, title, description, ctaLabel = 'Sign in free to continue' }: {
  icon?: React.ElementType
  title: string
  description: string
  ctaLabel?: string
}) {
  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-paper-raised rounded-2xl border border-line p-8 text-center">
        <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-brand" />
        </div>
        <h1 className="text-lg font-bold text-ink mb-2">{title}</h1>
        <p className="text-sm text-muted mb-6 leading-relaxed">{description}</p>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-deep text-white font-semibold rounded-xl text-sm transition-colors shadow-sm w-full justify-center"
        >
          {ctaLabel} →
        </Link>
        <p className="text-xs text-muted mt-3">Free forever · No credit card required</p>
      </div>
    </main>
  )
}

// Wraps a few extra real results, blurred + faded, to prove the data is real without giving it away
export function TeaserFade({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative -mt-2 pt-2">
      <div className="pointer-events-none select-none blur-[3px] opacity-50">
        {children}
      </div>
      <div className="absolute inset-x-0 bottom-0 top-2 bg-gradient-to-t from-paper via-paper/80 to-transparent" />
    </div>
  )
}

export function TeaserCTA({ title, description, ctaLabel = 'Sign in free' }: {
  title: string
  description: string
  ctaLabel?: string
}) {
  return (
    <div className="relative z-10 -mt-4 bg-paper-raised rounded-2xl border border-line p-8 text-center shadow-sm">
      <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-brand" />
      </div>
      <h2 className="text-lg font-bold text-ink mb-2">{title}</h2>
      <p className="text-sm text-muted mb-6 max-w-sm mx-auto leading-relaxed">{description}</p>
      <Link
        href="/auth"
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-deep text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
      >
        {ctaLabel} →
      </Link>
      <p className="text-xs text-muted mt-3">Free forever · No credit card required</p>
    </div>
  )
}
