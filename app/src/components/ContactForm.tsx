import { useId, useRef, useState, type FormEvent } from 'react'
import { CONTACT_SUBJECTS, HEADCOUNTS } from '../content/site'
import { submitContact, type ContactPayload } from '../services/contact'

type Errors = Partial<Record<keyof ContactPayload, string>>

const EMPTY: ContactPayload = {
  nom: '',
  prenom: '',
  entreprise: '',
  email: '',
  telephone: '',
  effectif: '',
  objet: '',
  message: '',
  consentement: false,
}

function validate(d: ContactPayload): Errors {
  const e: Errors = {}
  if (!d.nom.trim()) e.nom = 'Indiquez votre nom.'
  if (!d.prenom.trim()) e.prenom = 'Indiquez votre prénom.'
  if (!d.entreprise.trim()) e.entreprise = 'Indiquez le nom de votre entreprise.'
  if (!d.email.trim()) e.email = 'Indiquez votre adresse email professionnelle.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = 'Le format de l’email est incorrect (exemple : prenom.nom@entreprise.fr).'
  if (d.telephone.trim() && !/^[+0-9 ().-]{8,20}$/.test(d.telephone.trim())) e.telephone = 'Le numéro de téléphone semble incorrect.'
  if (!d.effectif) e.effectif = 'Sélectionnez un effectif approximatif.'
  if (!d.objet) e.objet = 'Sélectionnez l’objet de votre demande.'
  if (!d.consentement) e.consentement = 'Votre accord est nécessaire pour que nous puissions vous recontacter.'
  return e
}

export function ContactForm({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const [data, setData] = useState<ContactPayload>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'demo' | 'sent' | 'error'>('idle')
  const [serverError, setServerError] = useState('')
  const summaryRef = useRef<HTMLDivElement>(null)
  const uid = useId()
  const H = headingLevel === 1 ? 'h1' : 'h2'

  const set = <K extends keyof ContactPayload>(k: K, v: ContactPayload[K]) => {
    setData((d) => ({ ...d, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    const e = validate(data)
    setErrors(e)
    if (Object.keys(e).length) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setStatus('sending')
    const r = await submitContact(data)
    if (r.ok) {
      setStatus(r.mode === 'demo' ? 'demo' : 'sent')
      setData(EMPTY)
    } else {
      setServerError(r.error)
      setStatus('error')
    }
    requestAnimationFrame(() => summaryRef.current?.focus())
  }

  const fid = (k: string) => `${uid}-${k}`
  const errProps = (k: keyof ContactPayload) =>
    errors[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${fid(k)}-err` } : {}
  const Err = ({ k }: { k: keyof ContactPayload }) =>
    errors[k] ? (
      <p className="field-error" id={`${fid(k)}-err`}>
        {errors[k]}
      </p>
    ) : null
  const errorList = Object.entries(errors).filter(([, v]) => v) as [keyof ContactPayload, string][]

  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="container contact-grid">
        <div className="contact-intro">
          <p className="eyebrow">Contact</p>
          <H id="contact-title" tabIndex={-1}>
            Faisons le point sur votre situation
          </H>
          <p>
            Décrivez-nous votre contexte : nous revenons vers vous pour un premier échange. Les champs marqués d’un
            astérisque (*) sont obligatoires.
          </p>
        </div>

        <form className="contact-form" noValidate onSubmit={onSubmit} aria-describedby={`${uid}-req`}>
          <p id={`${uid}-req`} className="sr-only">
            Les champs marqués d’un astérisque sont obligatoires.
          </p>
          <div ref={summaryRef} tabIndex={-1} className="form-status" role="status" aria-live="polite">
            {errorList.length > 0 && (
              <div className="form-alert form-alert-error">
                <p>
                  {errorList.length === 1 ? 'Un champ est à corriger :' : `${errorList.length} champs sont à corriger :`}
                </p>
                <ul>
                  {errorList.map(([k, v]) => (
                    <li key={k}>
                      <a href={`#${fid(k)}`}>{v}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {status === 'demo' && (
              <div className="form-alert form-alert-demo">
                <strong>Mode démonstration.</strong> Le formulaire est valide, mais aucun service d’envoi n’est encore
                configuré : aucune donnée n’a été transmise.
              </div>
            )}
            {status === 'sent' && <div className="form-alert form-alert-ok">Merci, votre demande a bien été envoyée.</div>}
            {status === 'error' && <div className="form-alert form-alert-error">{serverError}</div>}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor={fid('nom')}>Nom *</label>
              <input id={fid('nom')} name="nom" autoComplete="family-name" required value={data.nom} onChange={(e) => set('nom', e.target.value)} {...errProps('nom')} />
              <Err k="nom" />
            </div>
            <div className="field">
              <label htmlFor={fid('prenom')}>Prénom *</label>
              <input id={fid('prenom')} name="prenom" autoComplete="given-name" required value={data.prenom} onChange={(e) => set('prenom', e.target.value)} {...errProps('prenom')} />
              <Err k="prenom" />
            </div>
          </div>
          <div className="field">
            <label htmlFor={fid('entreprise')}>Entreprise *</label>
            <input id={fid('entreprise')} name="entreprise" autoComplete="organization" required value={data.entreprise} onChange={(e) => set('entreprise', e.target.value)} {...errProps('entreprise')} />
            <Err k="entreprise" />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor={fid('email')}>Email professionnel *</label>
              <input id={fid('email')} name="email" type="email" autoComplete="email" required value={data.email} onChange={(e) => set('email', e.target.value)} {...errProps('email')} />
              <Err k="email" />
            </div>
            <div className="field">
              <label htmlFor={fid('telephone')}>
                Téléphone <span className="optional">(facultatif)</span>
              </label>
              <input id={fid('telephone')} name="telephone" type="tel" autoComplete="tel" value={data.telephone} onChange={(e) => set('telephone', e.target.value)} {...errProps('telephone')} />
              <Err k="telephone" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor={fid('effectif')}>Effectif approximatif *</label>
              <select id={fid('effectif')} name="effectif" required value={data.effectif} onChange={(e) => set('effectif', e.target.value)} {...errProps('effectif')}>
                <option value="">Sélectionner</option>
                {HEADCOUNTS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
              <Err k="effectif" />
            </div>
            <div className="field">
              <label htmlFor={fid('objet')}>Objet de la demande *</label>
              <select id={fid('objet')} name="objet" required value={data.objet} onChange={(e) => set('objet', e.target.value)} {...errProps('objet')}>
                <option value="">Sélectionner</option>
                {CONTACT_SUBJECTS.map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
              <Err k="objet" />
            </div>
          </div>
          <div className="field">
            <label htmlFor={fid('message')}>
              Message <span className="optional">(facultatif)</span>
            </label>
            <textarea id={fid('message')} name="message" rows={5} value={data.message} onChange={(e) => set('message', e.target.value)} />
          </div>
          <div className="field field-check">
            <input id={fid('consentement')} type="checkbox" checked={data.consentement} onChange={(e) => set('consentement', e.target.checked)} {...errProps('consentement')} />
            <label htmlFor={fid('consentement')}>
              J’accepte que les informations saisies soient utilisées pour être recontacté(e) au sujet de ma demande. *
            </label>
            <Err k="consentement" />
          </div>
          <p className="rgpd">
            Vos données sont destinées uniquement au traitement de votre demande et ne sont pas cédées à des tiers. Vous
            disposez d’un droit d’accès, de rectification et d’effacement. [Responsable de traitement, durée de
            conservation et contact DPO : à compléter avant mise en ligne.]
          </p>
          <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Envoi en cours…' : 'Envoyer ma demande'}
          </button>
        </form>
      </div>
    </section>
  )
}
