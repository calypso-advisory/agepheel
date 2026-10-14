import { Link } from 'react-router-dom'
import { ACTS, SCENES, STORYBOARD } from '../cinematic/storyboard'
import { CTA, OETH } from '../content/site'

/**
 * Parcours éditorial statique : les 12 scènes et tous les messages du récit, sans mouvement.
 * - visible pour « prefers-reduced-motion », sans WebGL, ou sur demande (« Version sans animation ») ;
 * - en mode film, rendu en version masquée pour les lecteurs d'écran et l'indexation.
 */
export function EditorialStory({ visuallyHidden = false, onRequestFilm }: { visuallyHidden?: boolean; onRequestFilm?: () => void }) {
  const byScene = new Map<string, string[]>()
  for (const seg of STORYBOARD) {
    if (seg.type !== 'shot') continue
    const sc = seg.layers[0].scene
    byScene.set(sc, [...(byScene.get(sc) ?? []), ...(seg.texts ?? []).map((t) => t.text)])
  }
  const actOf = (sceneId: string) => STORYBOARD.find((s) => s.type === 'shot' && s.layers[0].scene === sceneId)?.act ?? 1

  return (
    <section className={visuallyHidden ? 'sr-only' : 'editorial'} aria-label="Le récit, en version texte et images">
      {!visuallyHidden && (
        <header className="editorial-head">
          <p className="eyebrow">Changeons de regard</p>
          <h1>Dans chaque entreprise, il y a des talents.</h1>
          {onRequestFilm && (
            <button type="button" className="tool-btn tool-dark" onClick={onRequestFilm}>
              Voir la version animée
            </button>
          )}
        </header>
      )}
      {ACTS.slice(0, 3).map((a) => (
        <div key={a.act} className="editorial-act">
          <h2 className="editorial-act-title">{a.label}</h2>
          <ol className="editorial-list">
            {SCENES.filter((s) => actOf(s.id) === a.act).map((s) => {
              const texts = byScene.get(s.id) ?? []
              return (
                <li key={s.id} className="editorial-item">
                  <figure>
                    {!visuallyHidden && <img src={s.srcSmall} alt={s.alt} loading="lazy" width={960} height={540} />}
                    <figcaption>
                      {visuallyHidden && <span>{s.alt} </span>}
                      {texts.map((t, i) =>
                        visuallyHidden && s.id === 'scene-01' && i === 0 ? null : (
                          <span key={i} className={i === texts.length - 1 ? 'strong' : ''}>
                            {t}{' '}
                          </span>
                        ),
                      )}
                    </figcaption>
                  </figure>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
      <div className="editorial-oeth">
        <h2 className="editorial-act-title">Vos obligations, en bref</h2>
        <div className="editorial-figures">
          <p>
            <strong className="fig">{OETH.t1.figure}</strong> {OETH.t1.text}
          </p>
          <p>
            <strong className="fig">{OETH.t2.figure}</strong> {OETH.t2.text}
          </p>
        </div>
        <p className="note">{OETH.t2.note}</p>
        <p className="editorial-question">{OETH.t3.title}</p>
        <p>{OETH.t3.text}</p>
      </div>
      {!visuallyHidden && (
        <div className="editorial-cta editorial-item">
          <figure>
            <img src={SCENES[11].srcSmall} alt={SCENES[11].alt} loading="lazy" width={960} height={540} />
            <figcaption>
              <h2>{CTA.title}</h2>
              <p>{CTA.text}</p>
              <div className="cta-actions">
                <a className="btn btn-primary" href="#contact">
                  {CTA.primary}
                </a>
                <a className="btn btn-ghost-dark" href="#solutions">
                  {CTA.secondary}
                </a>
              </div>
              <p className="small">
                <Link to="/comprendre-oeth">En savoir plus sur l’OETH</Link>
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  )
}
