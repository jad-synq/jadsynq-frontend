'use client'

import Link from 'next/link'
import { useState } from 'react'
import { User, LogOut, Bookmark } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const { user, loading, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-gray-900">
          JAD Synq
        </Link>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                {user.email}
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
              className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
