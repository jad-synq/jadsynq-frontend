'use client'

import { cn } from '@/lib/utils'

// ── Sparkline ─────────────────────────────────────────────────────────────────

export function Sparkline({
  data,
  width = 64,
  height = 24,
  color = '#16a34a',
  className,
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 2

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = pad + ((1 - (v - min) / range) * (height - pad * 2))
    return `${x},${y}`
  })

  const lastIdx = data.length - 1
  const lastX = pad + (width - pad * 2)
  const lastY = pad + ((1 - (data[lastIdx] - min) / range) * (height - pad * 2))

  // Trend: up = green, down = red, flat = gray
  const trend = data[lastIdx] > data[0] ? '#16a34a' : data[lastIdx] < data[0] ? '#ef4444' : '#9ca3af'
  const lineColor = color === '#16a34a' ? trend : color

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('shrink-0', className)}
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <circle cx={lastX} cy={lastY} r="2" fill={lineColor} />
    </svg>
  )
}


// Base shimmer block
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('skeleton-shimmer rounded-lg', className)} />
  )
}

// ── Composed shapes ───────────────────────────────────────────────────────────

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  )
}

// Company / job card skeleton
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-5', className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3.5 w-1/3" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat grid cell
export function SkeletonStat() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

// Company detail hero
export function SkeletonHero() {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-16 h-16 rounded-xl shrink-0 opacity-20" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48 opacity-20" />
          <Skeleton className="h-4 w-32 opacity-20" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-28 rounded-full opacity-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Full-page branded loader ──────────────────────────────────────────────────

export function PageLoader({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#16a34a] rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-xl font-black text-gray-900 tracking-tight">jadsynq</span>
      </div>

      {/* Animated bar */}
      <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#16a34a] rounded-full loader-bar" />
      </div>

      <p className="text-sm text-gray-400 font-medium">{message}</p>
    </div>
  )
}

// ── Inline spinner ────────────────────────────────────────────────────────────

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5'
  return (
    <svg className={cn(sz, 'animate-spin text-[#16a34a]', className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
