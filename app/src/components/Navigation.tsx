import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BRAND, NAV } from '../content/site'
import { useTheme } from './themeContext'

export function Navigation() {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const btnRef = useRef<HTMLButtonElement>(null)
  const isHome = loc.pathname === '/'

  useEffect(() => setOpen(false), [loc.pathname, loc.hash])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const toContact = (e: React.MouseEvent) => {
    if (!isHome) return
    e.preventDefault()
    setOpen(false)
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    document.getElementById('contact-title')?.focus({ preventScroll: true })
  }

  return (
    <header className={`site-nav theme-${isHome ? theme : 'light'} ${open ? 'is-open' : ''}`}>
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <div className="nav-inner">
        <Link to="/" className="brand" aria-label={`${BRAND.name} — accueil`}>
          <span className="brand-mark" aria-hidden="true">
            {BRAND.short}
          </span>
          <span className="brand-name">{BRAND.name}</span>
        </Link>
        <nav aria-label="Navigation principale" className="nav-links" id="nav-menu">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to}>{n.label}</NavLink>
              </li>
            ))}
          </ul>
          <Link className="btn btn-nav" to={isHome ? '/#contact' : '/contact'} onClick={toContact}>
            Faire le point
          </Link>
        </nav>
        <button
          ref={btnRef}
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
          <span className="nav-toggle-bars" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
