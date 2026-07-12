'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      router.replace(session ? '/jobs' : '/auth')
    })
  }, [router])

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg className="w-9 h-9 text-brand" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="5" />
          <path d="M58,30 L58,62 Q58,75 45,75 Q37,75 32,70" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-muted font-medium">Signing you in…</p>
      </div>
    </div>
  )
}
