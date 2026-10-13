import { useMemo, useState, type ReactNode } from 'react'
import { Search, Skull, Crown, Sun } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useActiveRun, useRuns } from '../store/runs'
import { BOSS_KIND, bossKey, bossesForRun, type Boss, type BossKind } from '../data/bosses'
import { REGIONS, REGION_BY_ID } from '../data/regions'
import { Badge, Check, Panel, ProgressBar, ProgressRing, SectionTitle, cx } from './ui'

type Filter = 'all' | BossKind
const KINDS = Object.keys(BOSS_KIND) as BossKind[]
const dateFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })

export function BossChecklist() {
  const { run } = useActiveRun()
  const toggle = useRuns((s) => s.toggleTask)
  // ?jefe=… llega desde el buscador global
  const [params] = useSearchParams()
  const [q, setQ] = useState(() => params.get('jefe') ?? '')
  const [kind, setKind] = useState<Filter>('all')
  const [hideDone, setHideDone] = useState(false)
  const [onlyRequired, setOnlyRequired] = useState(false)

  const all = useMemo(() => bossesForRun(run?.dlcEnabled), [run?.dlcEnabled])
  if (!run) return null
  const isKilled = (b: Boss) => Boolean(run.done[bossKey(b)])

  const needle = q.trim().toLowerCase()
  const filtered = all.filter((b) => {
    if (kind !== 'all' && b.kind !== kind) return false
    if (onlyRequired && !b.required) return false
    if (hideDone && isKilled(b)) return false
    if (needle && !`${b.name} ${b.en} ${b.place} ${REGION_BY_ID[b.region]?.nameEs ?? ''}`.toLowerCase().includes(needle)) return false
    return true
  })
  // Regiones en orden de progresión, el DLC al final
  const regions = REGIONS.filter((r) => filtered.some((b) => b.region === r.id))
    .sort((a, z) => Number(a.layer === 'shadow') - Number(z.layer === 'shadow') || a.phase - z.phase)

  const killed = all.filter(isKilled).length
  const remembrances = all.filter((b) => b.kind === 'remembrance')
  const required = all.filter((b) => b.required)
  const base = all.filter((b) => !b.dlc), dlc = all.filter((b) => b.dlc)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
        <Panel className="flex items-center gap-5 p-5">
          <ProgressRing value={all.length ? killed / all.length : 0} label={<span className="font-display text-xl">{killed}</span>} sub={`de ${all.length}`} />
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-parch-400">Jefes derrotados</div>
            <div className="font-display text-2xl text-parch-100">{Math.round((killed / Math.max(1, all.length)) * 100)}%</div>
            <p className="mt-1 max-w-56 text-xs text-parch-400">Los jefes que también son pasos de la guía se marcan en ambos sitios.</p>
          </div>
        </Panel>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
          <Summary icon={<Crown size={16} />} label="Remembranzas" done={remembrances.filter(isKilled).length} total={remembrances.length} />
          <Summary icon={<Skull size={16} />} label="Obligatorios" done={required.filter(isKilled).length} total={required.length} />
          <Summary label="Juego base" done={base.filter(isKilled).length} total={base.length} />
          {run.dlcEnabled
            ? <Summary icon={<Sun size={16} />} label="Shadow of the Erdtree" done={dlc.filter(isKilled).length} total={dlc.length} color="#d98a4a" />
            : <Panel className="grid place-items-center p-4 text-center text-xs text-parch-400">Activa el DLC en la partida para añadir sus jefes.</Panel>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-parch-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar jefe o lugar (también en inglés)…"
            className="h-10 w-full rounded-lg border border-white/10 bg-ink-900 pl-9 pr-3 text-sm text-parch-100 outline-none placeholder:text-parch-400 focus:border-gold-500/60" />
        </div>
        <select value={kind} onChange={(e) => setKind(e.target.value as Filter)} className="h-10 rounded-lg border border-white/10 bg-ink-900 px-3 text-sm text-parch-200" aria-label="Filtrar por tipo de jefe">
          <option value="all">Todos los tipos</option>
          {KINDS.map((k) => <option key={k} value={k}>{BOSS_KIND[k].label}</option>)}
        </select>
        <Toggle on={onlyRequired} onClick={() => setOnlyRequired((v) => !v)}>Solo obligatorios</Toggle>
        <Toggle on={hideDone} onClick={() => setHideDone((v) => !v)}>Ocultar derrotados</Toggle>
      </div>

      <div className="space-y-8">
        {regions.map((r) => {
          const items = filtered.filter((b) => b.region === r.id)
          const inRegion = all.filter((b) => b.region === r.id)
          const d = inRegion.filter(isKilled).length
          return (
            <section key={r.id}>
              <SectionTitle right={<span className="flex items-center gap-2 text-xs text-parch-400">{d}/{inRegion.length}<ProgressBar value={d / inRegion.length} className="w-20" color={r.color} /></span>}>
                <span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: r.color }} />{r.nameEs}{r.layer === 'shadow' && <Badge color="#d98a4a">DLC</Badge>}</span>
              </SectionTitle>
              <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
                {items.map((b) => {
                  const at = run.done[bossKey(b)] as number | undefined
                  const k = BOSS_KIND[b.kind]
                  return (
                    <div key={b.id} className={cx('flex items-start gap-3 rounded-xl border border-white/5 bg-white/[.02] p-3 transition hover:border-white/10', Boolean(at) && 'opacity-55')}>
                      <Check checked={Boolean(at)} onChange={() => toggle(bossKey(b))} label={b.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className={cx('text-sm font-medium text-parch-100', Boolean(at) && 'line-through decoration-parch-400')}>{b.name}</span>
                          <Badge color={k.color}>{k.label}</Badge>
                          {b.required && <Badge color="#e6c56f">Obligatorio</Badge>}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-parch-400">
                          <span>{b.place}</span>
                          <span className="italic text-parch-400/70">{b.en}</span>
                          {at && <span className="text-gold-500/90">Derrotado el {dateFmt.format(at)}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
        {regions.length === 0 && <Panel className="p-8 text-center text-sm text-parch-300">Ningún jefe coincide con estos filtros.</Panel>}
      </div>
    </div>
  )
}

function Summary({ icon, label, done, total, color }: { icon?: ReactNode; label: string; done: number; total: number; color?: string }) {
  return (
    <Panel className="p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-parch-400">{icon}{label}</div>
      <div className="mt-1 font-display text-xl text-parch-100">{done}<span className="text-sm text-parch-400"> / {total}</span></div>
      <ProgressBar value={total ? done / total : 0} className="mt-2" color={color} />
    </Panel>
  )
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={on} className={cx('h-10 rounded-lg border px-3 text-sm', on ? 'border-gold-500/50 bg-gold-500/10 text-gold-300' : 'border-white/10 text-parch-300')}>
      {children}
    </button>
  )
}
