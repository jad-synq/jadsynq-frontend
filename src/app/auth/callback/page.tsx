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
          <path d="M20,54 L37,71 L50,42 L63,54 L80,22" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="80" cy="22" r="7" fill="currentColor" />
        </svg>
        <p className="text-sm text-muted font-medium">Signing you in…</p>
      </div>
    </div>
  )
}
