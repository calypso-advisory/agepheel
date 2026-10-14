import { Logo } from './components/Logo'
import { useEffect, useRef } from 'react'
import { BrowserRouter, HashRouter, Link, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Navigation } from './components/Navigation'
import { ThemeProvider } from './components/themeContext'
import { BRAND, NAV } from './content/site'
import Home from './pages/Home'
import { AboutPage, ContactPage, EaEsatPage, NotFound, OethPage, SolutionsPage } from './pages/InfoPages'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    // premier rendu : on laisse le navigateur restaurer la position (rechargement, retour arrière)
    if (first.current) {
      first.current = false
      return
    }
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function Layout() {
  return (
    <>
      <Navigation />
      <ScrollManager />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <p className="footer-logo" aria-label={`${BRAND.name}, ${BRAND.long}`}>
              <Logo tone="sombre" />
            </p>
            <p className="small">{BRAND.baseline}</p>
          </div>
          <nav aria-label="Pied de page">
            <ul>
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to}>{n.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/entreprises-adaptees-esat">Entreprises adaptées et ESAT</Link>
              </li>
            </ul>
          </nav>
          <p className="small">Mentions légales, politique de confidentialité, déclaration d’accessibilité : à compléter.</p>
        </div>
      </footer>
    </>
  )
}

export default function App() {
  // HashRouter pour l'aperçu hébergé en un seul fichier ; BrowserRouter (URLs propres, SEO) en production.
  const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            {/* essai du défilement par étapes (mobile), non indexé */}
            <Route path="essai-etapes" element={<Home steps />} />
            <Route path="solutions" element={<SolutionsPage />} />
            <Route path="comprendre-oeth" element={<OethPage />} />
            <Route path="entreprises-adaptees-esat" element={<EaEsatPage />} />
            <Route path="a-propos" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
