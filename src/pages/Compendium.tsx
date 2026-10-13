import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, LayoutGrid, List, X } from 'lucide-react'
import type { CompendiumCat, CompendiumEntry } from '../data/types'
import { CATEGORY_META, normName, useCategory } from '../lib/compendium'
import { BUILDS } from '../data/builds'
import { STAT_META } from '../data/classes'
import { ICONS, PageHeader, Badge, cx } from '../components/ui'
import { ItemThumb } from '../components/ItemCard'
import summary from '../data/generated/summary.json'

const CATS = Object.keys(CATEGORY_META) as CompendiumCat[]
const PAGE = 48
const USED_BY = new Map<string, string[]>()
for (const b of BUILDS) for (const g of b.gear) USED_BY.set(normName(g.name), [...(USED_BY.get(normName(g.name)) ?? []), b.name])

type Sort = 'name' | 'weight' | 'attack' | 'dlc'
const statKey = (k: string) => (({ Str: 'str', Dex: 'dex', Int: 'int', Fai: 'fai', Arc: 'arc', Intelligence: 'int', Faith: 'fai', Arcane: 'arc' }) as Record<string, keyof typeof STAT_META>)[k]

export default function CompendiumPage() {
  const [params, setParams] = useSearchParams()
  const cat = (params.get('cat') as CompendiumCat) || 'weapons'
  const [q, setQ] = useState('')
  const [sub, setSub] = useState('all')
  const [source, setSource] = useState<'all' | 'base' | 'dlc'>('all')
  const [sort, setSort] = useState<Sort>('name')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [limit, setLimit] = useState(PAGE)
  const data = useCategory(cat)
  const counts = summary.counts as Record<string, number>

  const subcats = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of data ?? []) { const k = e.category || e.type; if (k) m.set(k, (m.get(k) ?? 0) + 1) }
    return [...m].sort((a, b) => b[1] - a[1])
  }, [data])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    const out = (data ?? []).filter((e) => {
      if (sub !== 'all' && (e.category || e.type) !== sub) return false
      if (source === 'base' && e.dlc) return false
      if (source === 'dlc' && !e.dlc) return false
      if (!s) return true
      return e.name.toLowerCase().includes(s) || (e.effect ?? '').toLowerCase().includes(s) || (e.lore ?? []).join(' ').toLowerCase().includes(s) || (e.obtain ?? '').toLowerCase().includes(s)
    })
    const atk = (e: CompendiumEntry) => Object.entries(e.attack ?? {}).filter(([k]) => k !== 'Crit').reduce((a, [, v]) => a + v, 0)
    return out.sort((a, b) =>
      sort === 'weight' ? (b.weight ?? 0) - (a.weight ?? 0)
        : sort === 'attack' ? atk(b) - atk(a)
          : sort === 'dlc' ? Number(!!b.dlc) - Number(!!a.dlc) || a.name.localeCompare(b.name)
            : a.name.localeCompare(b.name))
  }, [data, q, sub, source, sort])

  const changeCat = (c: CompendiumCat) => { setParams({ cat: c }); setSub('all'); setLimit(PAGE); setQ('') }
  const total = Object.entries(counts).filter(([k]) => (CATS as string[]).includes(k)).reduce((a, [, v]) => a + v, 0)

  return (
    <div>
      <PageHeader eyebrow="Compendio" title="Reliquias de las Tierras Intermedias">
        {total.toLocaleString('es')} objetos del juego base y de Shadow of the Erdtree, con su descripción completa, estadísticas y cómo conseguirlos.
        Busca por nombre, efecto o por cualquier palabra de su descripción («Marika», «blood», «Caelid»…).
      </PageHeader>

      <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {CATS.map((c) => {
          const Icon = ICONS[CATEGORY_META[c].icon]
          const on = c === cat
          return (
            <button key={c} onClick={() => changeCat(c)}
              className={cx('group relative overflow-hidden rounded-xl border px-2 py-3 text-center transition',
                on ? 'border-gold-500/60 bg-gold-500/10 shadow-glow' : 'border-white/5 bg-white/[.02] hover:border-white/15')}>
              <Icon size={22} className={cx('mx-auto transition', on ? 'text-gold-300' : 'text-parch-400 group-hover:text-parch-200')} />
              <div className={cx('mt-1.5 text-[11px] font-semibold leading-tight', on ? 'text-gold-300' : 'text-parch-200')}>{CATEGORY_META[c].label}</div>
              <div className="text-[10px] text-parch-400">{counts[c]}</div>
            </button>
          )
        })}
      </div>

      <div className="sticky top-0 z-20 -mx-4 mb-5 space-y-3 border-b border-white/5 bg-ink-950/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-56 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-parch-400" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE) }} placeholder={`Buscar en ${CATEGORY_META[cat].label.toLowerCase()}…`}
              className="h-11 w-full rounded-xl border border-white/10 bg-ink-900 pl-10 pr-9 text-sm text-parch-100 outline-none placeholder:text-parch-400 focus:border-gold-500/60" />
            {q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-parch-400" aria-label="Limpiar"><X size={15} /></button>}
          </div>
          <div className="flex rounded-xl border border-white/10 p-1">
            {([['all', 'Todo'], ['base', 'Base'], ['dlc', 'DLC']] as const).map(([id, label]) => (
              <button key={id} onClick={() => { setSource(id); setLimit(PAGE) }} className={cx('rounded-lg px-3 text-sm', source === id ? 'bg-gold-500/15 text-gold-300' : 'text-parch-300 hover:text-parch-100')}>{label}</button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-11 rounded-xl border border-white/10 bg-ink-900 px-3 text-sm text-parch-200" aria-label="Ordenar">
            <option value="name">Nombre A-Z</option>
            {cat === 'weapons' || cat === 'shields' ? <option value="attack">Mayor ataque</option> : null}
            {cat === 'weapons' || cat === 'shields' || cat === 'armors' ? <option value="weight">Más pesado</option> : null}
            <option value="dlc">DLC primero</option>
          </select>
          <div className="flex rounded-xl border border-white/10 p-1">
            <button onClick={() => setView('grid')} className={cx('rounded-lg px-2.5', view === 'grid' ? 'bg-gold-500/15 text-gold-300' : 'text-parch-400')} aria-label="Cuadrícula"><LayoutGrid size={16} /></button>
            <button onClick={() => setView('list')} className={cx('rounded-lg px-2.5', view === 'list' ? 'bg-gold-500/15 text-gold-300' : 'text-parch-400')} aria-label="Lista"><List size={16} /></button>
          </div>
        </div>
        {subcats.length > 1 && (
          <div className="scrollbar-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
            <Chip on={sub === 'all'} onClick={() => setSub('all')}>Todas</Chip>
            {subcats.map(([s, n]) => <Chip key={s} on={sub === s} onClick={() => { setSub(s); setLimit(PAGE) }}>{s} <span className="text-parch-400">{n}</span></Chip>)}
          </div>
        )}
      </div>

      {!data ? <div className="py-24 text-center text-sm text-parch-400">Cargando…</div> : (
        <>
          <div className="mb-3 text-xs text-parch-400">{list.length} resultados</div>
          {view === 'grid' ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 min-[1900px]:grid-cols-8">
              {list.slice(0, limit).map((e) => <GridCard key={e.id} e={e} cat={cat} q={q} />)}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/5">
              {list.slice(0, limit).map((e, i) => <ListRow key={e.id} e={e} cat={cat} odd={i % 2 === 1} />)}
            </div>
          )}
          {list.length > limit && (
            <div className="mt-8 text-center">
              <button onClick={() => setLimit((l) => l + PAGE)} className="rounded-xl border border-gold-500/30 px-5 py-2.5 text-sm text-gold-300 hover:bg-gold-500/10">Mostrar más ({list.length - limit})</button>
            </div>
          )}
          {list.length === 0 && <div className="py-20 text-center text-sm text-parch-400">Nada coincide con «{q}».</div>}
        </>
      )}
    </div>
  )
}

function GridCard({ e, cat, q }: { e: CompendiumEntry; cat: CompendiumCat; q: string }) {
  const used = USED_BY.get(normName(e.name))
  const s = q.trim().toLowerCase()
  let snippet: string | null = null
  if (s && !e.name.toLowerCase().includes(s)) {
    const text = (e.lore ?? []).join(' ')
    const i = text.toLowerCase().indexOf(s)
    if (i >= 0) snippet = `…${text.slice(Math.max(0, i - 40), i + 70)}…`
  }
  const name = e.name.replace(/^Ashes? of war:\s*/i, '')
  return (
    <Link to={`/compendio/${cat}/${e.id}`} className="item-card panel group flex flex-col overflow-hidden">
      <div className="relative grid aspect-[5/4] place-items-center overflow-hidden bg-gradient-to-b from-ink-800 to-ink-950">
        <div className="item-glow absolute inset-0 opacity-40 transition" style={{ background: 'radial-gradient(circle at 50% 45%, rgba(230,197,111,.22), transparent 62%)' }} />
        {e.image
          ? <img src={e.image} alt="" loading="lazy" className="relative h-[78%] w-[78%] object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,.85)] transition duration-300 group-hover:scale-105" />
          : <div className="font-display text-3xl text-gold-500/40">{name.slice(0, 2)}</div>}
        <div className="absolute left-2 top-2 flex gap-1">
          {e.dlc && <Badge color="#d98a4a">DLC</Badge>}
          {used && <Badge color="#e6c56f">Build</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="line-clamp-2 font-display text-[15px] leading-snug text-parch-100">{name}</div>
        <div className="mt-0.5 truncate text-[11px] text-parch-400">{e.category || e.type || e.affinity || CATEGORY_META[cat].label}</div>
        {snippet ? <p className="font-lore mt-2 line-clamp-3 text-[13px] italic text-parch-300">{snippet}</p>
          : e.effect ? <p className="mt-2 line-clamp-2 text-xs text-gold-300/90">{e.effect}</p>
            : e.lore?.[0] ? <p className="font-lore mt-2 line-clamp-2 text-[13px] italic text-parch-400">{e.lore[0]}</p> : null}
        {e.requires && Object.values(e.requires).some(Boolean) && (
          <div className="mt-auto flex flex-wrap gap-1 pt-2">
            {Object.entries(e.requires).filter(([, v]) => v).map(([k, v]) => {
              const sk = statKey(k)
              return <span key={k} className="rounded bg-white/[.04] px-1.5 py-0.5 text-[10px] tabular-nums" style={{ color: sk ? STAT_META[sk].color : undefined }}>{sk ? STAT_META[sk].short : k} {v}</span>
            })}
          </div>
        )}
      </div>
    </Link>
  )
}

function ListRow({ e, cat, odd }: { e: CompendiumEntry; cat: CompendiumCat; odd: boolean }) {
  return (
    <Link to={`/compendio/${cat}/${e.id}`} className={cx('flex items-center gap-3 px-3 py-2 transition hover:bg-gold-500/5', odd && 'bg-white/[.015]')}>
      <ItemThumb src={e.image} alt={e.name} size={42} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-parch-100">{e.name}</div>
        <div className="truncate text-xs text-parch-400">{e.effect || e.category || e.type}</div>
      </div>
      {e.dlc && <Badge color="#d98a4a">DLC</Badge>}
      {e.weight != null && <span className="hidden w-14 text-right text-xs tabular-nums text-parch-400 sm:block">{e.weight}</span>}
    </Link>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cx('flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition',
      on ? 'border-gold-500/50 bg-gold-500/15 text-gold-300' : 'border-white/10 text-parch-300 hover:bg-white/5')}>{children}</button>
  )
}
