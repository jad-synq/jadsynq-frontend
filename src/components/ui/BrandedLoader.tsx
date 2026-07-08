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
        <div className="w-11 h-11 bg-[#16a34a] rounded-2xl flex items-center justify-center shadow-xl shadow-green-200">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-2xl font-black text-gray-900 tracking-tight">jadsynq</span>
      </div>

      {/* Spinner ring */}
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 animate-spin" viewBox="0 0 56 56" fill="none">
          <circle cx="28" cy="28" r="24" stroke="#e5e7eb" strokeWidth="4" />
          <path
            d="M28 4 a24 24 0 0 1 24 24"
            stroke="#16a34a"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#16a34a]" style={{ animation: 'pulse 1.2s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-52 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#16a34a] rounded-full loader-bar" />
      </div>

      {/* Cycling message */}
      <p
        className="text-sm text-gray-400 font-medium text-center max-w-xs leading-relaxed transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {message || MESSAGES[msgIndex]}
      </p>
    </div>
  )
}
