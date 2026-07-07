'use client'

import { useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Pings the backend health endpoint on mount so Render's free-tier
// instance wakes up before the user makes their first real request.
export default function BackendWarmup() {
  useEffect(() => {
    fetch(`${API_URL}/health`, { method: 'GET' }).catch(() => {})
  }, [])
  return null
}
