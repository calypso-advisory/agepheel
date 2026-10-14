import { useCallback, useEffect, useState } from 'react'
import { Film } from '../components/Film'
import { ContactForm } from '../components/ContactForm'
import { EditorialStory } from '../components/EditorialStory'
import { Solutions } from '../components/Solutions'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { usePageMeta } from './usePageMeta'

export default function Home({ steps = false }: { steps?: boolean }) {
  usePageMeta(
    'ICRH — Institut Changeons de Regard sur le Handicap',
    'Recrutement, intégration, OETH, entreprises adaptées et ESAT : comprendre vos obligations et identifier les solutions adaptées à votre entreprise.',
  )
  const { reduced, setPref } = useReducedMotion()
  // page d'essai : jamais indexée
  useEffect(() => {
    if (!steps) return
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex, nofollow'
    document.head.appendChild(m)
    return () => m.remove()
  }, [steps])
  const [failed, setFailed] = useState(false)
  const onFail = useCallback(() => setFailed(true), [])
  const film = !reduced && !failed

  return (
    <>
      {film ? (
        <>
          <Film onFail={onFail} steps={steps} />
          <EditorialStory visuallyHidden />
        </>
      ) : (
        <EditorialStory onRequestFilm={() => setPref('full')} />
      )}
      <Solutions />
      <ContactForm />
    </>
  )
}
