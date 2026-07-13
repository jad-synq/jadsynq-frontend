'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getMe } from '@/lib/api'

// Paths that must stay reachable even for a signed-in user who hasn't
// finished onboarding yet -- the onboarding page itself, and the auth
// flow (a user can land back on /auth/callback mid-flow before this
// gate has any business redirecting them).
const EXEMPT_PATHS = ['/onboarding', '/auth', '/auth/callback']

/** Renders nothing -- mounted once in the root layout to redirect a
 * signed-in user who hasn't completed onboarding to /onboarding, from
 * anywhere else in the app. */
export default function OnboardingGate() {
  const { user, loading: authLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (authLoading || !user) return
    if (EXEMPT_PATHS.some(p => pathname.startsWith(p))) return

    let cancelled = false
    getMe()
      .then(res => {
        if (!cancelled && !res.data.onboarding_completed) {
          router.replace('/onboarding')
        }
      })
      .catch(() => { /* fail open -- don't block the app on a profile fetch error */ })

    return () => { cancelled = true }
  }, [authLoading, user, pathname, router])

  return null
}
