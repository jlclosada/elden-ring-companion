import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, Route as RouteIcon, Eye, EyeOff, Check, MapPin, Info, BookOpen, SlidersHorizontal, PanelLeftClose } from 'lucide-react'
import type { Layer } from '../data/types'
import { REGION_BY_ID } from '../data/regions'
import { useActiveRun, useFound, useRuns } from '../store/runs'
import { isDone, recommend } from '../lib/plan'
import { CATS, GROUP_ORDER, LAYER_LABEL, markerIdForLocation, useMapData, type MapMarker } from '../lib/mapData'
import { normName } from '../lib/compendium'
import { GameMap } from '../components/GameMap'
import { CatIcon } from '../components/CatIcon'
import { Badge, ProgressBar, cx } from '../components/ui'
import { TaskRow } from '../components/TaskRow'
import { ItemThumb, RefDetail } from '../components/ItemCard'

const LAYERS: Layer[] = ['surface', 'underground', 'shadow']
const LAYER_SHORT: Record<Layer, string> = { surface: 'Superficie', underground: 'Subsuelo', shadow: 'Sombras' }
const STORAGE_KEY = 'sendero-map-cats'

function loadCats(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch { /* sin almacenamiento */ }
  return new Set(Object.entries(CATS).filter(([, m]) => m.defaultOn).map(([k]) => k))
}

const PANEL_KEY = 'sendero-map-panel'
const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
function loadPanel(): boolean {
  if (!isDesktop()) return false
  try { return localStorage.getItem(PANEL_KEY) !== '0' } catch { return true }
}

export default function MapPage() {
  const data = useMapData()
  const [panelOpen, setPanelOpen] = useState(loadPanel)
  useEffect(() => { if (isDesktop()) try { localStorage.setItem(PANEL_KEY, panelOpen ? '1' : '0') } catch { /* sin almacenamiento */ } }, [panelOpen])
  const [params, setParams] = useSearchParams()
  const { run, build, tasks } = useActiveRun()
  const markedFound = useFound()
  const toggleFound = useRuns((s) => s.toggleFound)
  const toggleTask = useRuns((s) => s.toggleTask)
  // Los jefes derrotados en la checklist de la partida cuentan como encontrados en el mapa
  const found = useMemo(() => {
    if (!data || !run) return markedFound
    const f: Record<string, number> = { ...markedFound }
    for (const m of data.markers) if (m.bossKey && run.done[m.bossKey]) f[m.id] = run.done[m.bossKey]
    return f
  }, [data, run, markedFound])

  const [layer, setLayer] = useState<Layer>((params.get('layer') as Layer) || 'surface')
  const [cats, setCats] = useState<Set<string>>(loadCats)
  const [hideFound, setHideFound] = useState(false)
  const [showRoute, setShowRoute] = useState(params.get('ruta') === '1')
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [detail, setDetail] = useState(false)

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...cats])) } catch { /* ignore */ } }, [cats])

  const byId = useMemo(() => new Map((data?.markers ?? []).map((m) => [m.id, m])), [data])

  // Deep links: ?loc=<lugar de la app> o ?m=<marcador>
  const locParam = params.get('loc')
  const mParam = params.get('m')
  useEffect(() => {
    if (!data) return
    const mid = mParam ?? (locParam ? markerIdForLocation(locParam) : null)
    const mk = mid ? byId.get(mid) : undefined
    if (!mk) return
    setLayer(mk.layer)
    setSelectedId(mk.id)
    setFocusId(mk.id)
    setCats((c) => (c.has(mk.cat) ? c : new Set([...c, mk.cat])))
  }, [data, locParam]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lugares con tareas pendientes de la partida → anillo dorado
  const { highlight, tasksByMarker } = useMemo(() => {
    const hl = new Set<string>()
    const tbm = new Map<string, typeof tasks>()
    for (const t of tasks) {
      if (!t.location) continue
      const mid = markerIdForLocation(t.location)
      if (!mid) continue
      if (!tbm.has(mid)) tbm.set(mid, [])
      tbm.get(mid)!.push(t)
      if (run && !isDone(run, t.id) && (t.group === 'Equipo de la build' || t.group === 'Preparación' || t.kind === 'main')) hl.add(mid)
    }
    if (build && data) {
      const gear = new Set(build.gear.map((g) => normName(g.name)))
      for (const m of data.markers) if (m.ref && gear.has(normName(m.ref.name)) && !found[m.id]) hl.add(m.id)
    }
    return { highlight: hl, tasksByMarker: tbm }
  }, [tasks, run, build, data, found])

  const route = useMemo(() => {
    if (!run || !showRoute) return []
    return recommend(run, tasks, 14).map((r) => (r.task.location ? markerIdForLocation(r.task.location) : null))
      .filter((x, i, a): x is string => !!x && a.indexOf(x) === i && byId.get(x)?.layer === layer).slice(0, 8)
  }, [run, tasks, showRoute, layer, byId])

  const layerMarkers = useMemo(() => (data?.markers ?? []).filter((m) => m.layer === layer), [data, layer])
  const visible = useMemo(() => layerMarkers.filter((m) =>
    m.id === selectedId || route.includes(m.id) ||
    ((cats.has(m.cat) || (highlight.has(m.id) && cats.has('task'))) && !(hideFound && found[m.id]))
  ), [layerMarkers, cats, hideFound, found, selectedId, route, highlight])

  const counts = useMemo(() => {
    const c: Record<string, { total: number; found: number }> = {}
    for (const m of layerMarkers) { c[m.cat] ??= { total: 0, found: 0 }; c[m.cat].total++; if (found[m.id]) c[m.cat].found++ }
    return c
  }, [layerMarkers, found])
  const trackable = layerMarkers.filter((m) => m.cat !== 'task')
  const foundLayer = trackable.filter((m) => found[m.id]).length

  const results = useMemo(() => {
    if (!q.trim() || !data) return []
    const s = q.toLowerCase()
    return data.markers.filter((m) => m.name.toLowerCase().includes(s) || (m.near ?? '').toLowerCase().includes(s))
      .sort((a, b) => Number(b.layer === layer) - Number(a.layer === layer)).slice(0, 12)
  }, [q, data, layer])

  const select = (m: MapMarker | null) => {
    setSelectedId(m?.id ?? null)
    setDetail(false)
    const next = new URLSearchParams(params)
    next.delete('loc')
    if (m) next.set('m', m.id); else next.delete('m')
    next.set('layer', m?.layer ?? layer)
    setParams(next, { replace: true })
  }
  const goTo = (m: MapMarker) => {
    setLayer(m.layer)
    setCats((c) => (c.has(m.cat) ? c : new Set([...c, m.cat])))
    select(m)
    setFocusId(null)
    requestAnimationFrame(() => setFocusId(m.id))
    setQ('')
  }
  const switchLayer = (l: Layer) => { setLayer(l); setSelectedId(null); setParams({ layer: l }, { replace: true }) }
  const toggleCat = (c: string) => setCats((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n })
  const sel = selectedId ? byId.get(selectedId) : null

  if (!data) return <div className="grid h-full place-items-center text-sm text-parch-400">Desplegando el mapa…</div>

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* ───── Panel de capas y filtros (plegable; en móvil se superpone al mapa) ───── */}
      {panelOpen && <div className="absolute inset-0 z-[590] bg-black/40 lg:hidden" onClick={() => setPanelOpen(false)} />}
      <aside className={cx('scrollbar-thin overflow-y-auto border-r border-white/5 bg-ink-950/95 backdrop-blur',
        panelOpen ? 'absolute inset-y-0 left-0 z-[600] w-[min(340px,88vw)] shadow-2xl lg:static lg:z-auto lg:w-[340px] lg:shrink-0 lg:shadow-none' : 'hidden')}>
        <div className="sticky top-0 z-10 space-y-3 border-b border-white/5 bg-ink-950/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-lg text-parch-100">Mapa</h1>
            <button onClick={() => setPanelOpen(false)} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-parch-400 hover:bg-white/5 hover:text-parch-100" aria-label="Ocultar panel">
              <PanelLeftClose size={15} />Ocultar
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-white/[.04] p-1">
            {LAYERS.map((l) => (
              <button key={l} onClick={() => switchLayer(l)}
                className={cx('rounded-md px-1 py-2 text-[11px] font-semibold leading-tight', layer === l ? 'bg-gold-500/20 text-gold-300' : 'text-parch-300 hover:text-parch-100')}>
                {LAYER_LABEL[l]}{l === 'shadow' && <span className="block text-[9px] font-normal text-[#d98a4a]">DLC</span>}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-parch-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar lugar, jefe u objeto…"
              className="h-10 w-full rounded-lg border border-white/10 bg-ink-900 pl-9 pr-8 text-sm text-parch-100 outline-none placeholder:text-parch-400 focus:border-gold-500/60" />
            {q && <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-parch-400" aria-label="Limpiar búsqueda"><X size={14} /></button>}
            {results.length > 0 && (
              <div className="panel absolute inset-x-0 top-11 z-20 max-h-80 overflow-y-auto p-1 shadow-2xl">
                {results.map((m) => (
                  <button key={m.id} onClick={() => goTo(m)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/5">
                    <CatIcon cat={m.cat} size={20} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-parch-100">{m.name}</span>
                      <span className="block truncate text-[11px] text-parch-400">{CATS[m.cat]?.label}{m.near ? ` · ${m.near}` : ''} · {LAYER_LABEL[m.layer]}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="flex justify-between text-xs text-parch-400"><span>Encontrado en {LAYER_LABEL[layer]}</span><span className="tabular-nums">{foundLayer}/{trackable.length}</span></div>
            <ProgressBar value={trackable.length ? foundLayer / trackable.length : 0} className="mt-1" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip on={hideFound} onClick={() => setHideFound((h) => !h)} icon={hideFound ? <EyeOff size={13} /> : <Eye size={13} />}>Ocultar encontrados</Chip>
            {run && <Chip on={showRoute} onClick={() => setShowRoute((s) => !s)} icon={<RouteIcon size={13} />}>Ruta recomendada</Chip>}
            <Chip on={false} onClick={() => setCats(new Set(Object.keys(CATS)))}>Mostrar todo</Chip>
            <Chip on={false} onClick={() => setCats(new Set())}>Ocultar todo</Chip>
          </div>
        </div>

        <div className="space-y-5 p-4">
          {GROUP_ORDER.map((g) => {
            const list = Object.entries(CATS).filter(([k, m]) => m.group === g && counts[k]?.total)
            if (!list.length) return null
            return (
              <section key={g}>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-parch-400">{g}</h3>
                <div className="space-y-0.5">
                  {list.map(([k, m]) => {
                    const c = counts[k]
                    const on = cats.has(k)
                    return (
                      <button key={k} onClick={() => toggleCat(k)} aria-pressed={on}
                        className={cx('flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition', on ? 'hover:bg-white/5' : 'opacity-40 hover:opacity-70')}>
                        <CatIcon cat={k} size={22} />
                        <span className="flex-1 text-sm text-parch-100">{m.label}</span>
                        <span className="text-[11px] tabular-nums text-parch-400">{k !== 'task' && c.found ? `${c.found}/` : ''}{c.total}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}
          <p className="text-[11px] leading-relaxed text-parch-400">
            El equipo y los objetos aparecen al acercar el zoom. Un borde discontinuo indica ubicación aproximada: el objeto se obtiene en ese lugar o junto a él.
            {run ? ' Los anillos dorados señalan lo pendiente de tu partida.' : ''}
          </p>
        </div>
      </aside>

      {/* ───── Mapa a pantalla completa ───── */}
      <div className="relative h-full min-w-0 flex-1">
        <GameMap layer={layer} meta={data.layers[layer]} markers={visible} found={found} highlight={highlight} route={route}
          selectedId={selectedId} onSelect={select} focusId={focusId} className="h-full w-full" />

        {!panelOpen && (
          <div className="absolute left-3 right-14 top-3 z-[550] flex flex-wrap items-center gap-2">
            <button onClick={() => setPanelOpen(true)}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-ink-950/90 px-3 text-sm font-medium text-parch-100 shadow-xl backdrop-blur hover:border-gold-500/40">
              <SlidersHorizontal size={16} className="text-gold-400" /><span className="sm:hidden">Filtros</span><span className="hidden sm:inline">Capas y filtros</span>
            </button>
            <div className="flex overflow-hidden rounded-xl border border-white/10 bg-ink-950/90 shadow-xl backdrop-blur">
              {LAYERS.map((l) => (
                <button key={l} onClick={() => switchLayer(l)}
                  className={cx('h-10 whitespace-nowrap px-2.5 text-xs font-semibold sm:px-3', layer === l ? 'bg-gold-500/20 text-gold-300' : 'text-parch-300 hover:text-parch-100')}>
                  <span className="sm:hidden">{LAYER_SHORT[l]}</span><span className="hidden sm:inline">{LAYER_LABEL[l]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {sel && (
          <div className="panel rise absolute inset-x-3 bottom-3 z-[500] max-h-[60%] overflow-y-auto p-4 shadow-2xl sm:bottom-auto sm:left-auto sm:right-16 sm:top-3 sm:max-h-[calc(100%-1.5rem)] sm:w-[360px]">
            <div className="flex items-start gap-3">
              {sel.ref ? <ItemThumb src={sel.image} alt={sel.name} size={56} /> : <CatIcon cat={sel.cat} size={40} />}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: CATS[sel.cat]?.color }}>{CATS[sel.cat]?.label}</div>
                <h2 className="font-display text-lg leading-tight text-parch-100">{sel.name}</h2>
                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-parch-400">
                  {sel.region && REGION_BY_ID[sel.region] ? `${REGION_BY_ID[sel.region].nameEs} · ` : ''}{LAYER_LABEL[sel.layer]}
                  {sel.dlc && <Badge color="#d98a4a">DLC</Badge>}
                </div>
              </div>
              <button onClick={() => select(null)} className="rounded p-1 text-parch-400 hover:bg-white/5 hover:text-parch-100" aria-label="Cerrar"><X size={16} /></button>
            </div>

            {sel.approx && (
              <div className="mt-3 flex gap-2 rounded-lg bg-white/[.04] p-2.5 text-xs text-parch-300">
                <Info size={14} className="mt-0.5 shrink-0 text-gold-400" />
                <span>Ubicación aproximada{sel.near ? <> — se obtiene en <b className="text-parch-100">{sel.near}</b> o sus alrededores</> : ''}.</span>
              </div>
            )}
            {sel.desc && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-parch-200">{sel.desc}</p>}
            {sel.loot && sel.loot.length > 0 && (
              <div className="mt-3">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-parch-400">Recompensas</div>
                <div className="flex flex-wrap gap-1">{sel.loot.map((l) => <Badge key={l} color="#e6c56f">{l}</Badge>)}</div>
              </div>
            )}
            {tasksByMarker.get(sel.id)?.length ? (
              <div className="mt-4 space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-parch-400">Tareas de tu partida aquí</div>
                {tasksByMarker.get(sel.id)!.map((t) => <TaskRow key={t.id} task={t} compact />)}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {sel.bossKey && run ? (
                <button onClick={() => toggleTask(sel.bossKey!)}
                  className={cx('flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition', run.done[sel.bossKey] ? 'bg-moss-400/15 text-moss-400 ring-1 ring-moss-400/40' : 'bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950')}>
                  <Check size={15} />{run.done[sel.bossKey] ? 'Derrotado' : 'Marcar como derrotado'}
                </button>
              ) : sel.cat !== 'task' && (
                <button onClick={() => toggleFound(sel.id)}
                  className={cx('flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition', found[sel.id] ? 'bg-moss-400/15 text-moss-400 ring-1 ring-moss-400/40' : 'bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950')}>
                  <Check size={15} />{found[sel.id] ? 'Encontrado' : 'Marcar como encontrado'}
                </button>
              )}
              {sel.ref && (
                <button onClick={() => setDetail(true)} className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-parch-200 hover:bg-white/5">
                  <BookOpen size={14} />Ficha
                </button>
              )}
              {sel.near && sel.approx && (
                <button onClick={() => { const p = data.markers.find((m) => m.name === sel.near && m.layer === sel.layer && !m.ref); if (p) goTo(p) }}
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-parch-200 hover:bg-white/5">
                  <MapPin size={14} />Ir al lugar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {detail && sel?.ref && <RefDetail cat={sel.ref.cat} name={sel.ref.name} onClose={() => setDetail(false)} stats={run?.stats} />}
    </div>
  )
}

function Chip({ on, onClick, children, icon }: { on: boolean; onClick: () => void; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cx('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition', on ? 'border-gold-500/50 bg-gold-500/10 text-gold-300' : 'border-white/10 text-parch-300 hover:bg-white/5')}>
      {icon}{children}
    </button>
  )
}
