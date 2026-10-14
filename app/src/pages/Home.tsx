import { useCallback, useState } from 'react'
import { Film } from '../components/Film'
import { ContactForm } from '../components/ContactForm'
import { EditorialStory } from '../components/EditorialStory'
import { Solutions } from '../components/Solutions'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { usePageMeta } from './usePageMeta'

export default function Home() {
  usePageMeta(
    'ICRH — Institut Changeons de Regard sur le Handicap',
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
          {/* en portrait (téléphone), le film avance par étapes : un geste, une étape */}
          <Film onFail={onFail} steps />
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
