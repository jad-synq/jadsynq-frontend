'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { User, LogOut, Bookmark, Briefcase, Building2, ChevronDown } from 'lucide-react'
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
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: logo + nav links */}
        <div className="flex items-center gap-1">
          <Link href="/" className="flex items-center mr-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.svg" alt="JAD Synq" className="h-10 w-auto" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right: auth area */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-24 h-8 bg-gray-100 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">
                    {(user.email ?? '?')[0].toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block truncate max-w-[120px] text-sm">{user.email}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-20">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
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
                          'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                          pathname.startsWith(href)
                            ? 'text-blue-600 bg-blue-50 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <Icon className="w-4 h-4" /> {label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button
                        onClick={() => { signOut(); setMenuOpen(false) }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
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
                className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth"
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
