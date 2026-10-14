/**
 * Contenus éditables du site (hors récit cinématographique, qui vit dans cinematic/storyboard.ts).
 * Les mentions « À valider » signalent des contenus à confirmer par l'équipe avant publication :
 * aucune certification, aucun partenariat, aucun chiffre client n'est inventé ici.
 */

export const BRAND = {
  name: 'ICRH',
  long: 'Institut Changeons de Regard sur le Handicap',
  baseline: 'Inclusion et handicap en entreprise',
}

export const NAV = [
  { to: '/solutions', label: 'Solutions' },
  { to: '/comprendre-oeth', label: 'Comprendre l’OETH' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/contact', label: 'Contact' },
]

export const SOLUTIONS = [
  {
    id: 'talents',
    title: 'Révéler les talents.',
    kicker: 'Recrutement, intégration et maintien dans l’emploi',
    text: 'Identifier les opportunités, faciliter l’intégration et accompagner durablement l’emploi des personnes en situation de handicap.',
    to: '/solutions#talents',
    image: 'scene-15',
    alt: 'En magasin, une vendeuse portant une prothèse de jambe tend un produit à son collègue.',
  },
  {
    id: 'collaborations',
    title: 'Développer des collaborations utiles.',
    kicker: 'Entreprises adaptées et ESAT',
    text: 'Identifier les partenaires du secteur adapté et protégé et intégrer ces collaborations dans une démarche responsable.',
    to: '/entreprises-adaptees-esat',
    image: 'scene-06',
    alt: 'Zone logistique : un salarié en fauteuil roulant ferme un colis, sa collègue l’observe en souriant.',
  },
  {
    id: 'obligations',
    title: 'Y voir clair sur vos obligations.',
    kicker: 'OETH et contribution',
    text: 'Analyser votre situation, comprendre les mécanismes de contribution et identifier les leviers d’action applicables.',
    to: '/comprendre-oeth',
    image: 'scene-10',
    alt: 'Une salariée présente un graphique de résultats à son équipe.',
  },
] as const

export const OETH = {
  t1: { figure: '20', text: 'À partir de 20 salariés, votre entreprise est concernée par l’obligation d’emploi.' },
  t2: {
    figure: '6 %',
    text: 'L’obligation d’emploi représente 6 % de l’effectif de référence, selon les règles applicables.',
    note: 'Les modalités de décompte, les délais d’assujettissement et les situations particulières (effectif moyen annuel, entreprises nouvellement concernées, emplois exigeant des conditions d’aptitude particulières…) font l’objet de règles spécifiques. Informations générales, à faire valider avant publication — ne constituent pas une analyse de votre situation.',
  },
  t3: {
    title: 'Et concrètement, où en est votre entreprise ?',
    text: 'Comprenez vos obligations et identifiez les solutions adaptées à votre situation.',
  },
}

/** Accueil : ce que voit le visiteur avant de faire défiler. */
export const HERO = {
  title: 'Dans chaque entreprise, il y a des talents.',
  text: 'Recrutement, intégration, obligations OETH : nous aidons les entreprises à révéler ces talents et à passer à l’action.',
}

export const CTA = {
  title: 'Et si nous faisions le point sur votre entreprise ?',
  text: 'Découvrez votre situation, comprenez vos obligations et identifiez les solutions qui peuvent faire la différence.',
  primary: 'Faire le point sur ma situation',
  secondary: 'Découvrir nos solutions',
}

export const CONTACT_SUBJECTS = [
  'Comprendre mes obligations OETH',
  'Analyser ma contribution Agefiph',
  'Recrutement / intégration',
  'Partenaires EA / ESAT',
  'Accompagnement',
  'Autre',
]

export const HEADCOUNTS = ['Moins de 20 salariés', '20 à 49', '50 à 249', '250 à 999', '1 000 et plus']
