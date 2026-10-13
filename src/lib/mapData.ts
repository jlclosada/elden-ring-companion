import { useEffect, useState } from 'react'
import type { CompendiumCat, Layer } from '../data/types'
import locationCoords from '../data/generated/location-coords.json'
import { LOCATION_BY_ID } from '../data/locations'
import { BOSSES, BOSS_KIND, bossKey, type Boss } from '../data/bosses'
import { BOSS_LOCATIONS } from '../data/boss-locations'

export interface MapMarker {
  id: string
  cat: string
  layer: Layer
  x: number
  y: number
  name: string
  desc?: string
  loot?: string[]
  ref?: { cat: CompendiumCat; name: string }
  /** Lugar real junto al que se ubica (objetos geolocalizados) */
  near?: string
  region?: string | null
  approx?: boolean
  dlc?: boolean
  image?: string | null
  /** Ids de lugares de la app asociados (tareas) */
  appLocs?: string[]
  /** Clave del jefe en la checklist de la partida (run.done) */
  bossKey?: string
}

export interface MapLayerMeta { width: number; height: number; maxZoom: number }
export interface MapData { layers: Record<Layer, MapLayerMeta>; markers: MapMarker[] }

export type CatGroup = 'Lugares' | 'Jefes' | 'Coleccionables' | 'Equipo y objetos' | 'Tu partida'

export interface CatMeta {
  label: string
  group: CatGroup
  color: string
  /** Icono PNG/WebP del juego o glifo SVG propio */
  img?: string
  glyph?: string
  /** Zoom relativo (respecto al máximo) a partir del cual se muestra */
  minZoomOffset?: number
  defaultOn: boolean
}

// Glifos SVG (24×24) para categorías sin icono del juego
const G = {
  dungeon: '<path d="M4 20V10l8-6 8 6v10h-5v-6H9v6z"/>',
  sword: '<path d="M14.5 3H21v6.5L10 20.5 7 21l.5-3zM5 15l4 4-2 2-4-4z"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/>',
  armor: '<path d="M7 3l5 2 5-2 4 4-3 3v11H6V10L3 7z"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9z"/>',
  spark: '<path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>',
  sun: '<circle cx="12" cy="12" r="5"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M4.2 19.8L7 17M17 7l2.8-2.8" stroke="currentColor" stroke-width="2"/>',
  flame: '<path d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-3-1-5 1-8z"/>',
  ghost: '<path d="M5 21V10a7 7 0 0114 0v11l-3-2-2 2-2-2-2 2-2-2z"/>',
  bag: '<path d="M6 8h12l1 13H5zM9 8V6a3 3 0 016 0v2" />',
  star: '<path d="M12 2l3 7 7 .6-5.3 4.6L18.4 22 12 18l-6.4 4 1.7-7.8L2 9.6 9 9z"/>',
}

export const CATS: Record<string, CatMeta> = {
  hub: { label: 'Mesa Redonda', group: 'Lugares', color: '#f4dc9a', img: 'hub', defaultOn: true },
  grace: { label: 'Lugares de gracia', group: 'Lugares', color: '#f4d58d', img: 'grace', defaultOn: true },
  dungeon: { label: 'Mazmorras', group: 'Lugares', color: '#c9a0ff', glyph: G.dungeon, defaultOn: true },
  evergaol: { label: 'Prisiones eternas', group: 'Lugares', color: '#8f9fe0', img: 'evergaol', defaultOn: true },
  mausoleum: { label: 'Mausoleos', group: 'Lugares', color: '#b9a98a', img: 'mausoleum', defaultOn: false },
  merchant: { label: 'Mercaderes', group: 'Lugares', color: '#d9a35b', img: 'merchant', defaultOn: true },
  story_boss: { label: 'Jefes principales', group: 'Jefes', color: '#e0614f', img: 'story_boss', defaultOn: true },
  field_boss: { label: 'Jefes de campo', group: 'Jefes', color: '#e08a4f', img: 'field_boss', defaultOn: true },
  dungeon_boss: { label: 'Jefes de mazmorra', group: 'Jefes', color: '#a38bd6', img: 'field_boss', defaultOn: true },
  evergaol_boss: { label: 'Jefes de prisión eterna', group: 'Jefes', color: '#8f9fe0', img: 'field_boss', defaultOn: true },
  night_boss: { label: 'Caballería nocturna', group: 'Jefes', color: '#9aa2c4', img: 'night_boss', defaultOn: true },
  death_bird: { label: 'Aves de la muerte', group: 'Jefes', color: '#9aa2c4', img: 'death_bird', defaultOn: false },
  golden_seed: { label: 'Semillas doradas', group: 'Coleccionables', color: '#f2c14e', img: 'golden_seed', defaultOn: true },
  sacred_tear: { label: 'Lágrimas sagradas', group: 'Coleccionables', color: '#9fd3ff', img: 'sacred_tear', defaultOn: true },
  scadutree: { label: 'Fragmentos del Árbol Umbrío', group: 'Coleccionables', color: '#e9c97a', img: 'scadutree', defaultOn: true },
  revered_ash: { label: 'Cenizas veneradas', group: 'Coleccionables', color: '#b7c4d6', img: 'revered_ash', defaultOn: true },
  item_weapons: { label: 'Armas', group: 'Equipo y objetos', color: '#e6c56f', glyph: G.sword, minZoomOffset: 2, defaultOn: true },
  item_shields: { label: 'Escudos', group: 'Equipo y objetos', color: '#cfae6a', glyph: G.shield, minZoomOffset: 2, defaultOn: true },
  item_armors: { label: 'Armaduras', group: 'Equipo y objetos', color: '#a9b4c2', glyph: G.armor, minZoomOffset: 2, defaultOn: false },
  item_talismans: { label: 'Talismanes', group: 'Equipo y objetos', color: '#6fc3a3', glyph: G.gem, minZoomOffset: 2, defaultOn: true },
  item_sorceries: { label: 'Hechicerías', group: 'Equipo y objetos', color: '#7aa7ff', glyph: G.spark, minZoomOffset: 2, defaultOn: true },
  item_incantations: { label: 'Encantamientos', group: 'Equipo y objetos', color: '#f2c14e', glyph: G.sun, minZoomOffset: 2, defaultOn: true },
  item_ashes: { label: 'Cenizas de guerra', group: 'Equipo y objetos', color: '#e0873a', glyph: G.flame, minZoomOffset: 2, defaultOn: true },
  item_spirits: { label: 'Cenizas de espíritu', group: 'Equipo y objetos', color: '#b7c4d6', glyph: G.ghost, minZoomOffset: 2, defaultOn: true },
  item_items: { label: 'Objetos clave y consumibles', group: 'Equipo y objetos', color: '#d6cbb3', glyph: G.bag, minZoomOffset: 2, defaultOn: false },
  task: { label: 'Lugares de la guía', group: 'Tu partida', color: '#f4dc9a', glyph: G.star, defaultOn: true },
}

export const GROUP_ORDER: CatGroup[] = ['Tu partida', 'Lugares', 'Jefes', 'Coleccionables', 'Equipo y objetos']

export const LAYER_LABEL: Record<Layer, string> = { surface: 'Tierras Intermedias', underground: 'Subsuelo', shadow: 'Reino de las Sombras' }

let cache: MapData | null = null
let pending: Promise<MapData> | null = null

export function loadMapData(): Promise<MapData> {
  if (cache) return Promise.resolve(cache)
  pending ??= import('../data/generated/map.json').then((m) => {
    cache = withBosses(withAppLocations(m.default as unknown as MapData))
    return cache
  })
  return pending
}

export function useMapData() {
  const [data, setData] = useState<MapData | null>(cache)
  useEffect(() => {
    if (!data) loadMapData().then(setData)
  }, [data])
  return data
}

export interface AppCoord { layer: Layer; x: number; y: number; marker?: string; approx?: boolean }
export const APP_COORDS = locationCoords as Record<string, AppCoord>

/** Une los lugares de la app (tareas/builds) a los marcadores reales o crea marcadores propios. */
function withAppLocations(data: MapData): MapData {
  const byId = new Map(data.markers.map((m) => [m.id, m]))
  const extra: MapMarker[] = []
  for (const [locId, c] of Object.entries(APP_COORDS)) {
    const real = c.marker ? byId.get(c.marker) : undefined
    if (real) {
      real.appLocs = [...(real.appLocs ?? []), locId]
    } else {
      extra.push({ id: `loc:${locId}`, cat: 'task', layer: c.layer, x: c.x, y: c.y, name: LOCATION_BY_ID[locId]?.name ?? locId, desc: LOCATION_BY_ID[locId]?.note, approx: c.approx, appLocs: [locId] })
    }
  }
  return { ...data, markers: [...data.markers, ...extra] }
}

const normBoss = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
const BOSS_CAT: Record<Boss['kind'], string> = {
  remembrance: 'story_boss', major: 'story_boss', field: 'field_boss', dungeon: 'dungeon_boss', evergaol: 'evergaol_boss', night: 'night_boss',
}

/**
 * Completa el mapa con todos los jefes del catálogo de la app. Los datos del mapa solo traen los
 * principales y unos pocos de campo; el resto se coloca en su mazmorra, prisión o lugar.
 */
function withBosses(data: MapData): MapData {
  const bossCats = new Set(['story_boss', 'field_boss', 'night_boss', 'death_bird'])
  const existing = new Map<string, MapMarker[]>()
  for (const m of data.markers) if (bossCats.has(m.cat)) {
    const n = normBoss(m.name)
    existing.set(n, [...(existing.get(n) ?? []), m])
  }
  // Primero los marcadores de lugares (gracias, mazmorras…), después cualquier otro, por nombre exacto
  const byName = new Map<string, MapMarker[]>()
  for (const m of data.markers) {
    if (m.cat.startsWith('item_') || bossCats.has(m.cat)) continue
    byName.set(m.name, [...(byName.get(m.name) ?? []), m])
  }
  // Varios jefes en el mismo sitio: se reparten en círculo alrededor del punto
  const crowd = new Map<string, number>()
  const extra: MapMarker[] = []
  for (const b of BOSSES) {
    const known = existing.get(normBoss(b.en))
    if (known?.length) {
      // Ya está en el mapa: le asociamos la checklist al más cercano por capa
      const target = known.find((m) => !m.bossKey && (m.layer === 'shadow') === Boolean(b.dlc)) ?? known.find((m) => !m.bossKey)
      if (target) target.bossKey = bossKey(b)
      continue
    }
    const ref = BOSS_LOCATIONS[b.id]
    if (!ref) continue
    let pos: { layer: Layer; x: number; y: number } | undefined = APP_COORDS[ref]
    if (!pos) {
      const list = byName.get(ref)
      pos = list?.find((m) => (m.layer === 'shadow') === Boolean(b.dlc)) ?? list?.[0]
    }
    if (!pos) continue
    const spot = `${pos.layer}:${pos.x}:${pos.y}`
    const n = crowd.get(spot) ?? 0
    crowd.set(spot, n + 1)
    const angle = (n * 2.4) + 0.8
    const r = 70 + n * 18
    extra.push({
      id: `boss:${b.id}`, cat: BOSS_CAT[b.kind], layer: pos.layer,
      x: Math.round(pos.x + Math.cos(angle) * r), y: Math.round(pos.y + Math.sin(angle) * r),
      name: b.name, desc: `${b.en}. ${BOSS_KIND[b.kind].label} · ${b.place}.${b.required ? ' Obligatorio.' : ''}`,
      near: b.place, approx: true, dlc: b.dlc, bossKey: bossKey(b),
    })
  }
  return { ...data, markers: [...data.markers, ...extra] }
}

/** Marcador que representa un lugar de la app */
export function markerIdForLocation(locId: string) {
  const c = APP_COORDS[locId]
  if (!c) return null
  return c.marker ?? `loc:${locId}`
}

export function iconHtml(cat: string, extra = '') {
  const meta = CATS[cat] ?? CATS.task
  const inner = meta.img
    ? `<img src="/map-icons/${meta.img}.webp" alt="" draggable="false"/>`
    : `<svg viewBox="0 0 24 24" fill="currentColor">${meta.glyph}</svg>`
  return `<div class="gm-pin ${meta.img ? 'gm-img' : 'gm-glyph'} ${cat.startsWith('item_') ? 'gm-item' : ''} ${extra}" style="--c:${meta.color}">${inner}</div>`
}
