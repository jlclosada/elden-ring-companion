import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Skull, BookOpen, MapPin, ScrollText, Swords, Compass, CornerDownLeft, Loader2, User, Home, Map as MapIcon,
  Calculator, Plus, FileDown, BookMarked,
} from 'lucide-react'
import { BOSSES, BOSS_KIND } from '../data/bosses'
import { REGION_BY_ID } from '../data/regions'
import { BUILDS } from '../data/builds'
import { CHAPTERS as NOVEL } from '../content/novela'
import { CHAPTERS as CHRONICLES, CHARACTERS } from '../data/lore'
import { GLOSARIO } from '../content/novela/edicion'
import { CATEGORY_META, loadCategory } from '../lib/compendium'
import { CATS, loadMapData } from '../lib/mapData'
import type { CompendiumCat } from '../data/types'
import { cx } from './ui'

type Icon = ComponentType<{ size?: number; className?: string }>

interface Item {
  id: string
  group: string
  title: string
  sub?: string
  /** Texto extra en el que también se busca */
  extra?: string
  to: string
  icon: Icon
}

/** Minúsculas y sin tildes, para buscar «gigante» y encontrar «Gigánte» o «gigante» */
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const PAGES: Item[] = [
  { id: 'p:inicio', group: 'Ir a', title: 'Inicio', to: '/', icon: Home },
  { id: 'p:partida', group: 'Ir a', title: 'Partida activa', sub: 'Guía, recomendaciones, roadmap', to: '/partida', icon: Compass },
  { id: 'p:jefes', group: 'Ir a', title: 'Checklist de jefes', to: '/partida?tab=bosses', icon: Skull },
  { id: 'p:nueva', group: 'Ir a', title: 'Nueva partida', to: '/nueva', icon: Plus },
  { id: 'p:mapa', group: 'Ir a', title: 'Mapa', to: '/mapa', icon: MapIcon },
  { id: 'p:builds', group: 'Ir a', title: 'Builds', to: '/builds', icon: Swords },
  { id: 'p:plan', group: 'Ir a', title: 'Planificador', sub: 'Runas, niveles y armas', to: '/planificador', icon: Calculator },
  { id: 'p:comp', group: 'Ir a', title: 'Compendio', to: '/compendio', icon: BookOpen },
  { id: 'p:lore', group: 'Ir a', title: 'Biblioteca de lore', to: '/lore', icon: ScrollText },
  { id: 'p:libro', group: 'Ir a', title: 'Edición impresa de la novela', sub: 'Exportar a PDF', to: '/lore/libro', icon: FileDown },
]

function staticItems(): Item[] {
  const items: Item[] = [...PAGES]
  for (const b of BOSSES) {
    items.push({ id: `b:${b.id}`, group: 'Jefes', title: b.name, sub: `${BOSS_KIND[b.kind].label} · ${b.place} · ${REGION_BY_ID[b.region]?.nameEs ?? ''}`, extra: b.en, to: `/partida?tab=bosses&jefe=${encodeURIComponent(b.name)}`, icon: Skull })
  }
  NOVEL.forEach((c, i) => items.push({ id: `n:${c.slug}`, group: 'Novela', title: `${i + 1}. ${c.title}`, sub: c.era, to: `/lore/novela/${c.slug}`, icon: BookMarked }))
  for (const c of CHRONICLES) items.push({ id: `c:${c.id}`, group: 'Crónicas', title: c.title, sub: c.era, extra: c.summary, to: `/lore/${c.id}`, icon: ScrollText })
  for (const c of CHARACTERS) items.push({ id: `ch:${c.id}`, group: 'Personajes', title: c.name, sub: c.title, extra: c.bio, to: '/lore', icon: User })
  for (const g of GLOSARIO) items.push({ id: `g:${g.termino}`, group: 'Glosario', title: g.termino, sub: g.definicion, to: '/lore', icon: ScrollText })
  for (const b of BUILDS) items.push({ id: `bu:${b.id}`, group: 'Builds', title: b.name, sub: b.subtitle, extra: b.archetype, to: `/builds/${b.id}`, icon: Swords })
  return items
}

let heavyCache: Item[] | null = null
async function loadHeavy(): Promise<Item[]> {
  if (heavyCache) return heavyCache
  const cats = Object.keys(CATEGORY_META) as CompendiumCat[]
  const [lists, map] = await Promise.all([Promise.all(cats.map(loadCategory)), loadMapData()])
  const items: Item[] = []
  cats.forEach((cat, i) => {
    for (const e of lists[i]) {
      items.push({ id: `i:${cat}:${e.id}`, group: 'Compendio', title: e.name, sub: `${CATEGORY_META[cat].label}${e.dlc ? ' · DLC' : ''}${e.category ? ` · ${e.category}` : ''}`, to: `/compendio/${cat}/${e.id}`, icon: BookOpen })
    }
  })
  for (const m of map.markers) {
    if (m.cat.startsWith('item_')) continue // los objetos ya salen en el compendio
    items.push({ id: `m:${m.id}`, group: 'Mapa', title: m.name, sub: CATS[m.cat]?.label ?? m.cat, extra: m.loot?.join(' '), to: `/mapa?m=${encodeURIComponent(m.id)}`, icon: MapPin })
  }
  heavyCache = items
  return items
}

const GROUP_ORDER = ['Ir a', 'Jefes', 'Novela', 'Personajes', 'Builds', 'Compendio', 'Mapa', 'Crónicas', 'Glosario']
const PER_GROUP = 6

function search(items: Item[], q: string): Item[] {
  const terms = norm(q).split(/\s+/).filter(Boolean)
  if (!terms.length) return items.filter((i) => i.group === 'Ir a')
  const scored: { item: Item; score: number }[] = []
  for (const item of items) {
    const title = norm(item.title)
    const hay = `${title} ${norm(item.sub ?? '')} ${norm(item.extra ?? '')}`
    if (!terms.every((t) => hay.includes(t))) continue
    let score = 0
    for (const t of terms) {
      if (title.startsWith(t)) score += 6
      else if (title.includes(` ${t}`)) score += 4
      else if (title.includes(t)) score += 2
    }
    score -= title.length / 100
    scored.push({ item, score })
  }
  scored.sort((a, b) => b.score - a.score)
  // Máximo PER_GROUP por grupo, ordenados por grupo
  const byGroup = new Map<string, Item[]>()
  for (const { item } of scored) {
    const list = byGroup.get(item.group) ?? []
    if (list.length < PER_GROUP) list.push(item)
    byGroup.set(item.group, list)
  }
  return GROUP_ORDER.flatMap((g) => byGroup.get(g) ?? [])
}

/** Buscador global (⌘K / Ctrl+K / «/»). */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const [heavy, setHeavy] = useState<Item[] | null>(heavyCache)
  const nav = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const base = useMemo(staticItems, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); setOpen((o) => !o) }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-search', onOpen)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('open-search', onOpen) }
  }, [])

  useEffect(() => {
    if (!open) return
    setQ(''); setSel(0)
    requestAnimationFrame(() => inputRef.current?.focus())
    if (!heavy) loadHeavy().then(setHeavy).catch(() => setHeavy([]))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => search(heavy ? [...base, ...heavy] : base, q), [base, heavy, q])
  useEffect(() => { setSel(0) }, [q])
  useEffect(() => { listRef.current?.querySelector(`[data-idx="${sel}"]`)?.scrollIntoView({ block: 'nearest' }) }, [sel])

  if (!open) return null
  const go = (item: Item | undefined) => { if (!item) return; setOpen(false); nav(item.to) }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/65 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
      <div className="rise w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}
        role="dialog" aria-label="Buscar en Sendero de Gracia">
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search size={18} className="shrink-0 text-gold-400" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca jefes, objetos, lugares, capítulos, personajes…"
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
              if (e.key === 'Enter') { e.preventDefault(); go(results[sel]) }
              if (e.key === 'Escape') setOpen(false)
            }}
            className="h-14 flex-1 bg-transparent text-base text-parch-100 outline-none placeholder:text-parch-400" aria-label="Buscar" />
          {!heavy && <Loader2 size={16} className="animate-spin text-parch-400" aria-label="Cargando compendio y mapa" />}
          <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-parch-400 sm:block">ESC</kbd>
        </div>
        <div ref={listRef} className="scrollbar-thin max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && <div className="px-3 py-8 text-center text-sm text-parch-400">Nada encontrado para «{q}».</div>}
          {results.map((item, i) => {
            const Icon = item.icon
            const header = i === 0 || results[i - 1].group !== item.group
            return (
              <div key={item.id}>
                {header && <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-500">{item.group}</div>}
                <button data-idx={i} onMouseMove={() => setSel(i)} onClick={() => go(item)}
                  className={cx('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left', i === sel ? 'bg-gold-500/12 ring-1 ring-gold-500/30' : 'hover:bg-white/5')}>
                  <Icon size={16} className={cx('shrink-0', i === sel ? 'text-gold-300' : 'text-parch-400')} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-parch-100">{item.title}</div>
                    {item.sub && <div className="truncate text-xs text-parch-400">{item.sub}</div>}
                  </div>
                  {i === sel && <CornerDownLeft size={14} className="shrink-0 text-parch-400" />}
                </button>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2 text-[11px] text-parch-400">
          <span><kbd className="font-sans">↑↓</kbd> moverse</span><span><kbd className="font-sans">↵</kbd> abrir</span>
          <span className="ml-auto">{heavy ? `${(base.length + heavy.length).toLocaleString('es')} entradas` : 'Cargando compendio y mapa…'}</span>
        </div>
      </div>
    </div>
  )
}
