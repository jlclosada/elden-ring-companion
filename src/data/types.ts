export type StatKey = 'vig' | 'min' | 'end' | 'str' | 'dex' | 'int' | 'fai' | 'arc'
export type Stats = Record<StatKey, number>

export type Layer = 'surface' | 'underground' | 'shadow'

export interface Region {
  id: string
  name: string
  nameEs: string
  layer: Layer
  /** Puntos de control del contorno (se suaviza al renderizar). Coordenadas 0-1000. */
  shape: [number, number][]
  label: [number, number]
  levels: [number, number]
  /** Orden aproximado de progresión (0 = inicio) */
  phase: number
  color: string
  blurb: string
}

export type LocationType =
  | 'legacy' | 'boss' | 'dungeon' | 'grace' | 'item' | 'npc' | 'merchant'
  | 'evergaol' | 'church' | 'upgrade' | 'shortcut' | 'landmark'

export interface MapLocation {
  id: string
  name: string
  region: string
  type: LocationType
  x: number
  y: number
  layer?: Layer
  note?: string
}

/** Etiquetas que la IA de recomendaciones cruza con la build */
export type Tag =
  | 'str' | 'dex' | 'int' | 'fai' | 'arc'
  | 'bleed' | 'frost' | 'poison' | 'rot' | 'holy' | 'fire' | 'lightning' | 'magic'
  | 'sorcery' | 'incant' | 'dragon' | 'melee' | 'katana' | 'colossal' | 'spirit'
  | 'flask' | 'upgrade' | 'runes' | 'mobility' | 'defense' | 'stamina' | 'fp' | 'universal'

export type TaskKind = 'main' | 'boss' | 'item' | 'upgrade' | 'key' | 'npc' | 'shortcut' | 'dungeon'

export type CompendiumCat =
  | 'weapons' | 'shields' | 'armors' | 'talismans' | 'sorceries' | 'incantations'
  | 'ashes' | 'spirits' | 'items'

export interface Task {
  id: string
  title: string
  kind: TaskKind
  /** Fase de progresión en la que es razonable hacerlo */
  phase: number
  location?: string
  tags: Tag[]
  detail?: string
  /** Enlace a una entrada del compendio */
  ref?: { cat: CompendiumCat; name: string }
  /** Clave para completar el juego */
  required?: boolean
  /** Grupo para la checklist */
  group: ChecklistGroup
  /** Requiere tareas previas (ids) */
  after?: string[]
  /** Contenido de Shadow of the Erdtree */
  dlc?: boolean
}

export type ChecklistGroup =
  | 'Camino principal' | 'Mejoras de frasco' | 'Mejora de armas' | 'Llaves y accesos'
  | 'Equipo de la build' | 'Preparación' | 'Jefes opcionales' | 'Cenizas de espíritu' | 'Mapas'
  | 'Shadow of the Erdtree' | 'Bendición del Árbol Umbrío'

export interface Phase {
  id: number
  name: string
  short: string
  levels: [number, number]
  regions: string[]
  summary: string
}

export interface BuildGear {
  slot: 'weapon' | 'offhand' | 'catalyst' | 'spell' | 'ash' | 'talisman' | 'armor' | 'spirit' | 'tear' | 'consumable'
  name: string
  cat: CompendiumCat
  /** Fase en la que se puede conseguir (aprox.) */
  phase: number
  location?: string
  how: string
  core?: boolean
  stage: 'early' | 'mid' | 'late' | 'dlc'
}

export interface StatCheckpoint {
  level: number
  stats: Partial<Stats>
  note?: string
}

export interface Build {
  id: string
  name: string
  subtitle: string
  archetype: string
  accent: string
  icon: string
  difficulty: 1 | 2 | 3
  /** Build que solo es posible con el DLC */
  dlcOnly?: boolean
  classes: { id: string; why: string }[]
  keepsake: string
  primary: StatKey[]
  tags: Partial<Record<Tag, number>>
  pitch: string
  playstyle: string[]
  gear: BuildGear[]
  checkpoints: StatCheckpoint[]
  affinity?: string
  setup: Omit<Task, 'group' | 'tags'>[]
  tips: string[]
}

export interface StartingClass {
  id: string
  name: string
  nameEs: string
  level: number
  stats: Stats
  blurb: string
}

// ---- Compendio generado --------------------------------------------------
export interface CompendiumEntry {
  id: string
  name: string
  image: string | null
  description: string
  obtain?: string | null
  category?: string
  weight?: number | null
  attack?: Record<string, number>
  defence?: Record<string, number>
  scaling?: Record<string, string>
  requires?: Record<string, number>
  negation?: Record<string, number>
  resistance?: Record<string, number>
  effect?: string
  cost?: number | null
  slots?: number | null
  affinity?: string
  skill?: string
  fpCost?: number | null
  type?: string
  dlc?: boolean
  /** Descripción completa del juego (párrafos) */
  lore?: string[]
  loreNotes?: string[]
}

// ---- Partida --------------------------------------------------------------
export interface Run {
  id: string
  name: string
  buildId: string
  classId: string
  createdAt: number
  updatedAt: number
  done: Record<string, number>
  level: number
  stats: Stats
  setupEnabled: boolean
  ng: number
  notes: string
  hiddenTasks?: string[]
  /** Incluir Shadow of the Erdtree en el plan */
  dlcEnabled?: boolean
}
