import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Check as CheckIcon, ArrowLeft, ArrowRight, Wand2 } from 'lucide-react'
import { BUILDS, BUILD_BY_ID } from '../data/builds'
import { CLASSES, CLASS_BY_ID, STAT_KEYS, STAT_META } from '../data/classes'
import { useRuns } from '../store/runs'
import { checkpointStats, levelFromStats } from '../lib/stats'
import { Badge, Button, ICONS, PageHeader, Panel, cx } from '../components/ui'

const STEPS = ['Build', 'Clase', 'Preparación'] as const

export default function NewRunPage() {
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [buildId, setBuildId] = useState(params.get('build') ?? BUILDS[0].id)
  const build = BUILD_BY_ID[buildId]
  const [classId, setClassId] = useState(build.classes[0].id)
  const [setup, setSetup] = useState(true)
  const [dlc, setDlc] = useState(true)
  const [name, setName] = useState('')
  const create = useRuns((s) => s.createRun)
  const nav = useNavigate()

  // Clase más eficiente: la que menos niveles "desperdicia" para el primer checkpoint
  const ranked = useMemo(() => CLASSES.map((c) => {
    const target = checkpointStats(c.id, build.checkpoints[1]?.stats ?? build.checkpoints[0].stats)
    return { c, lvl: levelFromStats(target) }
  }).sort((a, b) => a.lvl - b.lvl), [build])
  const best = ranked[0].lvl

  const pickBuild = (id: string) => { setBuildId(id); setClassId(BUILD_BY_ID[id].classes[0].id) }
  const finish = () => {
    create({ name: name.trim() || `${build.name} · ${CLASS_BY_ID[classId].nameEs}`, buildId, classId, setupEnabled: setup, dlcEnabled: dlc })
    nav('/partida')
  }

  return (
    <div>
      <PageHeader eyebrow="Nueva partida" title="Prepara a tu Sinluz">
        El asistente adapta la checklist, las recomendaciones y la ruta del mapa a la build que elijas.
      </PageHeader>

      <ol className="mb-8 flex items-center gap-3">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <button onClick={() => i < step && setStep(i)} className={cx('flex items-center gap-2 text-sm', i === step ? 'text-gold-300' : i < step ? 'text-parch-200' : 'text-parch-400')}>
              <span className={cx('grid size-7 place-items-center rounded-full border font-display text-xs',
                i < step ? 'border-gold-500 bg-gold-500 text-ink-950' : i === step ? 'border-gold-400 text-gold-300' : 'border-white/15')}>
                {i < step ? <CheckIcon size={14} /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-8 bg-white/10 sm:w-16" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {BUILDS.map((b) => {
            const Icon = ICONS[b.icon]
            const sel = b.id === buildId
            return (
              <button key={b.id} onClick={() => pickBuild(b.id)}
                className={cx('panel panel-hover relative overflow-hidden p-5 text-left', sel && 'ring-2 ring-gold-400/70')}>
                <div className="absolute -right-8 -top-8 size-32 rounded-full opacity-25 blur-2xl" style={{ background: b.accent }} />
                <div className="flex items-center justify-between">
                  <Icon size={24} style={{ color: b.accent }} />
                  <Badge color={b.accent}>{'★'.repeat(4 - b.difficulty)} facilidad</Badge>
                </div>
                <div className="mt-4 font-display text-xl text-parch-100">{b.name}</div>
                <div className="text-xs uppercase tracking-wider text-parch-400">{b.subtitle}</div>
                <p className="mt-3 line-clamp-4 text-sm text-parch-300">{b.pitch}</p>
                {sel && <CheckIcon className="absolute bottom-4 right-4 text-gold-400" size={20} />}
              </button>
            )
          })}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Panel className="p-4 text-sm text-parch-300">
            <Wand2 size={16} className="mr-2 inline text-gold-400" />
            Recomendadas para <b className="text-parch-100">{build.name}</b>: {build.classes.map((c) => CLASS_BY_ID[c.id].nameEs).join(' o ')}.
            La eficiencia indica cuántos niveles necesitas para el segundo punto de control de la build.
          </Panel>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
            {ranked.map(({ c, lvl }) => {
              const rec = build.classes.find((x) => x.id === c.id)
              const sel = c.id === classId
              return (
                <button key={c.id} onClick={() => setClassId(c.id)} className={cx('panel panel-hover p-4 text-left', sel && 'ring-2 ring-gold-400/70')}>
                  <div className="flex items-center justify-between">
                    <div className="font-display text-lg text-parch-100">{c.nameEs}</div>
                    <span className="text-xs text-parch-400">Nv {c.level}</span>
                  </div>
                  {rec && <Badge color="#e6c56f" className="mt-1">Recomendada</Badge>}
                  <p className="mt-2 text-xs text-parch-300">{rec?.why ?? c.blurb}</p>
                  <div className="mt-3 grid grid-cols-4 gap-1 text-center">
                    {STAT_KEYS.map((k) => (
                      <div key={k} className={cx('rounded bg-white/[.03] py-1', build.primary.includes(k) && 'bg-gold-500/10')}>
                        <div className="text-[9px] text-parch-400">{STAT_META[k].short}</div>
                        <div className="text-xs font-semibold text-parch-100">{c.stats[k]}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-[11px] text-parch-400">
                    {lvl === best ? <span className="text-moss-400">Más eficiente</span> : `+${lvl - best} niveles vs. la mejor`}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel className="p-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-parch-400" htmlFor="run-name">Nombre de la partida</label>
            <input id="run-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={`${build.name} · ${CLASS_BY_ID[classId].nameEs}`}
              className="mt-2 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2.5 text-parch-100 outline-none placeholder:text-parch-400 focus:border-gold-500/60" />
            <div className="mt-5 text-sm text-parch-300">Recuerdo inicial recomendado: <b className="text-parch-100">{build.keepsake}</b></div>
            <div className="divider-ornament my-6" />
            <button onClick={() => setSetup((s) => !s)} className="flex w-full items-start gap-3 text-left">
              <span className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded border', setup ? 'border-gold-400 bg-gold-500 text-ink-950' : 'border-white/25')}>
                {setup && <CheckIcon size={13} />}
              </span>
              <span>
                <span className="font-medium text-parch-100">Activar ruta de preparación ("setup")</span>
                <span className="mt-1 block text-sm text-parch-300">
                  Antes del camino principal, el asistente prioriza atajos y equipo temprano para tu build: Torrent, campana,
                  frasco mixto y {build.setup.length} pasos específicos.
                </span>
              </span>
            </button>
            <button onClick={() => setDlc((s) => !s)} className="mt-5 flex w-full items-start gap-3 text-left">
              <span className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded border', dlc ? 'border-gold-400 bg-gold-500 text-ink-950' : 'border-white/25')}>
                {dlc && <CheckIcon size={13} />}
              </span>
              <span>
                <span className="font-medium text-parch-100">Incluir Shadow of the Erdtree</span>
                <span className="mt-1 block text-sm text-parch-300">
                  Añade el Reino de las Sombras al roadmap, la checklist y el mapa (Fragmentos del Árbol Umbrío, jefes del DLC y
                  {' '}{build.gear.filter((g) => g.stage === 'dlc').length} piezas de equipo del DLC para esta build). Se desbloquea tras derrotar a Mohg y a Radahn.
                </span>
              </span>
            </button>
          </Panel>
          <Panel className="p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-parch-400">Tu ruta de preparación</div>
            <ol className="mt-3 space-y-3">
              {build.setup.map((s, i) => (
                <li key={s.id} className={cx('flex gap-3 text-sm', !setup && 'opacity-40')}>
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold-500/15 font-display text-xs text-gold-300">{i + 1}</span>
                  <span className="text-parch-200">{s.title}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={() => (step === 0 ? nav(-1) : setStep(step - 1))}><ArrowLeft size={16} />Atrás</Button>
        {step < STEPS.length - 1
          ? <Button onClick={() => setStep(step + 1)}>Siguiente<ArrowRight size={16} /></Button>
          : <Button onClick={finish}>Comenzar partida<ArrowRight size={16} /></Button>}
      </div>
    </div>
  )
}
