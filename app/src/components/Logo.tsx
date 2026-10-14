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
      <g dangerouslySetInnerHTML={{ __html: LOGO.defs + LOGO.eye }} />
    </svg>
  )
}

/** Icône seule (le C-œil). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${LOGO.eyeSize} ${LOGO.eyeSize}`} aria-hidden="true" focusable="false">
      <g dangerouslySetInnerHTML={{ __html: LOGO.defs + LOGO.eyeAlone }} />
    </svg>
  )
}

/**
 * Logo complet : mot-symbole + nom de l'institut, initiales dans la couleur de l'iris.
 * En version compacte, le nom se replie et le regard se tourne vers le visiteur.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  const [bx, by] = LOGO.irisBack
  return (
    <span className={`logo ${compact ? 'is-compact' : ''}`} style={{ ['--iris-x' as string]: `${bx}px`, ['--iris-y' as string]: `${by}px` }}>
      <LogoWord className="logo-word" />
      <span className="logo-name" aria-hidden="true">
        <span>
          <b>I</b>nstitut <b>C</b>hangeons de <b>R</b>egard
        </span>{' '}
        <span>
          sur le <b>H</b>andicap
        </span>
      </span>
    </span>
  )
}
