'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, Briefcase, Bookmark, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Search' },
  { href: '/companies-list', icon: Building2, label: 'Companies' },
  { href: '/applications', icon: Briefcase, label: 'Applications' },
  { href: '/saved', icon: Bookmark, label: 'Saved' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { loading } = useAuth()

  if (loading) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 sm:hidden z-40 safe-area-inset-bottom">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'stroke-[2.5px]')} />
              <span className={cn('text-[10px] font-medium', active ? 'text-blue-600' : 'text-gray-400')}>
                {label}
              </span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-full" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
