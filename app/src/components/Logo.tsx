import { LOGO } from './logoPaths'

/**
 * Mot-symbole ICRH : le C de « Changeons » est un œil (ouverture inclinée, pupille tournée vers « RH »).
 * Tracés générés par tools/build-logo.py ; couleur = currentColor (suit le thème de l'en-tête).
 */
export function LogoWord({ className }: { className?: string }) {
  const s = LOGO.cap
  return (
    <svg className={className} viewBox={`0 0 ${LOGO.wordW} ${s}`} aria-hidden="true" focusable="false">
      <g fill="currentColor">
        {LOGO.letters.map((l, i) => (
          <path key={i} transform={`translate(${l.x} ${s}) scale(1 -1)`} d={l.d} />
        ))}
      </g>
      <g dangerouslySetInnerHTML={{ __html: LOGO.eye }} />
    </svg>
  )
}

/** Icône seule (le C-œil). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${LOGO.eyeSize} ${LOGO.eyeSize}`} aria-hidden="true" focusable="false">
      <g dangerouslySetInnerHTML={{ __html: LOGO.eyeAlone }} />
    </svg>
  )
}

/** Logo complet : mot-symbole + nom de l'institut. Le nom se replie quand l'en-tête passe en version compacte. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`logo ${compact ? 'is-compact' : ''}`}>
      <LogoWord className="logo-word" />
      <span className="logo-name" aria-hidden="true">
        <span>Institut Changeons de Regard</span> <span>sur le Handicap</span>
      </span>
    </span>
  )
}
