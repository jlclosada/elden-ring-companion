import type { StartingClass, StatKey } from './types'

const s = (vig: number, min: number, end: number, str: number, dex: number, int: number, fai: number, arc: number) =>
  ({ vig, min, end, str, dex, int, fai, arc })

export const CLASSES: StartingClass[] = [
  { id: 'vagabond', name: 'Vagabond', nameEs: 'Vagabundo', level: 9, stats: s(15, 10, 11, 14, 13, 9, 9, 7), blurb: 'Caballero con escudo y alabarda. El más robusto.' },
  { id: 'warrior', name: 'Warrior', nameEs: 'Guerrero', level: 8, stats: s(11, 12, 11, 10, 16, 10, 8, 9), blurb: 'Dos cimitarras y la Destreza más alta.' },
  { id: 'hero', name: 'Hero', nameEs: 'Héroe', level: 7, stats: s(14, 9, 12, 16, 9, 7, 8, 11), blurb: 'Hacha de batalla y la Fuerza más alta.' },
  { id: 'bandit', name: 'Bandit', nameEs: 'Bandido', level: 5, stats: s(10, 11, 10, 9, 13, 9, 8, 14), blurb: 'Daga y arco. El Arcano más alto.' },
  { id: 'astrologer', name: 'Astrologer', nameEs: 'Astrólogo', level: 6, stats: s(9, 15, 9, 8, 12, 16, 7, 9), blurb: 'Hechicero de brillo. Inteligencia 16.' },
  { id: 'prophet', name: 'Prophet', nameEs: 'Profeta', level: 7, stats: s(10, 14, 8, 11, 10, 7, 16, 10), blurb: 'Sanación y llamas. Fe 16.' },
  { id: 'samurai', name: 'Samurai', nameEs: 'Samurái', level: 9, stats: s(12, 11, 13, 12, 15, 9, 8, 8), blurb: 'Uchigatana y arco largo. El mejor inicio.' },
  { id: 'prisoner', name: 'Prisoner', nameEs: 'Prisionero', level: 9, stats: s(11, 12, 11, 11, 14, 14, 6, 9), blurb: 'Espadachín mágico: Int y Destreza.' },
  { id: 'confessor', name: 'Confessor', nameEs: 'Confesor', level: 10, stats: s(10, 13, 10, 12, 12, 9, 14, 9), blurb: 'Espada, escudo y conjuros.' },
  { id: 'wretch', name: 'Wretch', nameEs: 'Desdichado', level: 1, stats: s(10, 10, 10, 10, 10, 10, 10, 10), blurb: 'Garrote y nada más. Nivel 1, sin desperdicio.' },
]

export const CLASS_BY_ID = Object.fromEntries(CLASSES.map((c) => [c.id, c])) as Record<string, StartingClass>

export const STAT_KEYS: StatKey[] = ['vig', 'min', 'end', 'str', 'dex', 'int', 'fai', 'arc']

export const STAT_META: Record<StatKey, { label: string; short: string; api: string; caps: number[]; color: string; desc: string }> = {
  vig: { label: 'Vigor', short: 'VIG', api: 'Vig', caps: [40, 60], color: '#e36b5b', desc: 'Vida. 40 es lo mínimo razonable a mitad de juego; 60 el tope útil.' },
  min: { label: 'Mente', short: 'MEN', api: 'Min', caps: [50, 60], color: '#6b9ae3', desc: 'Puntos de concentración (PC).' },
  end: { label: 'Resistencia', short: 'RES', api: 'End', caps: [25, 50], color: '#6cc48b', desc: 'Aguante y carga de equipo.' },
  str: { label: 'Fuerza', short: 'FUE', api: 'Str', caps: [20, 55, 80], color: '#d8a25a', desc: 'Armas pesadas. A dos manos cuenta ×1,5.' },
  dex: { label: 'Destreza', short: 'DES', api: 'Dex', caps: [20, 55, 80], color: '#c9d65a', desc: 'Armas rápidas y velocidad de lanzamiento.' },
  int: { label: 'Inteligencia', short: 'INT', api: 'Int', caps: [20, 50, 80], color: '#5bb6e3', desc: 'Hechicerías y armas mágicas.' },
  fai: { label: 'Fe', short: 'FE', api: 'Fai', caps: [20, 50, 80], color: '#f2c14e', desc: 'Encantamientos y armas sagradas/fuego.' },
  arc: { label: 'Arcano', short: 'ARC', api: 'Arc', caps: [20, 45, 80], color: '#c26be3', desc: 'Sangrado, veneno, descubrimiento y conjuros de dragón.' },
}
