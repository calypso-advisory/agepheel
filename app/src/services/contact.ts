/**
 * Couche de service du formulaire de contact.
 *
 * Aucun backend n'est configuré : sans VITE_CONTACT_ENDPOINT, l'envoi passe en mode démonstration
 * et l'interface l'indique clairement. Pour brancher un vrai service, définir VITE_CONTACT_ENDPOINT
 * (URL acceptant un POST JSON) dans .env.
 */
export interface ContactPayload {
  nom: string
  prenom: string
  entreprise: string
  email: string
  telephone: string
  effectif: string
  objet: string
  message: string
  consentement: boolean
}

export type ContactResult = { ok: true; mode: 'live' | 'demo' } | { ok: false; error: string }

export async function submitContact(data: ContactPayload): Promise<ContactResult> {
  const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined
  if (!endpoint) {
    await new Promise((r) => setTimeout(r, 400))
    return { ok: true, mode: 'demo' }
  }
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return { ok: false, error: `Le serveur a répondu ${res.status}.` }
    return { ok: true, mode: 'live' }
  } catch {
    return { ok: false, error: 'Le message n’a pas pu être envoyé. Vérifiez votre connexion et réessayez.' }
  }
}
