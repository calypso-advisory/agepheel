/**
 * LE FILM — storyboard du récit scrollé (version 3 : clips Runway).
 *
 * Le film est une suite de « temps » (beats). Chaque temps occupe une longueur de scroll
 * et décrit, en fonction de sa progression locale u (0 → 1) :
 *  - quel clip est affiché et à quel instant (0 → 1 dans le clip) ;
 *  - où se trouve le cadre vidéo : plein écran, carte, fenêtre étroite… ;
 *  - quels textes, quelles surfaces graphiques sont visibles.
 *
 * Fil conducteur : le regard. On part de l'équipe, on entre dans les yeux d'une salariée, on en ressort ;
 * à la fin, on entre dans les yeux d'une salariée, on entre dans ceux d'une autre.
 */

export interface ClipDef {
  id: string
  /** description (documentation et texte alternatif) */
  label: string
  /** points focaux pour le recadrage vertical (mobile) : [instant 0..1, x 0..1] */
  focal: [number, number][]
}

export const CLIPS: ClipDef[] = [
  { id: 'c00', label: 'Une salariée en fauteuil roulant présente à ses collègues attentifs ; la caméra s’approche lentement jusqu’à ses yeux.', focal: [[0, 0.6], [0.5, 0.62], [0.7, 0.55], [1, 0.5]] },
  { id: 'c01', label: 'Très gros plan sur les yeux d’une salariée, puis la caméra recule et révèle son sourire pendant qu’elle présente.', focal: [[0, 0.5], [1, 0.55]] },
  { id: 'c02', label: 'La caméra tourne autour d’elle et révèle ses collègues qui l’écoutent.', focal: [[0, 0.55], [1, 0.62]] },
  { id: 'c03', label: 'La caméra avance vers l’écran de présentation jusqu’à ce qu’il remplisse l’image.', focal: [[0, 0.62], [1, 0.5]] },
  { id: 'p1', label: 'Une salariée équipée d’un bras bionique assemble un module à l’atelier, puis gros plan sur sa main et son tournevis.', focal: [[0, 0.45], [0.4, 0.45], [0.5, 0.5], [1, 0.5]] },
  { id: 'c04', label: 'Gros plan sur les mains d’un salarié qui assemble un module, puis la caméra recule sur l’atelier.', focal: [[0, 0.5], [1, 0.35]] },
  { id: 'c05', label: 'Le salarié de l’atelier sourit à ses collègues ; la caméra glisse jusqu’à l’entrepôt, où un salarié en fauteuil roulant ferme un colis sous le regard de sa collègue.', focal: [[0, 0.52], [0.4, 0.52], [0.6, 0.47], [1, 0.47]] },
  { id: 'r1', label: 'En magasin, une vendeuse portant une prothèse de jambe tend un produit à son collègue.', focal: [[0, 0.55], [1, 0.58]] },
  { id: 'o1', label: 'Au bureau, un salarié porteur d’un implant auditif travaille avec deux collègues ; la caméra glisse derrière un pilier jusqu’à la réunion voisine.', focal: [[0, 0.5], [0.4, 0.55], [0.6, 0.5], [1, 0.5]] },
  { id: 'c06', label: 'Une salariée en fauteuil roulant quitte son poste et rejoint la réunion.', focal: [[0, 0.62], [1, 0.4]] },
  { id: 'c07', label: 'La caméra s’élève au-dessus de la table de réunion jusqu’à une vue de dessus.', focal: [[0, 0.4], [1, 0.5]] },
  { id: 'c07b', label: 'La caméra redescend de la vue du dessus et traverse le bureau jusqu’à la paroi vitrée.', focal: [[0, 0.5], [0.55, 0.5], [0.62, 0.45], [1, 0.3]] },
  { id: 'c08', label: 'Elle coche une liste sur une paroi vitrée puis revient à son ordinateur, entourée de ses collègues.', focal: [[0, 0.45], [1, 0.32]] },
  { id: 'c09', label: 'La caméra s’approche lentement de son visage jusqu’à ses yeux.', focal: [[0, 0.32], [1, 0.5]] },
]

export type TextPos = 'over' | 'col' | 'center'

export interface FilmText {
  id: string
  text: string
  /** version courte pour téléphone */
  short?: string
  pos: TextPos
  size: 'xl' | 'l'
  h1?: boolean
}

export const TEXTS: FilmText[] = [
  { id: 'regard', text: 'Certains méritent simplement qu’on les regarde autrement.', short: 'Regardons autrement.', pos: 'over', size: 'l' },
  { id: 'def', text: 'Le handicap ne définit pas un talent.', pos: 'over', size: 'l' },
  { id: 'comp', text: 'Ce sont ses compétences qui font la différence.', pos: 'col', size: 'xl' },
  { id: 'avance', text: 'Quand chacun apporte ses compétences, c’est toute l’entreprise qui avance.', pos: 'col', size: 'l' },
  { id: 'diff', text: 'Des compétences différentes.', pos: 'over', size: 'l' },
  { id: 'exig', text: 'Une même exigence de réussite.', pos: 'over', size: 'xl' },
  { id: 'metier', text: 'Chaque métier a ses talents.', pos: 'over', size: 'l' },
  { id: 'place', text: 'Chaque talent a sa place.', pos: 'over', size: 'xl' },
  { id: 'seul', text: 'Rien ne se construit seul.', pos: 'over', size: 'l' },
  { id: 'coll', text: 'La réussite est collective.', pos: 'over', size: 'xl' },
  { id: 'impro', text: 'L’inclusion ne s’improvise pas.', pos: 'over', size: 'l' },
  { id: 'ensemble', text: 'Elle se construit, ensemble.', pos: 'over', size: 'xl' },
  { id: 'id', text: 'Identifier les besoins.', pos: 'center', size: 'xl' },
  { id: 'build', text: 'Construire les solutions.', pos: 'center', size: 'xl' },
  { id: 'acc', text: 'Accompagner durablement.', pos: 'center', size: 'xl' },
  { id: 'engag', text: 'Des engagements concrets.', pos: 'over', size: 'l' },
  { id: 'res', text: 'Des résultats qui comptent.', pos: 'over', size: 'xl' },
  { id: 'action', text: 'Chaque action fait avancer l’entreprise.', pos: 'over', size: 'xl' },
]

/** Durée de chaque temps, en hauteurs d'écran (multipliée par PACE). */
export const PACE = 0.72

export const BEATS = [
  { id: 'open', len: 2.2, act: 1 },
  { id: 'reveal', len: 1.6, act: 1 },
  { id: 'orbit', len: 2.0, act: 1 },
  { id: 'screen', len: 1.8, act: 1 },
  { id: 'chart', len: 2.8, act: 1 },
  { id: 'arm', len: 2.0, act: 2 },
  { id: 'hands', len: 1.6, act: 2 },
  { id: 'logi', len: 2.0, act: 2 },
  { id: 'split', len: 3.4, act: 2 },
  { id: 'office', len: 2.0, act: 3 },
  { id: 'desk', len: 1.8, act: 3 },
  { id: 'crane', len: 2.8, act: 3 },
  { id: 'results', len: 2.6, act: 3 },
  { id: 'glass', len: 1.8, act: 3 },
  { id: 'oeth', len: 3.2, act: 4 },
  { id: 'word', len: 2.0, act: 4 },
  { id: 'eyes', len: 2.0, act: 4 },
  { id: 'cta', len: 1.8, act: 4 },
] as const

export type BeatId = (typeof BEATS)[number]['id']

export const ACTS = [
  { act: 1, label: 'Changer de regard', beat: 'open' },
  { act: 2, label: 'Tous les métiers', beat: 'arm' },
  { act: 3, label: 'Une démarche', beat: 'office' },
  { act: 4, label: 'Agir', beat: 'oeth' },
] as const

/** Barres décoratives du graphique dessiné sur l'écran (aucun chiffre : ce ne sont pas des données). */
/** Mot géant dont les lettres sont découpées sur la vidéo, avant la plongée finale dans les yeux. */
export const KNOCKOUT_WORD = 'REGARD'

export const CHART_BARS = ['Écoute', 'Rigueur', 'Créativité', 'Fiabilité', 'Engagement']
