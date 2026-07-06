'use client'

import Link from 'next/link'
import { useState } from 'react'
import { User, LogOut, Bookmark, Briefcase } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const { user, loading, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo-full.svg is a complex 485KB vector lockup; next/image optimization adds little value here and the file renders correctly as a plain img */}
          <img
            src="/logo-full.svg"
            alt="JAD Synq"
            className="h-12 w-auto"
          />
        </Link>
          <Link href="/companies-list" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
            Companies
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 text-sm text-gray-700 hover:text-gray-900 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors max-w-[140px] sm:max-w-none"
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10">
                  <Link
                    href="/saved"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Bookmark className="w-4 h-4" />
                    Saved Companies
                  </Link>
                  <Link
                    href="/applications"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Briefcase className="w-4 h-4" />
                    Applications
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <div className="border-t border-gray-50 my-1" />
                  <button
                    onClick={() => {
                      signOut()
                      setMenuOpen(false)
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="text-sm font-medium text-[#14532d] hover:text-green-800 px-3 py-1.5 rounded-lg hover:bg-[#f0fdf4] transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
