'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
  'Scanning 31,000+ H-1B sponsors across the US…',
  'Your visa journey starts here.',
  'Finding employers who invest in international talent.',
  'Great opportunities are worth the wait.',
  'Connecting you to companies that sponsor futures.',
  'Loading your path from OPT to H-1B and beyond.',
  'Matching you with companies that believe in your potential.',
  'Almost there — your next sponsor is loading.',
]

export default function BrandedLoader() {
  const [msgIndex, setMsgIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const iv = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % MESSAGES.length)
        setFade(true)
      }, 400)
    }, 3200)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 select-none">
      {/* Logo */}
      <div className="mb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-white.svg"
          alt="JAD Synq"
          className="h-10 w-auto"
          style={{ filter: 'invert(27%) sepia(62%) saturate(600%) hue-rotate(100deg) brightness(0.85)' }}
        />
      </div>

      {/* Orbiting dots */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-green-100" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#16a34a]"
          style={{ animation: 'spin 1.1s linear infinite' }}
        />
        <div className="absolute inset-[10px] rounded-full border-2 border-transparent border-t-green-300"
          style={{ animation: 'spin 1.8s linear infinite reverse' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-pulse" />
        </div>
      </div>

      {/* Cycling message */}
      <p
        className="text-sm text-gray-500 font-medium text-center max-w-xs transition-opacity duration-400"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {MESSAGES[msgIndex]}
      </p>

      {/* Subtle progress dots */}
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-green-300"
            style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}
