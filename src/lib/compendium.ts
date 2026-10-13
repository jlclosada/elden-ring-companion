import { useEffect, useState } from 'react'
import type { CompendiumCat, CompendiumEntry } from '../data/types'

// Cada categoría se carga bajo demanda (code-splitting de los JSON generados)
const loaders: Record<CompendiumCat, () => Promise<{ default: CompendiumEntry[] }>> = {
  weapons: () => import('../data/generated/weapons.json') as never,
  shields: () => import('../data/generated/shields.json') as never,
  armors: () => import('../data/generated/armors.json') as never,
  talismans: () => import('../data/generated/talismans.json') as never,
  sorceries: () => import('../data/generated/sorceries.json') as never,
  incantations: () => import('../data/generated/incantations.json') as never,
  ashes: () => import('../data/generated/ashes.json') as never,
  spirits: () => import('../data/generated/spirits.json') as never,
  items: () => import('../data/generated/items.json') as never,
}

export const CATEGORY_META: Record<CompendiumCat, { label: string; icon: string }> = {
  weapons: { label: 'Armas', icon: 'Sword' },
  shields: { label: 'Escudos', icon: 'Shield' },
  armors: { label: 'Armaduras', icon: 'Shirt' },
  talismans: { label: 'Talismanes', icon: 'Gem' },
  sorceries: { label: 'Hechicerías', icon: 'Sparkles' },
  incantations: { label: 'Encantamientos', icon: 'Sun' },
  ashes: { label: 'Cenizas de guerra', icon: 'Flame' },
  spirits: { label: 'Cenizas de espíritu', icon: 'Ghost' },
  items: { label: 'Objetos', icon: 'Package' },
}

const cache = new Map<CompendiumCat, CompendiumEntry[]>()
const pending = new Map<CompendiumCat, Promise<CompendiumEntry[]>>()

export function loadCategory(cat: CompendiumCat): Promise<CompendiumEntry[]> {
  if (cache.has(cat)) return Promise.resolve(cache.get(cat)!)
  if (!pending.has(cat)) {
    pending.set(cat, loaders[cat]().then((m) => {
      cache.set(cat, m.default)
      return m.default
    }))
  }
  return pending.get(cat)!
}

export function useCategory(cat: CompendiumCat | null) {
  const [data, setData] = useState<CompendiumEntry[] | null>(cat ? cache.get(cat) ?? null : null)
  useEffect(() => {
    if (!cat) return
    let alive = true
    loadCategory(cat).then((d) => alive && setData(d))
    return () => { alive = false }
  }, [cat])
  return cat && cache.has(cat) ? cache.get(cat)! : data
}

export const normName = (s: string) =>
  s.toLowerCase().replace(/^ash(es)? of war:\s*/, '').replace(/\s*\(spell\)$/, '').replace(/[^a-z0-9]+/g, ' ').trim()

export function findEntry(list: CompendiumEntry[] | null, name: string) {
  if (!list) return undefined
  const n = normName(name)
  return list.find((e) => normName(e.name) === n)
}

export function useEntry(cat: CompendiumCat | undefined, name: string | undefined) {
  const list = useCategory(cat ?? null)
  return name ? findEntry(list, name) : undefined
}
