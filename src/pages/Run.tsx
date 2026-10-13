import { Fragment, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Compass, Plus, Search, MapPin, Sparkles, RotateCcw, Sun } from 'lucide-react'
import { useActiveRun, useRuns } from '../store/runs'
import { CLASS_BY_ID } from '../data/classes'
import { LOCATION_BY_ID } from '../data/locations'
import { PHASES, REGION_BY_ID } from '../data/regions'
import type { ChecklistGroup, Task } from '../data/types'
import { currentPhase, dlcPhase, isDone, progressStats, recommend } from '../lib/plan'
import { SCADU_TARGETS } from '../data/dlc'
import { recommendedUpgrade } from '../lib/stats'
import { Badge, Button, Empty, ICONS, PageHeader, Panel, ProgressBar, SectionTitle, Tabs, cx } from '../components/ui'
import { TaskRow } from '../components/TaskRow'
import { MiniMap } from '../components/MiniMap'
import { GuideView } from '../components/GuideView'
import { StatEditor } from '../components/StatEditor'
import { BossChecklist } from '../components/BossChecklist'
import { bossProgress } from '../data/bosses'
import { RunSwitcher } from '../components/RunSwitcher'
import { RunJournal } from '../components/RunJournal'

type Tab = 'guide' | 'next' | 'roadmap' | 'checklist' | 'bosses' | 'journal' | 'stats'

const GROUP_ORDER: ChecklistGroup[] = ['Preparación', 'Camino principal', 'Equipo de la build', 'Mejoras de frasco', 'Mejora de armas', 'Cenizas de espíritu', 'Llaves y accesos', 'Shadow of the Erdtree', 'Bendición del Árbol Umbrío', 'Jefes opcionales', 'Mapas']

export default function RunPage() {
  const { run, build, tasks } = useActiveRun()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'guide'
  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true })

  if (!run || !build) {
    return (
      <Empty icon={<Compass size={36} />} title="No hay ninguna partida activa" action={<Button to="/nueva"><Plus size={16} />Nueva partida</Button>}>
        Crea una partida eligiendo una build y el asistente generará tu roadmap y checklist.
      </Empty>
    )
  }

  const prog = progressStats(run, tasks)
  const bosses = bossProgress(run.done, run.dlcEnabled)
  const Icon = ICONS[build.icon]
  const updateRun = useRuns.getState().updateRun

  return (
    <div>
      <PageHeader eyebrow={`${build.name} · ${CLASS_BY_ID[run.classId].nameEs}`} title={run.name}
        actions={<>
          <RunSwitcher />
          <Button variant={run.dlcEnabled ? 'outline' : 'ghost'} size="sm" onClick={() => updateRun({ dlcEnabled: !run.dlcEnabled })}
            title="Incluir Shadow of the Erdtree en el plan">
            <Sun size={14} className={run.dlcEnabled ? 'text-gold-400' : 'text-parch-400'} />DLC {run.dlcEnabled ? 'activado' : 'desactivado'}
          </Button>
          <Button variant="outline" size="sm" to={`/builds/${build.id}`}><Icon size={14} style={{ color: build.accent }} />Ver build</Button>
        </>}>
        {prog.done} de {prog.total} tareas completadas · {bosses.killed}/{bosses.total} jefes · Nivel {run.level}
      </PageHeader>
      <ProgressBar value={prog.pct} className="mb-6 h-2" />
      <div className="mb-6">
        <Tabs<Tab> value={tab} onChange={setTab} tabs={[
          { id: 'guide', label: 'Guía paso a paso' },
          { id: 'next', label: 'Recomendaciones' },
          { id: 'roadmap', label: 'Roadmap' },
          { id: 'checklist', label: 'Checklist', count: prog.total - prog.done },
          { id: 'bosses', label: 'Jefes', count: bosses.total - bosses.killed },
          { id: 'journal', label: 'Diario' },
          { id: 'stats', label: 'Estadísticas' },
        ]} />
      </div>
      {tab === 'guide' && <GuideView />}
      {tab === 'next' && <NextTab tasks={tasks} />}
      {tab === 'roadmap' && <RoadmapTab tasks={tasks} />}
      {tab === 'checklist' && <ChecklistTab tasks={tasks} />}
      {tab === 'bosses' && <BossChecklist />}
      {tab === 'journal' && <RunJournal tasks={tasks} />}
      {tab === 'stats' && <StatsTab />}
    </div>
  )
}

function NextTab({ tasks }: { tasks: Task[] }) {
  const { run, build } = useActiveRun()
  const updateRun = useRuns((s) => s.updateRun)
  const recs = useMemo(() => recommend(run!, tasks, 8), [run, tasks])
  const phase = PHASES[currentPhase(run!, tasks)]
  const up = recommendedUpgrade(run!.level)
  const route = recs.map((r) => r.task.location).filter((x, i, a): x is string => !!x && a.indexOf(x) === i).slice(0, 6)
  const dPhase = run!.dlcEnabled ? dlcPhase(run!, tasks) : null

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div>
        <SectionTitle right={run!.hiddenTasks?.length ? (
          <button onClick={() => updateRun({ hiddenTasks: [] })} className="flex items-center gap-1 text-xs text-parch-400 hover:text-gold-300"><RotateCcw size={12} />Restaurar ocultas ({run!.hiddenTasks.length})</button>
        ) : undefined}>
          <span className="flex items-center gap-2"><Sparkles size={18} className="text-gold-400" />Recomendaciones</span>
        </SectionTitle>
        <div className="space-y-2">
          {recs.map((r, i) => <TaskRow key={r.task.id} task={r.task} reasons={r.reasons.slice(0, 2)} warning={r.warning} index={i} />)}
          {recs.length === 0 && <Panel className="p-6 text-sm text-parch-300">No quedan tareas disponibles en esta fase. ¡Avanza en el camino principal!</Panel>}
        </div>
      </div>
      <div className="space-y-4">
        <Panel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-parch-400">Fase actual</div>
              <div className="font-display text-xl text-parch-100">{phase.name}</div>
            </div>
            <Badge color="#e6c56f">Nv {phase.levels[0]}–{phase.levels[1]}</Badge>
          </div>
          <p className="mt-2 text-sm text-parch-300">{phase.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/[.03] p-3"><div className="text-[10px] uppercase tracking-wider text-parch-400">Arma normal</div><div className="font-display text-lg text-parch-100">+{up.regular}</div></div>
            <div className="rounded-lg bg-white/[.03] p-3"><div className="text-[10px] uppercase tracking-wider text-parch-400">Arma sombría</div><div className="font-display text-lg text-parch-100">+{up.somber}</div></div>
          </div>
          {run!.level < phase.levels[0] && <p className="mt-3 text-xs text-[#e9a25b]">Tu nivel ({run!.level}) está por debajo del recomendado. Revisa la pestaña Estadísticas o farmea runas.</p>}
          {build?.affinity && <p className="mt-3 text-xs text-parch-400">Afinidad recomendada: <span className="text-parch-200">{build.affinity}</span></p>}
        </Panel>
        {dPhase !== null && (
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-parch-400">Shadow of the Erdtree</div>
                <div className="font-display text-xl text-parch-100">{PHASES[dPhase].name}</div>
              </div>
              <Sun className="text-gold-400" size={20} />
            </div>
            <p className="mt-2 text-sm text-parch-300">{PHASES[dPhase].summary}</p>
            <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-parch-400">Bendición recomendada</div>
            <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1 text-sm">
              <span className="text-[10px] uppercase text-parch-400">Jefe</span><span className="text-[10px] uppercase text-parch-400">Árbol Umbrío</span><span className="text-[10px] uppercase text-parch-400">Espíritu</span>
              {SCADU_TARGETS.map((t) => (<Fragment key={t.boss}><span className="text-parch-200">{t.boss}</span><span className="text-right text-gold-300">+{t.blessing}</span><span className="text-right text-parch-300">+{t.spirit}</span></Fragment>))}
            </div>
          </Panel>
        )}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-display text-parch-100">Ruta sugerida</span>
            <Link to="/mapa?ruta=1" className="text-xs text-gold-400 hover:underline">Abrir mapa</Link>
          </div>
          <MiniMap locations={route} route className="aspect-square" />
        </div>
      </div>
    </div>
  )
}

function RoadmapTab({ tasks }: { tasks: Task[] }) {
  const { run } = useActiveRun()
  const current = currentPhase(run!, tasks)
  const dCurrent = run!.dlcEnabled ? dlcPhase(run!, tasks) : null
  const [open, setOpen] = useState<number | null>(dCurrent ?? current)
  const phases = PHASES.filter((p) => p.id <= 10 || run!.dlcEnabled)

  return (
    <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-gradient-to-b before:from-gold-500/60 before:to-white/5">
      {phases.map((p) => {
        const pt = tasks.filter((t) => t.phase === p.id)
        const done = pt.filter((t) => isDone(run!, t.id)).length
        const pct = pt.length ? done / pt.length : 0
        const isCur = p.id === current || p.id === dCurrent
        const keyTasks = pt.filter((t) => t.kind === 'main' || t.group === 'Equipo de la build' || t.group === 'Preparación')
        const shown = open === p.id ? pt : keyTasks.slice(0, 4)
        return (
          <li key={p.id} className="relative pl-12">
            <span className={cx('absolute left-0 top-4 grid size-10 place-items-center rounded-full border font-display text-sm',
              pct === 1 ? 'border-gold-500 bg-gold-500 text-ink-950' : isCur ? 'border-gold-400 bg-ink-900 text-gold-300 shadow-glow' : 'border-white/10 bg-ink-900 text-parch-400')}>
              {p.id}
            </span>
            <Panel className={cx('p-5', isCur && 'ring-1 ring-gold-500/40')}>
              <button className="flex w-full flex-wrap items-center gap-3 text-left" onClick={() => setOpen(open === p.id ? null : p.id)}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg text-parch-100">{p.name}</h3>
                    {p.id >= 11 && <Badge color="#d98a4a">DLC</Badge>}
                    {isCur && <Badge color="#e6c56f">Estás aquí</Badge>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {p.regions.map((r) => <Badge key={r} color={REGION_BY_ID[r].color}>{REGION_BY_ID[r].nameEs}</Badge>)}
                    <span className="text-xs text-parch-400">Nv {p.levels[0]}–{p.levels[1]}</span>
                  </div>
                </div>
                <div className="w-32 text-right">
                  <div className="text-xs text-parch-400">{done}/{pt.length}</div>
                  <ProgressBar value={pct} className="mt-1" />
                </div>
              </button>
              <p className="mt-3 text-sm text-parch-300">{p.summary}</p>
              {shown.length > 0 && <div className="mt-4 space-y-2">{shown.map((t) => <TaskRow key={t.id} task={t} />)}</div>}
              {open !== p.id && pt.length > shown.length && (
                <button onClick={() => setOpen(p.id)} className="mt-3 text-xs text-gold-400 hover:underline">Ver las {pt.length} tareas de esta fase</button>
              )}
            </Panel>
          </li>
        )
      })}
    </ol>
  )
}

function ChecklistTab({ tasks }: { tasks: Task[] }) {
  const { run } = useActiveRun()
  const [q, setQ] = useState('')
  const [hideDone, setHideDone] = useState(false)
  const [group, setGroup] = useState<ChecklistGroup | 'all'>('all')
  const [region, setRegion] = useState<string>('all')

  const filtered = tasks.filter((t) => {
    if (hideDone && isDone(run!, t.id)) return false
    if (group !== 'all' && t.group !== group) return false
    if (region !== 'all' && (t.location ? LOCATION_BY_ID[t.location]?.region : '') !== region) return false
    if (q && !`${t.title} ${t.detail ?? ''} ${t.location ? LOCATION_BY_ID[t.location]?.name : ''}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })
  const groups = GROUP_ORDER.map((g) => ({ g, items: filtered.filter((t) => t.group === g).sort((a, b) => a.phase - b.phase) })).filter((x) => x.items.length)
  const regions = Array.from(new Set(tasks.map((t) => (t.location ? LOCATION_BY_ID[t.location]?.region : undefined)).filter(Boolean))) as string[]

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-parch-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar tarea, objeto o lugar…"
            className="h-10 w-full rounded-lg border border-white/10 bg-ink-900 pl-9 pr-3 text-sm text-parch-100 outline-none placeholder:text-parch-400 focus:border-gold-500/60" />
        </div>
        <select value={group} onChange={(e) => setGroup(e.target.value as ChecklistGroup | 'all')} className="h-10 rounded-lg border border-white/10 bg-ink-900 px-3 text-sm text-parch-200" aria-label="Filtrar por grupo">
          <option value="all">Todos los grupos</option>
          {GROUP_ORDER.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="h-10 rounded-lg border border-white/10 bg-ink-900 px-3 text-sm text-parch-200" aria-label="Filtrar por región">
          <option value="all">Todas las regiones</option>
          {regions.map((r) => <option key={r} value={r}>{REGION_BY_ID[r].nameEs}</option>)}
        </select>
        <button onClick={() => setHideDone((h) => !h)} className={cx('h-10 rounded-lg border px-3 text-sm', hideDone ? 'border-gold-500/50 bg-gold-500/10 text-gold-300' : 'border-white/10 text-parch-300')}>
          Ocultar completadas
        </button>
      </div>
      <div className="space-y-8">
        {groups.map(({ g, items }) => {
          const all = tasks.filter((t) => t.group === g)
          const d = all.filter((t) => isDone(run!, t.id)).length
          return (
            <section key={g}>
              <SectionTitle right={<span className="text-xs text-parch-400">{d}/{all.length}</span>}>{g}</SectionTitle>
              <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">{items.map((t) => <TaskRow key={t.id} task={t} />)}</div>
            </section>
          )
        })}
        {groups.length === 0 && <Panel className="p-8 text-center text-sm text-parch-300"><MapPin className="mx-auto mb-2 text-gold-400" />Nada que mostrar con estos filtros.</Panel>}
      </div>
    </div>
  )
}

function StatsTab() {
  const { run, build } = useActiveRun()
  const setStats = useRuns((s) => s.setStats)
  const base = CLASS_BY_ID[run!.classId].stats
  return (
    <div>
      <p className="mb-4 text-sm text-parch-300">Introduce tus estadísticas actuales del juego. El asistente usa tu nivel para ajustar la fase y avisarte de zonas peligrosas, y te dice qué atributo subir a continuación.</p>
      <StatEditor stats={run!.stats} base={base} onChange={setStats} build={build} classId={run!.classId} />
    </div>
  )
}
