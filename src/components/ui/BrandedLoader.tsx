'use client'

import { useEffect, useState } from 'react'

const MESSAGES = [
  'Scanning 22,000+ H-1B sponsors across the US…',
  'Finding employers who invest in international talent.',
  'Connecting you to companies that sponsor futures.',
  'Almost there — your next opportunity is loading.',
  'Matching you with companies that believe in your potential.',
]

export default function BrandedLoader({ message }: { message?: string }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (message) return
    const iv = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setMsgIndex(i => (i + 1) % MESSAGES.length); setVisible(true) }, 350)
    }, 3000)
    return () => clearInterval(iv)
  }, [message])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 select-none gap-8">
      {/* Logo mark */}
      <div className="flex items-center gap-2.5">
        <svg className="w-9 h-9 text-brand" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <path d="M20,54 L37,71 L50,42 L63,54 L80,22" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="80" cy="22" r="7" fill="currentColor" />
        </svg>
        <span className="font-display text-2xl font-bold text-ink tracking-tight">JADsynq</span>
      </div>

      {/* Spinner ring */}
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 animate-spin" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="24" stroke="#D7E2D6" strokeWidth="4" />
          <path
            d="M28 4 a24 24 0 0 1 24 24"
            stroke="#0E7C4A"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-gold" style={{ animation: 'pulse 1.2s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-52 h-1 bg-line rounded-full overflow-hidden">
        <div className="h-full bg-brand rounded-full loader-bar" />
      </div>

      {/* Cycling message */}
      <p
        className="text-sm text-muted font-medium text-center max-w-xs leading-relaxed transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {message || MESSAGES[msgIndex]}
      </p>
    </div>
  )
}
