import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Coins, Hammer, MapPin, Shirt, Swords, TrendingUp, SkipForward } from 'lucide-react'
import { BUILD_PLANS, CHAPTERS, type ChapterId, type Fight, type Loadout, type Ref } from '../data/guide'
import { LOCATION_BY_ID } from '../data/locations'
import { REGION_BY_ID } from '../data/regions'
import { CLASS_BY_ID, STAT_KEYS, STAT_META } from '../data/classes'
import { useActiveRun, useRuns } from '../store/runs'
import { buildGuide, currentStep, guideProgress, isStepDone, loadoutAt, statDelta, stepKey, type ResolvedStep } from '../lib/guide'
import { Badge, Button, Panel, cx } from './ui'
import { RefDetail, RefThumb } from './ItemCard'
import { MiniMap } from './MiniMap'

const FIGHT: Record<Fight, { label: string; color: string }> = {
  ninguno: { label: 'Sin combate', color: '#8fbf7a' },
  fácil: { label: 'Combate fácil', color: '#c9d65a' },
  medio: { label: 'Combate medio', color: '#e9a25b' },
  difícil: { label: 'Combate difícil', color: '#e36b5b' },
}
const KIND: Record<string, string> = { route: 'Ruta', loot: 'Objeto', boss: 'Jefe', npc: 'PNJ', farm: 'Farmeo', prep: 'Preparación', tip: 'Inicio' }

export function GuideView() {
  const { run, build } = useActiveRun()
  const updateRun = useRuns((s) => s.updateRun)
  const steps = useMemo(() => (run ? buildGuide(run.buildId, run.classId, Boolean(run.dlcEnabled)) : []), [run?.buildId, run?.classId, run?.dlcEnabled]) // eslint-disable-line react-hooks/exhaustive-deps
  const cur = run ? currentStep(run, steps) : null
  const [viewId, setViewId] = useState<string | null>(null)
  const [openChapter, setOpenChapter] = useState<ChapterId | null>(null)
  if (!run || !build) return null
  if (!steps.length) return <Panel className="p-6 text-sm text-parch-300">Esta build todavía no tiene guía paso a paso.</Panel>

  const view = (viewId ? steps.find((s) => s.id === viewId) : null) ?? cur
  const prog = guideProgress(run, steps)
  const chapter = view ? CHAPTERS.find((c) => c.id === view.chapter)! : CHAPTERS[0]
  const plan = BUILD_PLANS[run.buildId]
  const loadoutNow = loadoutAt(run.buildId, (cur ?? steps[steps.length - 1]).chapter)

  const setDone = (s: ResolvedStep, value: boolean) => {
    const done = { ...run.done }
    if (value) {
      done[stepKey(s.id)] = Date.now()
      for (const t of s.taskIds ?? []) done[t] = done[t] ?? Date.now()
    } else {
      delete done[stepKey(s.id)]
      for (const t of s.taskIds ?? []) delete done[t]
    }
    updateRun({ done })
  }
  const complete = (s: ResolvedStep) => {
    setDone(s, true)
    setViewId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const move = (dir: -1 | 1) => {
    if (!view) return
    const n = steps[view.index + dir]
    if (n) setViewId(n.id)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-4">
        {/* Progreso por capítulos */}
        <div className="flex items-center justify-between text-xs text-parch-400">
          <span>Paso {Math.min(prog.done + 1, prog.total)} de {prog.total}</span>
          <span>{Math.round(prog.pct * 100)}% de la guía</span>
        </div>
        <div className="flex gap-1">
          {CHAPTERS.filter((c) => !c.dlc || run.dlcEnabled).map((c) => {
            const cs = steps.filter((s) => s.chapter === c.id)
            const d = cs.filter((s) => isStepDone(run, s)).length
            return (
              <button key={c.id} title={c.name} onClick={() => { const first = cs.find((s) => !isStepDone(run, s)) ?? cs[0]; setViewId(first.id) }}
                className={cx('h-2 flex-1 overflow-hidden rounded-full bg-white/5', view?.chapter === c.id && 'ring-1 ring-gold-400/70')}>
                <div className="h-full bg-gold-500" style={{ width: `${cs.length ? (d / cs.length) * 100 : 0}%` }} />
              </button>
            )
          })}
        </div>

        {view ? <StepCard step={view} chapterName={chapter.name} chapterGoal={chapter.goal} isCurrent={view.id === cur?.id}
          done={isStepDone(run, view)} onDone={() => complete(view)} onUndo={() => setDone(view, false)}
          onPrev={() => move(-1)} onNext={() => move(1)} onBackToCurrent={viewId ? () => setViewId(null) : undefined} /> : (
          <Panel className="p-8 text-center"><div className="font-display text-2xl text-gold-gradient">Guía completada</div><p className="mt-2 text-sm text-parch-300">Has terminado todos los pasos de {build.name}.</p></Panel>
        )}

        {/* Todos los pasos */}
        <div className="space-y-2 pt-2">
          {CHAPTERS.filter((c) => !c.dlc || run.dlcEnabled).map((c) => {
            const cs = steps.filter((s) => s.chapter === c.id)
            const d = cs.filter((s) => isStepDone(run, s)).length
            const open = openChapter === c.id || (openChapter === null && cur?.chapter === c.id)
            return (
              <Panel key={c.id} className="overflow-hidden">
                <button onClick={() => setOpenChapter(open ? ('__none' as ChapterId) : c.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <span className={cx('grid size-6 place-items-center rounded-full text-[11px]', d === cs.length ? 'bg-gold-500 text-ink-950' : 'bg-white/5 text-parch-300')}>{d === cs.length ? <Check size={13} /> : CHAPTERS.indexOf(c) + 1}</span>
                  <span className="flex-1 font-display text-parch-100">{c.name}{c.dlc && <Badge color="#d98a4a" className="ml-2">DLC</Badge>}</span>
                  <span className="text-xs tabular-nums text-parch-400">{d}/{cs.length}</span>
                  <ChevronDown size={16} className={cx('text-parch-400 transition', open && 'rotate-180')} />
                </button>
                {open && (
                  <ol className="border-t border-white/5 px-2 py-2">
                    {cs.map((s) => {
                      const sd = isStepDone(run, s)
                      return (
                        <li key={s.id}>
                          <button onClick={() => { setViewId(s.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                            className={cx('flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-white/5', view?.id === s.id && 'bg-gold-500/10')}>
                            <span onClick={(e) => { e.stopPropagation(); setDone(s, !sd) }} role="checkbox" aria-checked={sd}
                              className={cx('grid size-5 shrink-0 place-items-center rounded border', sd ? 'border-gold-400 bg-gold-500 text-ink-950' : 'border-white/20')}>{sd && <Check size={12} />}</span>
                            <span className={cx('flex-1', sd ? 'text-parch-400 line-through' : 'text-parch-100', s.kind === 'prep' && !sd && 'font-semibold text-gold-300')}>{s.title}</span>
                            {s.optional && <span className="text-[10px] text-parch-400">opcional</span>}
                            {s.fight && s.fight !== 'ninguno' && <span className="size-2 rounded-full" style={{ background: FIGHT[s.fight].color }} title={FIGHT[s.fight].label} />}
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </Panel>
            )
          })}
        </div>
      </div>

      {/* Lateral */}
      <div className="space-y-4">
        {view?.location && <MiniMap locations={[view.location]} focus={view.location} className="aspect-[4/3]" />}
        {loadoutNow && <LoadoutPanel loadout={loadoutNow} title="Tu equipo en esta etapa" />}
        <Panel className="p-4 text-xs leading-relaxed text-parch-400">
          <div className="mb-1 font-semibold uppercase tracking-wider text-parch-300">Cómo funciona</div>
          La guía sigue el orden óptimo para {build.name}: primero objetos y runas sin pelear, luego cada zona. Antes de cada jefe hay un paso de
          <b className="text-gold-300"> preparación</b> que te dice qué atributos subir (comparado con tus stats actuales), qué arma mejorar y a qué nivel, y qué equipo llevar.
          {plan && CLASS_BY_ID[plan.classId].id !== run.classId && <span className="mt-2 block text-[#e9a25b]">La guía está pensada para {CLASS_BY_ID[plan.classId].nameEs}; los niveles se recalculan para tu clase.</span>}
        </Panel>
      </div>
    </div>
  )
}

function StepCard({ step, chapterName, chapterGoal, isCurrent, done, onDone, onUndo, onPrev, onNext, onBackToCurrent }: {
  step: ResolvedStep; chapterName: string; chapterGoal: string; isCurrent: boolean; done: boolean
  onDone: () => void; onUndo: () => void; onPrev: () => void; onNext: () => void; onBackToCurrent?: () => void
}) {
  const loc = step.location ? LOCATION_BY_ID[step.location] : undefined
  const [detail, setDetail] = useState<Ref | null>(null)
  const { run } = useActiveRun()

  return (
    <Panel className={cx('rise p-5 sm:p-6', step.kind === 'prep' && 'ring-1 ring-gold-500/40')}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500">{chapterName}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge color="#e6c56f">{KIND[step.kind]}</Badge>
        {step.fight && <Badge color={FIGHT[step.fight].color}>{FIGHT[step.fight].label}</Badge>}
        {step.runes && <Badge color="#f2c14e"><Coins size={11} />+{step.runes.toLocaleString('es')} runas</Badge>}
        {step.optional && <Badge color="#9aa2c4">Opcional</Badge>}
        {done && <Badge color="#8fbf7a"><Check size={11} />Hecho</Badge>}
      </div>
      <h2 className="mt-3 font-display text-2xl leading-tight text-parch-100">{step.title}</h2>
      {loc && (
        <Link to={`/mapa?loc=${loc.id}`} className="mt-1 inline-flex items-center gap-1 text-sm text-gold-400 hover:underline">
          <MapPin size={14} />{loc.name}{REGION_BY_ID[loc.region] ? ` · ${REGION_BY_ID[loc.region].nameEs}` : ''}
        </Link>
      )}
      {step.kind === 'tip' && <p className="mt-2 text-sm text-parch-400">{chapterGoal}</p>}

      <ol className="mt-4 space-y-2.5">
        {step.how.map((h, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-parch-200">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-gold-500/15 font-display text-xs text-gold-300">{i + 1}</span>
            <span>{h}</span>
          </li>
        ))}
      </ol>

      {step.loot && step.loot.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-parch-400">Consigues</div>
          <div className="flex flex-wrap gap-2">
            {step.loot.map((r) => (
              <button key={r.name} onClick={() => setDetail(r)} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[.03] py-1 pl-1 pr-3 text-left hover:border-gold-500/40">
                <RefThumb cat={r.cat} name={r.name} size={36} /><span className="text-sm text-parch-100">{r.name.replace(/^Ashes? of War: /i, '')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step.prep && run && <PrepBlock step={step} />}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {!done ? (
          <Button onClick={onDone}><Check size={16} />{step.kind === 'prep' ? 'Hecho: ya me he preparado' : 'Hecho, siguiente paso'}</Button>
        ) : (
          <Button variant="outline" onClick={onUndo}>Marcar como pendiente</Button>
        )}
        {!done && step.optional && <Button variant="ghost" onClick={onDone}><SkipForward size={15} />Saltar</Button>}
        <div className="ml-auto flex gap-1">
          {onBackToCurrent && !isCurrent && <Button variant="ghost" size="sm" onClick={onBackToCurrent}>Ir al paso actual</Button>}
          <Button variant="ghost" size="sm" onClick={onPrev} aria-label="Paso anterior"><ArrowLeft size={15} /></Button>
          <Button variant="ghost" size="sm" onClick={onNext} aria-label="Paso siguiente"><ArrowRight size={15} /></Button>
        </div>
      </div>
      {detail && <RefDetail cat={detail.cat} name={detail.name} onClose={() => setDetail(null)} stats={run?.stats} />}
    </Panel>
  )
}

function PrepBlock({ step }: { step: ResolvedStep }) {
  const { run } = useActiveRun()
  const setStats = useRuns((s) => s.setStats)
  const p = step.prep!
  const delta = statDelta(run!.stats, p.target)
  const applyLevels = () => {
    const next = { ...run!.stats }
    for (const k of STAT_KEYS) next[k] = Math.max(next[k], p.target[k])
    setStats(next)
  }
  return (
    <div className="mt-6 space-y-4">
      {/* Nivel */}
      <section className="rounded-xl border border-white/5 bg-white/[.02] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-display text-lg text-parch-100"><TrendingUp size={18} className="text-gold-400" />Sube a nivel {p.level}</h3>
          {delta.rows.length > 0 && <span className="text-xs text-parch-400">Desde tu nivel {delta.level}: <b className="text-gold-300">{delta.runes.toLocaleString('es')} runas</b></span>}
        </div>
        {delta.rows.length === 0 ? (
          <p className="mt-2 text-sm text-moss-400">Ya tienes los atributos objetivo. Si te sobran runas, ponlas en Vigor.</p>
        ) : (
          <>
            <p className="mt-1 text-xs text-parch-400">Reparte los puntos así (en este orden). Tus stats actuales salen de la pestaña Estadísticas.</p>
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2 2xl:grid-cols-3">
              {delta.rows.map((r) => (
                <div key={r.k} className="flex items-center justify-between rounded-lg bg-white/[.03] px-3 py-2 text-sm">
                  <span style={{ color: STAT_META[r.k].color }}>{STAT_META[r.k].label}</span>
                  <span className="tabular-nums text-parch-200">{r.from} → <b className="text-parch-100">{r.to}</b> <span className="text-gold-400">(+{r.add})</span></span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-3" onClick={applyLevels}><Check size={14} />Ya he subido estos atributos</Button>
          </>
        )}
        {p.farm && <p className="mt-3 text-xs text-parch-400"><Coins size={12} className="mr-1 inline text-gold-400" />{p.farm}</p>}
      </section>

      {/* Mejora */}
      <section className="rounded-xl border border-white/5 bg-white/[.02] p-4">
        <h3 className="flex items-center gap-2 font-display text-lg text-parch-100"><Hammer size={18} className="text-gold-400" />Mejora</h3>
        <div className="mt-3 space-y-2">
          {p.upgrades.map((u) => (
            <div key={u.ref.name} className="flex items-center gap-3 rounded-lg bg-white/[.03] p-2">
              <RefThumb cat={u.ref.cat} name={u.ref.name} size={44} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-parch-100">{u.ref.name}</div>
                <div className="text-xs text-parch-400">
                  {u.cost.length ? <>De +{u.from} a +{u.to}: {u.cost.map((c) => `${c.qty}× ${c.name.replace('Somber Smithing Stone', 'Sombría').replace('Smithing Stone', 'Piedra').replace('Somber Ancient Dragon Smithing Stone', 'Sombría de dragón antiguo').replace('Ancient Dragon Smithing Stone', 'Piedra de dragón antiguo')}`).join(' · ')}</> : 'Ya está al nivel objetivo'}
                </div>
              </div>
              <div className="font-display text-2xl text-gold-gradient">+{u.to}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-parch-400">{p.stones}</p>
      </section>

      {/* Equipo */}
      <LoadoutPanel loadout={p.loadout} changed={p.changed} title="Equípate así" />
    </div>
  )
}

function LoadoutPanel({ loadout, changed = [], title }: { loadout: Loadout; changed?: string[]; title: string }) {
  const [detail, setDetail] = useState<Ref | null>(null)
  const { run } = useActiveRun()
  const row = (label: string, key: string, refs: (Ref | undefined)[], extra?: string) => {
    const list = refs.filter(Boolean) as Ref[]
    if (!list.length) return null
    return (
      <div className="flex gap-3 py-2">
        <div className="w-24 shrink-0 pt-1 text-[11px] uppercase tracking-wider text-parch-400">
          {label}{changed.includes(key) && <span className="mt-0.5 block normal-case tracking-normal text-gold-400">nuevo</span>}
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {list.map((r) => (
            <button key={r.name} onClick={() => setDetail(r)} className="flex items-center gap-2 rounded-lg bg-white/[.03] py-0.5 pl-0.5 pr-2 text-left hover:bg-white/[.06]">
              <RefThumb cat={r.cat} name={r.name} size={30} /><span className="text-xs text-parch-100">{r.name.replace(/^Ashes? of War: /i, '')}</span>
            </button>
          ))}
          {extra && <span className="self-center text-xs text-gold-300">{extra}</span>}
        </div>
      </div>
    )
  }
  return (
    <Panel className="p-4">
      <h3 className="flex items-center gap-2 font-display text-lg text-parch-100"><Shirt size={18} className="text-gold-400" />{title}</h3>
      <div className="mt-1 divide-y divide-white/5">
        {row('Arma', 'weapon', [loadout.weapon], [loadout.affinity && `Afinidad ${loadout.affinity}`, loadout.twoHand && 'a dos manos'].filter(Boolean).join(' · '))}
        {row('Ceniza', 'ash', [loadout.ash])}
        {row('Secundaria', 'offhand', [loadout.offhand])}
        {row('Catalizador', 'catalyst', [loadout.catalyst])}
        {row('Hechizos', 'spells', loadout.spells ?? [])}
        {row('Talismanes', 'talismans', loadout.talismans ?? [])}
        {row('Espíritu', 'spirit', [loadout.spirit])}
        {row('Lágrimas', 'tear', loadout.tear ?? [])}
      </div>
      {loadout.why && <p className="mt-2 flex gap-2 text-xs leading-relaxed text-parch-300"><Swords size={13} className="mt-0.5 shrink-0 text-gold-400" />{loadout.why}</p>}
      {detail && <RefDetail cat={detail.cat} name={detail.name} onClose={() => setDetail(null)} stats={run?.stats} />}
    </Panel>
  )
}
