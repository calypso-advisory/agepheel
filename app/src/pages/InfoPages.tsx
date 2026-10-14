import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ALL_SCENES } from '../cinematic/storyboard'
import { ContactForm } from '../components/ContactForm'
import { OETH, SOLUTIONS } from '../content/site'
import { usePageMeta } from './usePageMeta'

/**
 * Pages secondaires. Structure et intentions posées ; les contenus détaillés sont
 * signalés « À compléter » : ils doivent être rédigés et validés par l'équipe.
 */

function PageHero({ eyebrow, title, intro, image }: { eyebrow: string; title: string; intro: string; image?: string }) {
  const img = image ? ALL_SCENES.find((s) => s.id === image) : undefined
  return (
    <header className="page-hero">
      <div className="container page-hero-grid">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lead">{intro}</p>
        </div>
        {img && <img src={img.srcSmall} alt={img.alt} width={960} height={540} />}
      </div>
    </header>
  )
}

const Todo = ({ children }: { children: ReactNode }) => (
  <p className="todo">
    <span>À compléter</span> {children}
  </p>
)

export function SolutionsPage() {
  usePageMeta('Nos solutions — ICRH', 'Révéler les talents, développer des collaborations avec le secteur adapté et protégé, y voir clair sur vos obligations.')
  return (
    <>
      <PageHero eyebrow="Nos solutions" title="Passer du constat à l’action." intro="Trois axes pour avancer, selon votre situation." image="scene-13" />
      <div className="container prose">
        {SOLUTIONS.map((s) => (
          <section key={s.id} id={s.id} className="prose-section">
            <h2>{s.title}</h2>
            <p className="solution-kicker">{s.kicker}</p>
            <p>{s.text}</p>
            <Todo>Description détaillée de la prestation, déroulé, livrables et modalités d’intervention.</Todo>
            <Link to={s.to === `/solutions#${s.id}` ? '/contact' : s.to}>{s.to === `/solutions#${s.id}` ? 'Nous contacter' : 'Lire la page dédiée'} →</Link>
          </section>
        ))}
      </div>
    </>
  )
}

export function OethPage() {
  usePageMeta('Comprendre l’OETH — ICRH', 'Obligation d’emploi des travailleurs handicapés : les repères essentiels et les leviers d’action.')
  return (
    <>
      <PageHero
        eyebrow="Comprendre l’OETH"
        title="L’obligation d’emploi, en clair."
        intro="Les grands repères pour situer votre entreprise. Informations générales, à faire valider avant publication."
        image="scene-14"
      />
      <div className="container prose">
        <section className="prose-section">
          <h2>Qui est concerné ?</h2>
          <p>
            <strong className="fig-inline">{OETH.t1.figure}</strong> {OETH.t1.text}
          </p>
        </section>
        <section className="prose-section">
          <h2>Quel taux ?</h2>
          <p>
            <strong className="fig-inline">{OETH.t2.figure}</strong> {OETH.t2.text}
          </p>
          <p className="note">{OETH.t2.note}</p>
        </section>
        <section className="prose-section">
          <h2>Comment s’en acquitter ?</h2>
          <p>
            L’obligation peut être remplie de plusieurs façons : emploi direct, recours à des entreprises adaptées ou à des ESAT, accord
            agréé. À défaut, l’entreprise verse une contribution.
          </p>
          <Todo>Détail des modalités (déclaration, calcul de la contribution, dépenses déductibles, accords agréés), rédigé et validé par un juriste, avec date de mise à jour.</Todo>
        </section>
        <p>
          <Link to="/contact">Faire le point sur ma situation →</Link>
        </p>
      </div>
    </>
  )
}

export function EaEsatPage() {
  usePageMeta('Entreprises adaptées et ESAT — ICRH', 'Développer des collaborations utiles avec le secteur adapté et protégé.')
  return (
    <>
      <PageHero
        eyebrow="Entreprises adaptées et ESAT"
        title="Développer des collaborations utiles."
        intro="Identifier les partenaires du secteur adapté et protégé et intégrer ces collaborations dans une démarche responsable."
        image="scene-06"
      />
      <div className="container prose">
        <section className="prose-section">
          <h2>Pourquoi travailler avec le secteur adapté et protégé ?</h2>
          <Todo>Présentation des EA et ESAT, types de prestations possibles, effets sur l’obligation d’emploi (à valider).</Todo>
        </section>
        <section className="prose-section">
          <h2>Notre accompagnement</h2>
          <Todo>Méthode d’identification des partenaires et de suivi des collaborations.</Todo>
        </section>
      </div>
    </>
  )
}

export function AboutPage() {
  usePageMeta('À propos — ICRH', 'Qui nous sommes et comment nous accompagnons les entreprises.')
  return (
    <>
      <PageHero eyebrow="À propos" title="Changeons de regard." intro="Changer la perception du handicap, et changer d’angle pour voir les compétences." image="scene-12" />
      <div className="container prose">
        <section className="prose-section">
          <h2>Notre démarche</h2>
          <Todo>Histoire, équipe, valeurs et engagements de la structure. Aucune certification ni aucun partenariat ne doit être mentionné sans justificatif.</Todo>
        </section>
      </div>
    </>
  )
}

export function ContactPage() {
  usePageMeta('Contact — ICRH', 'Faisons le point sur votre situation.')
  return <ContactForm headingLevel={1} />
}

export function NotFound() {
  usePageMeta('Page introuvable — ICRH', 'Cette page n’existe pas.')
  return (
    <div className="container prose page-pad">
      <h1>Page introuvable</h1>
      <p>
        <Link to="/">Revenir à l’accueil</Link>
      </p>
    </div>
  )
}
