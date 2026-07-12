'use client'

import { useEffect, useState } from 'react'

/** True once we've confirmed the user has NOT requested reduced motion.
 * Starts false (matching SSR/first paint, where no animated content is
 * rendered yet) and flips true on mount if prefers-reduced-motion isn't
 * set -- so animated decorations like the homepage 3D scene never render
 * for users who asked for reduced motion, and never flash in before the
 * check runs. */
export function useMotionAllowed(): boolean {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setAllowed(!query.matches)
    const onChange = () => setAllowed(!query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return allowed
}
