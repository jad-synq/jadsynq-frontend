'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Search, Building2, Briefcase, Bookmark, User,
  LogOut, X, BriefcaseBusiness, FileText, Zap, Menu, Sparkles
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { useCopilotStore } from '@/lib/copilotStore'

function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      <path d="M20,54 L37,71 L50,42 L63,54 L80,22" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="80" cy="22" r="7" fill="currentColor" />
    </svg>
  )
}

const NAV = [
  { href: '/',               icon: Search,            label: 'Search',      group: 'main',  bottomTab: true  },
  { href: '/companies-list', icon: Building2,         label: 'Companies',   group: 'main',  bottomTab: true  },
  { href: '/jobs',           icon: BriefcaseBusiness, label: 'Jobs',        group: 'main',  bottomTab: true  },
  { href: '/applications',   icon: Briefcase,         label: 'Apply',       group: 'main',  bottomTab: true  },
  { href: '/saved',          icon: Bookmark,          label: 'Saved',       group: 'main',  bottomTab: true  },
  { href: '/resume-builder', icon: FileText,          label: 'Resume',      group: 'tools', bottomTab: false },
  { href: '/ats-check',      icon: Zap,               label: 'ATS Check',   group: 'tools', bottomTab: false },
  { href: '/profile',        icon: User,              label: 'Profile',     group: 'user',  bottomTab: false },
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
          ? 'bg-brand text-white shadow-sm shadow-black/30'
          : 'text-green-100/70 hover:bg-white/10 hover:text-white'
      )}
    >
      <Icon className="shrink-0" style={{ width: 18, height: 18 }} />
      {label}
    </Link>
  )
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)
  const openCopilot = useCopilotStore(s => s.open)

  const handleSignOut = () => { signOut(); onNavClick?.() }
  const handleAskCopilot = () => { openCopilot(); onNavClick?.() }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <Link href="/" onClick={onNavClick} className="flex items-center gap-2.5">
          <BrandMark className="w-7 h-7 text-brand shrink-0" />
          <span className="font-display text-xl font-bold text-white tracking-tight">JADsynq</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-6 pb-2 text-[10px] font-bold text-green-400/60 uppercase tracking-widest">Navigation</p>
        {NAV.filter(i => i.group === 'main').map(item => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} onClick={onNavClick} />
        ))}
        <p className="px-6 pt-4 pb-2 text-[10px] font-bold text-green-400/60 uppercase tracking-widest">Career Tools</p>
        {NAV.filter(i => i.group === 'tools').map(item => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} onClick={onNavClick} />
        ))}
        <button
          onClick={handleAskCopilot}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 text-sm font-medium transition-all text-green-100/70 hover:bg-white/10 hover:text-white w-[calc(100%-1rem)]"
        >
          <Sparkles className="shrink-0" style={{ width: 18, height: 18 }} />
          Ask Copilot
        </button>
        <p className="px-6 pt-4 pb-2 text-[10px] font-bold text-green-400/60 uppercase tracking-widest">Account</p>
        {NAV.filter(i => i.group === 'user').map(item => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} onClick={onNavClick} />
        ))}
      </nav>

      {/* Legal */}
      <div className="px-4 pb-2 flex flex-wrap gap-x-3 gap-y-1">
        {[
          { href: '/disclaimer', label: 'Disclaimer' },
          { href: '/privacy',    label: 'Privacy' },
          { href: '/terms',      label: 'Terms' },
        ].map(l => (
          <Link key={l.href} href={l.href} onClick={onNavClick}
            className="text-[10px] text-green-300/40 hover:text-green-300/80 transition-colors">
            {l.label}
          </Link>
        ))}
      </div>

      {/* User section */}
      <div className="border-t border-white/10 p-3">
        {loading ? (
          <div className="h-10 bg-white/10 rounded-xl animate-pulse" />
        ) : user ? (
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0 text-white text-sm font-bold">
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
            <Link href="/auth" onClick={onNavClick}
              className="flex items-center justify-center w-full py-2.5 bg-brand hover:bg-brand-deep text-white text-sm font-bold rounded-xl transition-colors">
              Get started →
            </Link>
            <Link href="/auth" onClick={onNavClick}
              className="flex items-center justify-center w-full py-2 text-green-200/70 hover:text-white text-xs transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Mobile top bar ────────────────────────────────────────────────────────────

function MobileTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const current = NAV.find(n => n.href === '/' ? pathname === '/' : pathname.startsWith(n.href))

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-ink z-40 flex items-center px-4 gap-3">
      <button onClick={onMenuOpen} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2">
        <BrandMark className="w-5 h-5 text-brand shrink-0" />
        <span className="font-display font-bold text-white text-base tracking-tight">JADsynq</span>
        {current && current.href !== '/' && (
          <>
            <span className="text-white/30 text-sm">·</span>
            <span className="text-white/60 text-sm font-medium">{current.label}</span>
          </>
        )}
      </div>
      <div className="ml-auto">
        {!loading && !user && (
          <Link href="/auth" className="text-xs font-bold text-white bg-brand px-3 py-1.5 rounded-lg">
            Sign in
          </Link>
        )}
        {!loading && user && (
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold">
              {(user.email ?? '?')[0].toUpperCase()}
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────────────

function BottomTabBar() {
  const pathname = usePathname()
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)
  const tabs = NAV.filter(n => n.bottomTab)

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex items-stretch h-16">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors pt-1',
                active ? 'text-brand' : 'text-gray-400 hover:text-gray-600'
              )}>
              <div className={cn('relative flex items-center justify-center w-8 h-6 rounded-xl transition-all',
                active && 'bg-paper')}>
                <Icon style={{ width: 18, height: 18 }} />
                {active && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand rounded-full" />
                )}
              </div>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ── Mobile drawer ─────────────────────────────────────────────────────────────

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'md:hidden fixed inset-0 bg-black/60 z-50 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside className={cn(
        'md:hidden fixed inset-y-0 left-0 w-72 bg-ink z-50 flex flex-col transition-transform duration-300 ease-out',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <BrandMark className="w-7 h-7 text-brand shrink-0" />
            <span className="font-display text-xl font-bold text-white tracking-tight">JADsynq</span>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent onNavClick={onClose} />
        </div>
      </aside>
    </>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function Sidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 bg-ink z-40">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <MobileTopBar onMenuOpen={() => setDrawerOpen(true)} />

      {/* Mobile bottom tabs */}
      <BottomTabBar />

      {/* Mobile drawer (for tools + profile) */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
