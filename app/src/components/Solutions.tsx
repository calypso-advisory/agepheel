import { Link } from 'react-router-dom'
import { SCENES } from '../cinematic/storyboard'
import { SOLUTIONS } from '../content/site'

export function Solutions() {
  return (
    <section id="solutions" className="solutions" aria-labelledby="solutions-title">
      <div className="container">
        <p className="eyebrow">Nos solutions</p>
        <h2 id="solutions-title" tabIndex={-1}>
          Passer du constat à l’action.
        </h2>
        <ul className="solution-grid">
          {SOLUTIONS.map((s, i) => {
            const img = SCENES.find((x) => x.id === s.image)!
            return (
              <li key={s.id} className="solution-card">
                <div className="solution-media">
                  <img src={img.srcSmall} alt="" loading="lazy" width={960} height={540} />
                  {s.id === 'obligations' && (
                    <span className="solution-chip" aria-hidden="true">
                      6 %
                    </span>
                  )}
                </div>
                <div className="solution-body">
                  <p className="solution-index" aria-hidden="true">
                    0{i + 1}
                  </p>
                  <h3>{s.title}</h3>
                  <p className="solution-kicker">{s.kicker}</p>
                  <p>{s.text}</p>
                  <Link className="solution-link" to={s.to}>
                    En savoir plus<span className="sr-only"> : {s.kicker}</span>
                    <span aria-hidden="true"> →</span>
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
