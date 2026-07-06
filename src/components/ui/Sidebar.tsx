'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Search, Building2, Briefcase, Bookmark, User,
  LogOut, Menu, X, BriefcaseBusiness
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/',               icon: Search,            label: 'Search'       },
  { href: '/companies-list', icon: Building2,         label: 'Companies'    },
  { href: '/jobs',           icon: BriefcaseBusiness, label: 'Jobs'         },
  { href: '/applications',   icon: Briefcase,         label: 'Applications' },
  { href: '/saved',          icon: Bookmark,          label: 'Saved'        },
  { href: '/profile',        icon: User,              label: 'Profile'      },
]

function NavItem({ href, icon: Icon, label, active, onClick }: {
  href: string; icon: React.ElementType; label: string; active: boolean; onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 text-sm font-medium transition-all',
        active
          ? 'bg-[#16a34a] text-white shadow-sm shadow-green-900/40'
          : 'text-green-100/70 hover:bg-white/10 hover:text-white'
      )}
    >
      <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
      {label}
    </Link>
  )
}

export default function Sidebar() {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const handleSignOut = () => {
    signOut()
    setMobileOpen(false)
  }

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <Link href="/" onClick={onNavClick}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.svg" alt="JAD Synq" className="h-9 w-auto brightness-0 invert" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-6 pb-2 text-[10px] font-bold text-green-400/60 uppercase tracking-widest">Navigation</p>
        {NAV.map(item => (
          <NavItem
            key={item.href}
            {...item}
            active={isActive(item.href)}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-3">
        {loading ? (
          <div className="h-10 bg-white/10 rounded-xl animate-pulse" />
        ) : user ? (
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center shrink-0 text-white text-sm font-bold">
                {(user.email ?? '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-green-300/60 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-2 px-2">
            <Link
              href="/auth"
              onClick={onNavClick}
              className="flex items-center justify-center w-full py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold rounded-xl transition-colors"
            >
              Get started →
            </Link>
            <Link
              href="/auth"
              onClick={onNavClick}
              className="flex items-center justify-center w-full py-2 text-green-200/70 hover:text-white text-xs transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 bg-[#0f2d1a] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger button */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0f2d1a] z-40 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.svg" alt="JAD Synq" className="h-8 w-auto brightness-0 invert" />
        </Link>
        {!loading && !user && (
          <Link
            href="/auth"
            className="ml-auto text-sm font-bold text-white bg-[#16a34a] px-4 py-1.5 rounded-lg"
          >
            Get started
          </Link>
        )}
        {!loading && user && (
          <Link href="/profile" className="ml-auto">
            <div className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center text-white text-sm font-bold">
              {(user.email ?? '?')[0].toUpperCase()}
            </div>
          </Link>
        )}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-[#0f2d1a] z-50 md:hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-full.svg" alt="JAD Synq" className="h-8 w-auto brightness-0 invert" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </div>
          </aside>
        </>
      )}
    </>
  )
}
