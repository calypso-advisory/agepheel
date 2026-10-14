/**
 * Logo ICRH — Institut Changeons de Regard sur le Handicap.
 * Deux déclinaisons (public/brand) : « clair » pour les fonds clairs, « sombre » (lettres blanches,
 * accents vert d'eau et orange conservés) pour les fonds sombres et les photos.
 * En-tête : déployé (monogramme + nom) en haut de page ; réduit au monogramme dès qu'on fait défiler.
 */
const base = import.meta.env.BASE_URL
const SRC = (part: 'monogramme' | 'nom', tone: 'clair' | 'sombre') => `${base}brand/icrh-${part}-${tone}-entete.webp`

/** tone « auto » : suit le thème de l'élément parent (.theme-dark / .theme-light, pied de page sombre) */
export function Logo({ compact = false, tone = 'auto' }: { compact?: boolean; tone?: 'auto' | 'clair' | 'sombre' }) {
  const tones = tone === 'auto' ? (['clair', 'sombre'] as const) : ([tone] as const)
  return (
    <span className={`logo ${compact ? 'is-compact' : ''} logo-${tone}`}>
      <span className="logo-mono">
        {tones.map((t) => (
          <img key={t} className={`on-${t}`} src={SRC('monogramme', t)} alt="" width={432} height={144} decoding="async" />
        ))}
      </span>
      <span className="logo-name">
        {tones.map((t) => (
          <img key={t} className={`on-${t}`} src={SRC('nom', t)} alt="" width={226} height={144} decoding="async" />
        ))}
      </span>
    </span>
  )
}
