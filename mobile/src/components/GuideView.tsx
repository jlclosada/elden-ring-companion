import { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { ArrowLeft, ArrowRight, Check as CheckIcon, ChevronDown, Coins, Hammer, MapPin, Shirt, SkipForward, Swords, TrendingUp } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { BUILD_PLANS, CHAPTERS, type ChapterId, type Fight, type Loadout, type Ref } from '@shared/data/guide'
import { LOCATION_BY_ID } from '@shared/data/locations'
import { REGION_BY_ID } from '@shared/data/regions'
import { CLASS_BY_ID, STAT_KEYS, STAT_META } from '@shared/data/classes'
import { buildGuide, currentStep, guideProgress, isStepDone, loadoutAt, statDelta, stepKey, type ResolvedStep } from '@shared/lib/guide'
import { useActiveRun, useRuns } from '@/store/runs'
import { C, F, alpha } from '@/theme'
import { Badge, Button, Eyebrow, H, Panel, Row, T, tap } from './ui'
import { RefThumb, useItemSheet } from './ItemSheet'

const FIGHT: Record<Fight, { label: string; color: string }> = {
  ninguno: { label: 'Sin combate', color: '#8fbf7a' },
  fácil: { label: 'Combate fácil', color: '#c9d65a' },
  medio: { label: 'Combate medio', color: '#e9a25b' },
  difícil: { label: 'Combate difícil', color: '#e36b5b' },
}
const KIND: Record<string, string> = { route: 'Ruta', loot: 'Objeto', boss: 'Jefe', npc: 'PNJ', farm: 'Farmeo', prep: 'Preparación', tip: 'Inicio' }
const cleanName = (n: string) => n.replace(/^Ashes? of War: /i, '')

export function GuideView({ onScrollTop }: { onScrollTop?: () => void }) {
  const { run, build } = useActiveRun()
  const updateRun = useRuns((s) => s.updateRun)
  const steps = useMemo(() => (run ? buildGuide(run.buildId, run.classId, Boolean(run.dlcEnabled)) : []), [run?.buildId, run?.classId, run?.dlcEnabled]) // eslint-disable-line react-hooks/exhaustive-deps
  const cur = run ? currentStep(run, steps) : null
  const [viewId, setViewId] = useState<string | null>(null)
  const [openChapter, setOpenChapter] = useState<ChapterId | null>(null)
  if (!run || !build) return null
  if (!steps.length) return <Panel><T muted>Esta build todavía no tiene guía paso a paso.</T></Panel>

  const view = (viewId ? steps.find((s) => s.id === viewId) : null) ?? cur
  const prog = guideProgress(run, steps)
  const chapter = view ? CHAPTERS.find((c) => c.id === view.chapter)! : CHAPTERS[0]
  const plan = BUILD_PLANS[run.buildId]
  const loadoutNow = loadoutAt(run.buildId, (cur ?? steps[steps.length - 1]).chapter)
  const chapters = CHAPTERS.filter((c) => !c.dlc || run.dlcEnabled)

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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    setDone(s, true)
    setViewId(null)
    onScrollTop?.()
  }
  const move = (dir: -1 | 1) => {
    if (!view) return
    const n = steps[view.index + dir]
    if (n) setViewId(n.id)
  }

  return (
    <View style={{ gap: 14 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <T dim style={{ fontSize: 12 }}>Paso {Math.min(prog.done + 1, prog.total)} de {prog.total}</T>
        <T dim style={{ fontSize: 12 }}>{Math.round(prog.pct * 100)}% de la guía</T>
      </Row>
      <Row gap={3}>
        {chapters.map((c) => {
          const cs = steps.filter((s) => s.chapter === c.id)
          const d = cs.filter((s) => isStepDone(run, s)).length
          return (
            <Pressable key={c.id} style={{ flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: view?.chapter === c.id ? 1 : 0, borderColor: C.gold400 }}
              onPress={() => { const first = cs.find((s) => !isStepDone(run, s)) ?? cs[0]; tap(); setViewId(first.id) }}>
              <View style={{ width: `${cs.length ? (d / cs.length) * 100 : 0}%`, height: '100%', backgroundColor: C.gold500 }} />
            </Pressable>
          )
        })}
      </Row>

      {view ? (
        <StepCard step={view} chapterName={chapter.name} chapterGoal={chapter.goal} isCurrent={view.id === cur?.id}
          done={isStepDone(run, view)} onDone={() => complete(view)} onUndo={() => setDone(view, false)}
          onPrev={() => move(-1)} onNext={() => move(1)} onBackToCurrent={viewId ? () => setViewId(null) : undefined} />
      ) : (
        <Panel style={{ alignItems: 'center' }}>
          <H size={22} gold>Guía completada</H>
          <T muted>Has terminado todos los pasos de {build.name}.</T>
        </Panel>
      )}

      {loadoutNow && <LoadoutPanel loadout={loadoutNow} title="Tu equipo en esta etapa" />}

      <Eyebrow color={C.parch400} style={{ marginTop: 4 }}>Todos los pasos</Eyebrow>
      {chapters.map((c, ci) => {
        const cs = steps.filter((s) => s.chapter === c.id)
        const d = cs.filter((s) => isStepDone(run, s)).length
        const open = openChapter === c.id || (openChapter === null && cur?.chapter === c.id)
        return (
          <Panel key={c.id} style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
            <Pressable onPress={() => setOpenChapter(open ? ('__none' as ChapterId) : c.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: d === cs.length ? C.gold500 : 'rgba(255,255,255,0.06)' }}>
                {d === cs.length ? <CheckIcon size={13} color={C.ink950} /> : <Text style={{ color: C.parch300, fontSize: 11 }}>{ci + 1}</Text>}
              </View>
              <Text style={{ flex: 1, fontFamily: F.display, color: C.parch100, fontSize: 15 }}>{c.name}</Text>
              {c.dlc && <Badge color={C.dlc}>DLC</Badge>}
              <Text style={{ color: C.parch400, fontSize: 12 }}>{d}/{cs.length}</Text>
              <ChevronDown size={16} color={C.parch400} style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }} />
            </Pressable>
            {open && (
              <View style={{ borderTopWidth: 1, borderTopColor: C.line, padding: 6 }}>
                {cs.map((s) => {
                  const sd = isStepDone(run, s)
                  return (
                    <Pressable key={s.id} onPress={() => { setViewId(s.id); onScrollTop?.() }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingVertical: 9, borderRadius: 10, backgroundColor: view?.id === s.id ? alpha(C.gold500, 0.1) : 'transparent' }}>
                      <Pressable hitSlop={8} onPress={() => { tap(); setDone(s, !sd) }}
                        style={{ width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', borderColor: sd ? C.gold400 : 'rgba(255,255,255,0.25)', backgroundColor: sd ? C.gold500 : 'transparent' }}>
                        {sd && <CheckIcon size={12} color={C.ink950} />}
                      </Pressable>
                      <Text style={{ flex: 1, fontSize: 14, color: sd ? C.parch400 : s.kind === 'prep' ? C.gold300 : C.parch100, textDecorationLine: sd ? 'line-through' : 'none', fontWeight: s.kind === 'prep' && !sd ? '700' : '400' }}>{s.title}</Text>
                      {s.optional && <Text style={{ fontSize: 10, color: C.parch400 }}>opcional</Text>}
                      {s.fight && s.fight !== 'ninguno' && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: FIGHT[s.fight].color }} />}
                    </Pressable>
                  )
                })}
              </View>
            )}
          </Panel>
        )
      })}

      <Panel>
        <Eyebrow color={C.parch300}>Cómo funciona</Eyebrow>
        <T dim style={{ fontSize: 13 }}>
          La guía sigue el orden óptimo para {build.name}: primero objetos y runas sin pelear, luego cada zona. Antes de cada jefe hay un paso de <Text style={{ color: C.gold300, fontWeight: '700' }}>preparación</Text> que te dice qué atributos subir, qué arma mejorar y qué equipo llevar.
          {plan && CLASS_BY_ID[plan.classId].id !== run.classId ? ` La guía está pensada para ${CLASS_BY_ID[plan.classId].nameEs}; los niveles se recalculan para tu clase.` : ''}
        </T>
      </Panel>
    </View>
  )
}

function StepCard({ step, chapterName, chapterGoal, isCurrent, done, onDone, onUndo, onPrev, onNext, onBackToCurrent }: {
  step: ResolvedStep; chapterName: string; chapterGoal: string; isCurrent: boolean; done: boolean
  onDone: () => void; onUndo: () => void; onPrev: () => void; onNext: () => void; onBackToCurrent?: () => void
}) {
  const loc = step.location ? LOCATION_BY_ID[step.location] : undefined
  const { run } = useActiveRun()
  const sheet = useItemSheet()
  return (
    <Panel accent={step.kind === 'prep' ? C.gold500 : undefined}>
      <Eyebrow>{chapterName}</Eyebrow>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        <Badge>{KIND[step.kind]}</Badge>
        {step.fight && <Badge color={FIGHT[step.fight].color}>{FIGHT[step.fight].label}</Badge>}
        {step.runes ? <Badge color="#f2c14e">{`+${step.runes.toLocaleString('es')} runas`}</Badge> : null}
        {step.optional && <Badge color="#9aa2c4">Opcional</Badge>}
        {done && <Badge color={C.moss}>Hecho</Badge>}
      </Row>
      <H size={22}>{step.title}</H>
      {loc && (
        <Pressable onPress={() => router.navigate({ pathname: '/mapa', params: { loc: loc.id } })} hitSlop={6}>
          <Row gap={4}><MapPin size={14} color={C.gold400} /><Text style={{ color: C.gold400, fontSize: 14 }}>{loc.name}{REGION_BY_ID[loc.region] ? ` · ${REGION_BY_ID[loc.region].nameEs}` : ''}</Text></Row>
        </Pressable>
      )}
      {step.kind === 'tip' && <T dim style={{ fontSize: 14 }}>{chapterGoal}</T>}

      <View style={{ gap: 10, marginTop: 4 }}>
        {step.how.map((h, i) => (
          <Row key={i} gap={10} style={{ alignItems: 'flex-start' }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: alpha(C.gold500, 0.15), alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
              <Text style={{ fontFamily: F.display, color: C.gold300, fontSize: 12 }}>{i + 1}</Text>
            </View>
            <T style={{ flex: 1, fontSize: 16, lineHeight: 23 }}>{h}</T>
          </Row>
        ))}
      </View>

      {step.loot && step.loot.length > 0 && (
        <View style={{ gap: 8, marginTop: 6 }}>
          <Eyebrow color={C.parch400}>Consigues</Eyebrow>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {step.loot.map((r) => (
              <Pressable key={r.name} onPress={() => sheet.open({ cat: r.cat, name: r.name, stats: run?.stats })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, padding: 4, paddingRight: 12 }}>
                <RefThumb cat={r.cat} name={r.name} size={36} /><Text style={{ color: C.parch100, fontSize: 13, maxWidth: 220 }}>{cleanName(r.name)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {step.prep && run && <PrepBlock step={step} />}

      <View style={{ gap: 8, marginTop: 8 }}>
        {!done
          ? <Button icon={<CheckIcon size={16} color={C.ink950} />} onPress={onDone}>{step.kind === 'prep' ? 'Hecho: ya me he preparado' : 'Hecho, siguiente paso'}</Button>
          : <Button variant="outline" onPress={onUndo}>Marcar como pendiente</Button>}
        <Row style={{ justifyContent: 'space-between' }}>
          <Row gap={4}>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} color={C.parch200} />} onPress={onPrev}>Anterior</Button>
            <Button variant="ghost" size="sm" icon={<ArrowRight size={16} color={C.parch200} />} onPress={onNext}>Siguiente</Button>
          </Row>
          {!done && step.optional && <Button variant="ghost" size="sm" icon={<SkipForward size={15} color={C.parch200} />} onPress={onDone}>Saltar</Button>}
          {onBackToCurrent && !isCurrent && <Button variant="ghost" size="sm" onPress={onBackToCurrent}>Paso actual</Button>}
        </Row>
      </View>
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
  const stone = (n: string) => n.replace('Somber Ancient Dragon Smithing Stone', 'Sombría de dragón antiguo').replace('Ancient Dragon Smithing Stone', 'Piedra de dragón antiguo').replace('Somber Smithing Stone', 'Sombría').replace('Smithing Stone', 'Piedra')
  return (
    <View style={{ gap: 12, marginTop: 8 }}>
      <View style={{ borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, padding: 12, gap: 8 }}>
        <Row gap={8}><TrendingUp size={18} color={C.gold400} /><H size={17}>Sube a nivel {p.level}</H></Row>
        {delta.rows.length === 0 ? (
          <T style={{ color: C.moss, fontSize: 14 }}>Ya tienes los atributos objetivo. Si te sobran runas, ponlas en Vigor.</T>
        ) : (
          <>
            <T dim style={{ fontSize: 12 }}>Desde tu nivel {delta.level}: <Text style={{ color: C.gold300, fontWeight: '700' }}>{delta.runes.toLocaleString('es')} runas</Text>. Reparte así, en este orden:</T>
            {delta.rows.map((r) => (
              <Row key={r.k} style={{ justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 }}>
                <Text style={{ color: STAT_META[r.k].color, fontSize: 14 }}>{STAT_META[r.k].label}</Text>
                <Text style={{ color: C.parch200, fontSize: 14 }}>{r.from} → <Text style={{ fontWeight: '700', color: C.parch100 }}>{r.to}</Text> <Text style={{ color: C.gold400 }}>(+{r.add})</Text></Text>
              </Row>
            ))}
            <Button variant="outline" size="sm" icon={<CheckIcon size={14} color={C.gold300} />} onPress={applyLevels}>Ya he subido estos atributos</Button>
          </>
        )}
        {p.farm && <Row gap={6} style={{ alignItems: 'flex-start' }}><Coins size={13} color={C.gold400} /><T dim style={{ flex: 1, fontSize: 12 }}>{p.farm}</T></Row>}
      </View>

      <View style={{ borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, padding: 12, gap: 8 }}>
        <Row gap={8}><Hammer size={18} color={C.gold400} /><H size={17}>Mejora</H></Row>
        {p.upgrades.map((u) => (
          <Row key={u.ref.name} gap={10} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 8 }}>
            <RefThumb cat={u.ref.cat} name={u.ref.name} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.parch100, fontSize: 14 }} numberOfLines={1}>{u.ref.name}</Text>
              <T dim style={{ fontSize: 12 }}>{u.cost.length ? `De +${u.from} a +${u.to}: ${u.cost.map((c) => `${c.qty}× ${stone(c.name)}`).join(' · ')}` : 'Ya está al nivel objetivo'}</T>
            </View>
            <Text style={{ fontFamily: F.display, fontSize: 22, color: C.gold300 }}>+{u.to}</Text>
          </Row>
        ))}
        <T dim style={{ fontSize: 12 }}>{p.stones}</T>
      </View>

      <LoadoutPanel loadout={p.loadout} changed={p.changed} title="Equípate así" />
    </View>
  )
}

export function LoadoutPanel({ loadout, changed = [], title }: { loadout: Loadout; changed?: string[]; title: string }) {
  const { run } = useActiveRun()
  const sheet = useItemSheet()
  const row = (label: string, key: string, refs: (Ref | undefined)[], extra?: string) => {
    const list = refs.filter(Boolean) as Ref[]
    if (!list.length) return null
    return (
      <View key={key} style={{ gap: 6, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.line }}>
        <Row gap={6}>
          <Text style={{ fontSize: 11, color: C.parch400, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
          {changed.includes(key) && <Badge>nuevo</Badge>}
          {extra ? <Text style={{ fontSize: 12, color: C.gold300 }}>{extra}</Text> : null}
        </Row>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {list.map((r) => (
            <Pressable key={r.name} onPress={() => sheet.open({ cat: r.cat, name: r.name, stats: run?.stats })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 9, backgroundColor: C.card, padding: 3, paddingRight: 10 }}>
              <RefThumb cat={r.cat} name={r.name} size={30} /><Text style={{ color: C.parch100, fontSize: 12, maxWidth: 230 }}>{cleanName(r.name)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    )
  }
  return (
    <Panel>
      <Row gap={8}><Shirt size={18} color={C.gold400} /><H size={17}>{title}</H></Row>
      <View>
        {row('Arma', 'weapon', [loadout.weapon], [loadout.affinity && `Afinidad ${loadout.affinity}`, loadout.twoHand && 'a dos manos'].filter(Boolean).join(' · '))}
        {row('Ceniza', 'ash', [loadout.ash])}
        {row('Secundaria', 'offhand', [loadout.offhand])}
        {row('Catalizador', 'catalyst', [loadout.catalyst])}
        {row('Hechizos', 'spells', loadout.spells ?? [])}
        {row('Talismanes', 'talismans', loadout.talismans ?? [])}
        {row('Espíritu', 'spirit', [loadout.spirit])}
        {row('Lágrimas', 'tear', loadout.tear ?? [])}
      </View>
      {loadout.why && <Row gap={6} style={{ alignItems: 'flex-start' }}><Swords size={13} color={C.gold400} /><T muted style={{ flex: 1, fontSize: 13 }}>{loadout.why}</T></Row>}
    </Panel>
  )
}
