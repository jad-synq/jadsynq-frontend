'use client'

import { useState } from 'react'

// Consistent brand color per company initial (same letter = same color)
const AVATAR_COLORS = [
  ['#0E7C4A', '#white'],  // A
  ['#2563eb', '#white'],  // B
  ['#7c3aed', '#white'],  // C
  ['#dc2626', '#white'],  // D
  ['#ea580c', '#white'],  // E
  ['#0891b2', '#white'],  // F
  ['#0E7C4A', '#white'],  // G
  ['#1d4ed8', '#white'],  // H
  ['#9333ea', '#white'],  // I
  ['#be185d', '#white'],  // J
  ['#0f766e', '#white'],  // K
  ['#4f46e5', '#white'],  // L
  ['#b45309', '#white'],  // M
  ['#0A5C37', '#white'],  // N
  ['#c2410c', '#white'],  // O
  ['#7e22ce', '#white'],  // P
  ['#0369a1', '#white'],  // Q
  ['#b91c1c', '#white'],  // R
  ['#1e40af', '#white'],  // S
  ['#065f46', '#white'],  // T
  ['#6d28d9', '#white'],  // U
  ['#92400e', '#white'],  // V
  ['#155e75', '#white'],  // W
  ['#831843', '#white'],  // X
  ['#3730a3', '#white'],  // Y
  ['#0A5C37', '#white'],  // Z
]

function avatarColor(name: string): string {
  const idx = (name.charCodeAt(0) - 65 + 26) % 26
  return AVATAR_COLORS[idx]?.[0] ?? '#0E7C4A'
}

interface CompanyLogoProps {
  logoUrl: string | null
  domain: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE = {
  sm:  { outer: 'w-8 h-8',  font: 'text-xs',  img: 'p-0.5' },
  md:  { outer: 'w-10 h-10', font: 'text-sm',  img: 'p-1'   },
  lg:  { outer: 'w-14 h-14', font: 'text-lg',  img: 'p-1.5' },
}

export default function CompanyLogo({ logoUrl, domain, name, size = 'md', className = '' }: CompanyLogoProps) {
  const [src, setSrc] = useState<string | null>(logoUrl)
  const [stage, setStage] = useState(0) // 0=clearbit, 1=favicon, 2=initials

  const handleError = () => {
    if (stage === 0 && domain) {
      setSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`)
      setStage(1)
    } else {
      setSrc(null)
      setStage(2)
    }
  }

  const s = SIZE[size]
  const initial = (name ?? '?')[0].toUpperCase()

  if (stage === 2 || !src) {
    return (
      <div
        className={`${s.outer} rounded-xl flex items-center justify-center shrink-0 font-bold text-white ${s.font} ${className}`}
        style={{ background: avatarColor(name.toUpperCase()) }}
      >
        {initial}
      </div>
    )
  }

  return (
    <div className={`${s.outer} rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className={`w-full h-full object-contain ${s.img}`}
        onError={handleError}
      />
    </div>
  )
}

// LinkedIn company search URL — always reliable regardless of slug
export function linkedinCompanyUrl(_domain: string | null, name: string): string {
  return `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(name)}`
}

// Careers fallback: company careers page or Google search
export function careersUrl(careers: string | null, name: string): string {
  if (careers) return careers
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' careers jobs')}`
}
