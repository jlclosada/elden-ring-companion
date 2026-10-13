import { Link, useNavigate } from 'react-router-dom'
import { Plus, ArrowRight, Trash2, Map as MapIcon, Swords, BookOpen, Download, Upload, Skull } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { useRuns, useActiveRun, downloadBackup } from '../store/runs'
import { bossProgress } from '../data/bosses'
import { BUILDS, BUILD_BY_ID } from '../data/builds'
import { CLASS_BY_ID } from '../data/classes'
import { PHASES } from '../data/regions'
import { buildTasks, currentPhase, progressStats, recommend } from '../lib/plan'
import { buildGuide, currentStep, CHAPTER_BY_ID } from '../lib/guide'
import { Button, ICONS, Panel, ProgressBar, ProgressRing, SectionTitle, cx } from '../components/ui'
import { TaskRow } from '../components/TaskRow'
import summary from '../data/generated/summary.json'

export function HomePage() {
  const { runs, activeId, setActive, deleteRun } = useRuns()
  const { run, build, tasks } = useActiveRun()
  const nav = useNavigate()
  const recs = useMemo(() => (run ? recommend(run, tasks, 3) : []), [run, tasks])
  const guideSteps = useMemo(() => (run ? buildGuide(run.buildId, run.classId, Boolean(run.dlcEnabled)) : []), [run])
  const guideStep = run ? currentStep(run, guideSteps) : null
  const prog = run ? progressStats(run, tasks) : null
  const phase = run ? PHASES[currentPhase(run, tasks)] : null
  const totalItems = Object.values(summary.counts).reduce((a, b) => a + b, 0)
  const fileRef = useRef<HTMLInputElement>(null)

  const onImport = async (file: File) => {
    let data: unknown
    try { data = JSON.parse(await file.text()) } catch { alert('El archivo no es un JSON válido.'); return }
    const replace = runs.length > 0 && confirm('¿Sustituir todas tus partidas por las de la copia?\n\nAceptar: sustituir · Cancelar: fusionar (se conserva la versión más reciente de cada partida)')
    const n = useRuns.getState().importBackup(data, replace ? 'replace' : 'merge')
    alert(n < 0 ? 'No se ha reconocido la copia de seguridad.' : `Importadas ${n} partida${n === 1 ? '' : 's'}.`)
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5">
        <div className="absolute inset-0 opacity-70">
          <img src="/tiles/surface-preview.webp" alt="" className="h-full w-full object-cover object-[60%_45%]" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/20" />
        <div className="relative max-w-xl p-7 sm:p-10 lg:p-14">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">Asistente para Sinluz</div>
          <h1 className="font-display text-4xl font-semibold leading-tight text-gold-gradient sm:text-5xl">Sigue la guía de la gracia</h1>
          <p className="mt-4 text-parch-200">
            Elige una build y el asistente genera tu roadmap: qué hacer primero, dónde está cada pieza de equipo y el
            mejor orden para recorrer las Tierras Intermedias y el Reino de las Sombras. Mapa interactivo, checklist y {totalItems.toLocaleString('es')} objetos catalogados, incluido Shadow of the Erdtree.
          </p>
          <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
            <Button size="lg" to="/nueva"><Plus size={18} />Nueva partida</Button>
            {run && <Button size="lg" variant="outline" to="/partida">Continuar<ArrowRight size={18} /></Button>}
          </div>
        </div>
      </section>

      {/* Partida activa */}
      {run && build && prog && phase && (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <Panel className="p-6">
            <div className="flex items-center gap-5">
              <ProgressRing value={prog.pct} sub="completado" />
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.2em] text-parch-400">Partida activa</div>
                <h2 className="truncate font-display text-2xl text-parch-100">{run.name}</h2>
                <div className="text-sm text-parch-300">{build.name} · {CLASS_BY_ID[run.classId].nameEs} · Nivel {run.level}</div>
              </div>
            </div>
            <div className="divider-ornament my-5" />
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Fase" value={phase.short} />
              <Stat label="Camino" value={`${prog.mainDone}/${prog.main}`} />
              <Stat label="Build" value={`${prog.buildDone}/${prog.build}`} />
            </div>
            <div className="mt-5 text-sm text-parch-300">{phase.summary}</div>
          </Panel>
          <div>
            <SectionTitle right={<Link to="/partida" className="text-sm text-gold-400 hover:underline">Abrir la guía</Link>}>Tu siguiente paso</SectionTitle>
            {guideStep ? (
              <Link to="/partida" className="panel panel-hover block p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500">{CHAPTER_BY_ID[guideStep.chapter].name}</div>
                <div className="mt-1 font-display text-xl text-parch-100">{guideStep.title}</div>
                <p className="mt-2 line-clamp-2 text-sm text-parch-300">{guideStep.how[0]}</p>
                <div className="mt-3 text-xs text-parch-400">Paso {guideStep.index + 1} de {guideSteps.length}</div>
              </Link>
            ) : (
              <div className="space-y-2">
                {recs.map((r, i) => <TaskRow key={r.task.id} task={r.task} reasons={r.reasons.slice(0, 2)} warning={r.warning} index={i} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Partidas */}
      <section>
          <SectionTitle right={
            <div className="flex gap-1">
              {runs.length > 0 && <button onClick={downloadBackup} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-parch-300 hover:bg-white/5 hover:text-gold-300" title="Descargar todas las partidas en un archivo"><Download size={13} />Copia de seguridad</button>}
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-parch-300 hover:bg-white/5 hover:text-gold-300" title="Cargar partidas desde un archivo"><Upload size={13} />Importar</button>
              <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = '' }} />
            </div>
          }>Tus partidas</SectionTitle>
          {runs.length === 0 && <p className="text-sm text-parch-400">Aún no tienes partidas. Puedes llevar varias a la vez: el progreso de cada una se guarda automáticamente en este navegador.</p>}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {runs.map((r) => {
              const b = BUILD_BY_ID[r.buildId]
              const p = progressStats(r, buildTasks(b, r.setupEnabled, r.dlcEnabled))
              const bp = bossProgress(r.done, r.dlcEnabled)
              const Icon = ICONS[b?.icon ?? 'Sword']
              return (
                <Panel key={r.id} hover className={cx('relative p-4', r.id === activeId && 'ring-1 ring-gold-500/40')}>
                  <button className="absolute inset-0" onClick={() => { setActive(r.id); nav('/partida') }} aria-label={`Abrir ${r.name}`} />
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-lg" style={{ background: `${b?.accent}22`, color: b?.accent }}><Icon size={20} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-parch-100">{r.name}</div>
                      <div className="truncate text-xs text-parch-400">{b?.name} · Nv {r.level}</div>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-parch-400"><Skull size={11} />{bp.killed}/{bp.total} jefes · {Math.round(p.pct * 100)}% tareas</div>
                    </div>
                    <button className="relative z-10 rounded p-1.5 text-parch-400 hover:bg-white/5 hover:text-blood-500"
                      onClick={() => confirm(`¿Borrar la partida "${r.name}"?`) && deleteRun(r.id)} aria-label="Borrar partida"><Trash2 size={15} /></button>
                  </div>
                  <ProgressBar value={p.pct} className="mt-4" color={b?.accent} />
                </Panel>
              )
            })}
          </div>
      </section>

      {/* Accesos */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { to: '/mapa', icon: MapIcon, title: 'Mapa interactivo', text: 'Regiones, jefes, mazmorras, mejoras y la ubicación de cada pieza de build.' },
          { to: '/builds', icon: Swords, title: `${BUILDS.length} builds curadas`, text: 'Con estadísticas por nivel, equipo, dónde conseguirlo y ruta de preparación.' },
          { to: '/compendio', icon: BookOpen, title: 'Compendio completo', text: 'Armas, talismanes, hechizos, cenizas… con requisitos y cómo obtenerlos.' },
        ].map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="panel panel-hover block p-5">
            <Icon className="text-gold-400" size={22} />
            <div className="mt-3 font-display text-lg text-parch-100">{title}</div>
            <p className="mt-1 text-sm text-parch-300">{text}</p>
          </Link>
        ))}
      </section>

      {/* Builds destacadas */}
      <section>
        <SectionTitle right={<Link to="/builds" className="text-sm text-gold-400 hover:underline">Todas</Link>}>Elige tu camino</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
          {BUILDS.slice(0, 4).map((b) => {
            const Icon = ICONS[b.icon]
            return (
              <Link key={b.id} to={`/builds/${b.id}`} className="panel panel-hover group relative block overflow-hidden p-5">
                <div className="absolute -right-6 -top-6 size-28 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40" style={{ background: b.accent }} />
                <Icon size={22} style={{ color: b.accent }} />
                <div className="mt-3 font-display text-lg text-parch-100">{b.name}</div>
                <div className="text-xs uppercase tracking-wider text-parch-400">{b.subtitle}</div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[.03] py-2">
      <div className="text-[10px] uppercase tracking-wider text-parch-400">{label}</div>
      <div className="font-display text-base text-parch-100">{value}</div>
    </div>
  )
}
