import { useEffect, useState } from 'react'

const KEY = 'cr-motion-pref'

function read(): 'auto' | 'reduce' | 'full' {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'reduce' || v === 'full') return v
  } catch {
    /* stockage indisponible */
  }
  return 'auto'
}

/**
 * Préférence de mouvement : réglage système (prefers-reduced-motion) + choix explicite
 * du visiteur (« Version sans animation »), mémorisé localement quand c'est possible.
 */
export function useReducedMotion() {
  const [system, setSystem] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [pref, setPref] = useState(read)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setSystem(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  const set = (v: 'auto' | 'reduce' | 'full') => {
    setPref(v)
    try {
      if (v === 'auto') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, v)
    } catch {
      /* ignore */
    }
  }

  const reduced = pref === 'reduce' || (pref === 'auto' && system)
  return { reduced, system, pref, setPref: set }
}
