'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/ui/Sidebar'

const COLLAPSE_KEY = 'sidebar-collapsed'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1')
    setHydrated(true)
  }, [])

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  // Logged-out visitors on the marketing landing page get the full-bleed page, no app chrome
  const hideSidebar = pathname === '/' && !loading && !user

  return (
    <>
      {!hideSidebar && (
        <Sidebar collapsed={hydrated && collapsed} onToggleCollapsed={toggleCollapsed} />
      )}
      <main
        className={cn(
          'min-h-screen pt-14 md:pt-0 pb-16 md:pb-0',
          !hideSidebar && (hydrated && collapsed ? 'md:ml-[76px]' : 'md:ml-60')
        )}
      >
        {children}
      </main>
    </>
  )
}
