'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { User, LogOut, Bookmark, Briefcase, Building2, ChevronDown, Home } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/companies-list', label: 'Companies', icon: Building2 },
  { href: '/applications', label: 'Applications', icon: Briefcase },
  { href: '/saved', label: 'Saved', icon: Bookmark },
]

export default function Navbar() {
  const { user, loading, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-30 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Left: logo */}
        <Link href="/" className="flex items-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.svg" alt="JAD Synq" className="h-10 w-auto" />
        </Link>

        {/* Center: nav buttons — desktop only */}
        <div className="hidden sm:flex items-center gap-1.5 flex-1 justify-center">
          {/* Home */}
          <Link
            href="/"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
              pathname === '/'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
            )}
          >
            <Home className="w-3.5 h-3.5" />
            Search
          </Link>

          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                  active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right: auth */}
        <div className="flex items-center gap-2 shrink-0">
          {loading ? (
            <div className="w-24 h-8 bg-gray-100 rounded-full animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 pl-1 pr-3 py-1 rounded-full border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">
                    {(user.email ?? '?')[0].toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block truncate max-w-[100px] text-sm text-gray-700 font-medium">
                  {user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-20">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { href: '/saved', icon: Bookmark, label: 'Saved Companies' },
                        { href: '/applications', icon: Briefcase, label: 'Applications' },
                        { href: '/profile', icon: User, label: 'Profile' },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                            pathname.startsWith(href)
                              ? 'text-blue-600 bg-blue-50 font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 p-1">
                      <button
                        onClick={() => { signOut(); setMenuOpen(false) }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth"
                className="hidden sm:flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 bg-white transition-all"
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className="flex items-center gap-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full transition-all shadow-sm"
              >
                Get started →
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  )
}
