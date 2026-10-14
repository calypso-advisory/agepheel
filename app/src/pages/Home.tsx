import { useCallback, useState } from 'react'
import { Film } from '../components/Film'
import { ContactForm } from '../components/ContactForm'
import { EditorialStory } from '../components/EditorialStory'
import { Solutions } from '../components/Solutions'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { usePageMeta } from './usePageMeta'

export default function Home() {
  usePageMeta(
    'Changeons de regard — Inclusion et handicap en entreprise',
    'Recrutement, intégration, OETH, entreprises adaptées et ESAT : comprendre vos obligations et identifier les solutions adaptées à votre entreprise.',
  )
  const { reduced, setPref } = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const onFail = useCallback(() => setFailed(true), [])
  const film = !reduced && !failed

  return (
    <>
      {film ? (
        <>
          <Film onRequestStatic={() => setPref('reduce')} onFail={onFail} />
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
