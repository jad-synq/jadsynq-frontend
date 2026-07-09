'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

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

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) { setError(error); setGoogleLoading(false) }
    // on success, browser is redirected to Google — nothing to do here
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) { setError(error); setLoading(false) }
      else { router.push('/') }
    } else {
      const { error } = await signUp(email, password)
      if (error) { setError(error); setLoading(false) }
      else { setSignupSuccess(true); setLoading(false) }
    }
  }

  if (signupSuccess) {
    return (
      <main className="min-h-screen bg-[#f0fdf4] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-[#16a34a]" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-sm text-gray-500 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Back to search
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f0fdf4] flex items-center justify-center px-4">
      <div className="max-w-sm w-full">

        {/* Logo / brand */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to search
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-9 h-9 bg-[#16a34a] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">jadsynq</span>
          </div>
          <p className="text-sm text-gray-500">
            {mode === 'signin' ? 'Welcome back' : 'Create a free account'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {/* Google OAuth button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 transition-all disabled:opacity-50 mb-4"
          >
            {googleLoading ? (
              <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Redirecting to Google…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or continue with email</span>
            </div>
          </div>

          {/* Mode toggle tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null) }}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-gray-50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] bg-gray-50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-100">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-colors shadow-sm shadow-green-100 mt-1"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? '→  Sign in' : '→  Create account'}
            </button>
          </form>

          {mode === 'signin' && (
            <p className="text-xs text-gray-400 text-center mt-4">
              No account?{' '}
              <button onClick={() => { setMode('signup'); setError(null) }} className="text-[#16a34a] hover:underline font-medium">
                Sign up free
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p className="text-xs text-gray-400 text-center mt-4">
              Already have an account?{' '}
              <button onClick={() => { setMode('signin'); setError(null) }} className="text-[#16a34a] hover:underline font-medium">
                Sign in
              </button>
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Free forever · No credit card required
        </p>
      </div>
    </main>
  )
}
