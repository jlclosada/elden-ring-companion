import { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Crown, RotateCcw, Skull, Sparkles, Sun } from 'lucide-react-native'
import { BOSS_KIND, BOSSES, bossKey, bossesForRun, type Boss, type BossKind } from '@shared/data/bosses'
import { LOCATION_BY_ID } from '@shared/data/locations'
import { PHASES, REGIONS, REGION_BY_ID } from '@shared/data/regions'
import { SCADU_TARGETS } from '@shared/data/dlc'
import type { ChecklistGroup, Task } from '@shared/data/types'
import { currentPhase, dlcPhase, isDone, recommend } from '@shared/lib/plan'
import { recommendedUpgrade } from '@shared/lib/stats'
import { useActiveRun, useRuns } from '@/store/runs'
import { C, F, alpha } from '@/theme'
import { Badge, Check, Chip, Eyebrow, H, Panel, ProgressBar, ProgressRing, Row, SearchField, SectionTitle, Stat, T } from './ui'
import { TaskRow } from './TaskRow'

const dateFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })

// ---- Recomendaciones -----------------------------------------------------
export function NextTab({ tasks }: { tasks: Task[] }) {
  const { run, build } = useActiveRun()
  const updateRun = useRuns((s) => s.updateRun)
  const recs = useMemo(() => recommend(run!, tasks, 8), [run, tasks])
  const phase = PHASES[currentPhase(run!, tasks)]
  const up = recommendedUpgrade(run!.level)
  const dPhase = run!.dlcEnabled ? dlcPhase(run!, tasks) : null

  return (
    <View style={{ gap: 14 }}>
      <Panel>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Eyebrow color={C.parch400}>Fase actual</Eyebrow>
            <H size={19}>{phase.name}</H>
          </View>
          <Badge>{`Nv ${phase.levels[0]}–${phase.levels[1]}`}</Badge>
        </Row>
        <T muted style={{ fontSize: 14 }}>{phase.summary}</T>
        <Row>
          <Stat label="Arma normal" value={`+${up.regular}`} />
          <Stat label="Arma sombría" value={`+${up.somber}`} />
        </Row>
        {run!.level < phase.levels[0] && <T style={{ color: C.amber, fontSize: 12 }}>Tu nivel ({run!.level}) está por debajo del recomendado. Revisa Estadísticas o farmea runas.</T>}
        {build?.affinity && <T dim style={{ fontSize: 12 }}>Afinidad recomendada: <Text style={{ color: C.parch200 }}>{build.affinity}</Text></T>}
      </Panel>

      <SectionTitle right={run!.hiddenTasks?.length ? (
        <Pressable onPress={() => updateRun({ hiddenTasks: [] })} hitSlop={8}><Row gap={4}><RotateCcw size={12} color={C.parch400} /><Text style={{ color: C.parch400, fontSize: 12 }}>Restaurar ({run!.hiddenTasks.length})</Text></Row></Pressable>
      ) : undefined}>Recomendaciones</SectionTitle>
      {recs.map((r, i) => <TaskRow key={r.task.id} task={r.task} reasons={r.reasons.slice(0, 2)} warning={r.warning} index={i} />)}
      {recs.length === 0 && <Panel><T muted>No quedan tareas disponibles en esta fase. ¡Avanza en el camino principal!</T></Panel>}

      {dPhase !== null && (
        <Panel accent={C.dlc}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Eyebrow color={C.dlc}>Shadow of the Erdtree</Eyebrow>
              <H size={18}>{PHASES[dPhase].name}</H>
            </View>
            <Sun size={20} color={C.gold400} />
          </Row>
          <T muted style={{ fontSize: 14 }}>{PHASES[dPhase].summary}</T>
          <Eyebrow color={C.parch400}>Bendición recomendada</Eyebrow>
          {SCADU_TARGETS.map((t) => (
            <Row key={t.boss} style={{ justifyContent: 'space-between' }}>
              <Text style={{ color: C.parch200, flex: 1, fontSize: 13 }}>{t.boss}</Text>
              <Text style={{ color: C.gold300, fontSize: 13, width: 44, textAlign: 'right' }}>+{t.blessing}</Text>
              <Text style={{ color: C.parch300, fontSize: 13, width: 44, textAlign: 'right' }}>+{t.spirit}</Text>
            </Row>
          ))}
        </Panel>
      )}
    </View>
  )
}

// ---- Ruta por fases -------------------------------------------------------
export function RoadmapTab({ tasks }: { tasks: Task[] }) {
  const { run } = useActiveRun()
  const current = currentPhase(run!, tasks)
  const dCurrent = run!.dlcEnabled ? dlcPhase(run!, tasks) : null
  const [open, setOpen] = useState<number | null>(dCurrent ?? current)
  const phases = PHASES.filter((p) => p.id <= 10 || run!.dlcEnabled)
  return (
    <View style={{ gap: 12 }}>
      {phases.map((p) => {
        const pt = tasks.filter((t) => t.phase === p.id)
        const done = pt.filter((t) => isDone(run!, t.id)).length
        const pct = pt.length ? done / pt.length : 0
        const isCur = p.id === current || p.id === dCurrent
        const keyTasks = pt.filter((t) => t.kind === 'main' || t.group === 'Equipo de la build' || t.group === 'Preparación')
        const shown = open === p.id ? pt : keyTasks.slice(0, 3)
        return (
          <Panel key={p.id} accent={isCur ? C.gold500 : undefined}>
            <Pressable onPress={() => setOpen(open === p.id ? null : p.id)} style={{ gap: 6 }}>
              <Row gap={10}>
                <View style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
                  borderColor: pct === 1 || isCur ? C.gold400 : C.lineStrong, backgroundColor: pct === 1 ? C.gold500 : 'transparent' }}>
                  <Text style={{ fontFamily: F.display, color: pct === 1 ? C.ink950 : isCur ? C.gold300 : C.parch400 }}>{p.id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <H size={16}>{p.name}</H>
                  <Row gap={6} style={{ flexWrap: 'wrap', marginTop: 2 }}>
                    {p.id >= 11 && <Badge color={C.dlc}>DLC</Badge>}
                    {isCur && <Badge>Estás aquí</Badge>}
                    <T dim style={{ fontSize: 11 }}>Nv {p.levels[0]}–{p.levels[1]} · {done}/{pt.length}</T>
                  </Row>
                </View>
              </Row>
              <ProgressBar value={pct} />
              <Row gap={4} style={{ flexWrap: 'wrap' }}>{p.regions.map((r) => <Badge key={r} color={REGION_BY_ID[r].color}>{REGION_BY_ID[r].nameEs}</Badge>)}</Row>
              <T muted style={{ fontSize: 14 }}>{p.summary}</T>
            </Pressable>
            {shown.map((t) => <TaskRow key={t.id} task={t} />)}
            {open !== p.id && pt.length > shown.length && (
              <Pressable onPress={() => setOpen(p.id)}><Text style={{ color: C.gold400, fontSize: 13 }}>Ver las {pt.length} tareas de esta fase</Text></Pressable>
            )}
          </Panel>
        )
      })}
    </View>
  )
}

// ---- Checklist ------------------------------------------------------------
const GROUP_ORDER: ChecklistGroup[] = ['Preparación', 'Camino principal', 'Equipo de la build', 'Mejoras de frasco', 'Mejora de armas', 'Cenizas de espíritu', 'Llaves y accesos', 'Shadow of the Erdtree', 'Bendición del Árbol Umbrío', 'Jefes opcionales', 'Mapas']

export function ChecklistTab({ tasks }: { tasks: Task[] }) {
  const { run } = useActiveRun()
  const [q, setQ] = useState('')
  const [hideDone, setHideDone] = useState(false)
  const [group, setGroup] = useState<ChecklistGroup | 'all'>('all')
  const needle = q.trim().toLowerCase()
  const filtered = tasks.filter((t) => {
    if (hideDone && isDone(run!, t.id)) return false
    if (group !== 'all' && t.group !== group) return false
    if (needle && !`${t.title} ${t.detail ?? ''} ${t.location ? LOCATION_BY_ID[t.location]?.name : ''}`.toLowerCase().includes(needle)) return false
    return true
  })
  const present = GROUP_ORDER.filter((g) => tasks.some((t) => t.group === g))
  const groups = GROUP_ORDER.map((g) => ({ g, items: filtered.filter((t) => t.group === g).sort((a, b) => a.phase - b.phase) })).filter((x) => x.items.length)
  return (
    <View style={{ gap: 12 }}>
      <SearchField value={q} onChange={setQ} placeholder="Buscar tarea, objeto o lugar…" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Chip label="Ocultar completadas" active={hideDone} onPress={() => setHideDone((h) => !h)} />
        <Chip label="Todos" active={group === 'all'} onPress={() => setGroup('all')} />
        {present.map((g) => <Chip key={g} label={g} active={group === g} onPress={() => setGroup(group === g ? 'all' : g)} />)}
      </View>
      {groups.map(({ g, items }) => {
        const all = tasks.filter((t) => t.group === g)
        const d = all.filter((t) => isDone(run!, t.id)).length
        return (
          <View key={g} style={{ gap: 8 }}>
            <SectionTitle right={<Text style={{ color: C.parch400, fontSize: 12 }}>{d}/{all.length}</Text>}>{g}</SectionTitle>
            {items.map((t) => <TaskRow key={t.id} task={t} />)}
          </View>
        )
      })}
      {groups.length === 0 && <Panel><T muted style={{ textAlign: 'center' }}>Nada que mostrar con estos filtros.</T></Panel>}
    </View>
  )
}

// ---- Jefes ----------------------------------------------------------------
type Filter = 'all' | BossKind
export function BossesTab() {
  const { run } = useActiveRun()
  const toggle = useRuns((s) => s.toggleTask)
  const [q, setQ] = useState('')
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
  const regions = REGIONS.filter((r) => filtered.some((b) => b.region === r.id))
    .sort((a, z) => Number(a.layer === 'shadow') - Number(z.layer === 'shadow') || a.phase - z.phase)
  const killed = all.filter(isKilled).length
  const rem = all.filter((b) => b.kind === 'remembrance')
  const req = all.filter((b) => b.required)

  return (
    <View style={{ gap: 12 }}>
      <Panel>
        <Row gap={16}>
          <ProgressRing value={all.length ? killed / all.length : 0} label={String(killed)} sub={`de ${all.length}`} />
          <View style={{ flex: 1, gap: 6 }}>
            <Eyebrow color={C.parch400}>Jefes derrotados</Eyebrow>
            <Row gap={6}><Crown size={14} color={C.gold400} /><T style={{ fontSize: 13 }}>Remembranzas {rem.filter(isKilled).length}/{rem.length}</T></Row>
            <Row gap={6}><Skull size={14} color={C.gold400} /><T style={{ fontSize: 13 }}>Obligatorios {req.filter(isKilled).length}/{req.length}</T></Row>
            {!run.dlcEnabled && <T dim style={{ fontSize: 11 }}>Activa el DLC en la partida para añadir sus jefes.</T>}
          </View>
        </Row>
      </Panel>
      <SearchField value={q} onChange={setQ} placeholder="Buscar jefe o lugar (también en inglés)…" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Chip label="Solo obligatorios" active={onlyRequired} onPress={() => setOnlyRequired((v) => !v)} />
        <Chip label="Ocultar derrotados" active={hideDone} onPress={() => setHideDone((v) => !v)} />
        {(Object.keys(BOSS_KIND) as BossKind[]).map((k) => <Chip key={k} label={BOSS_KIND[k].label} color={BOSS_KIND[k].color} active={kind === k} onPress={() => setKind(kind === k ? 'all' : k)} />)}
      </View>
      {regions.map((r) => {
        const items = filtered.filter((b) => b.region === r.id)
        const inRegion = all.filter((b) => b.region === r.id)
        const d = inRegion.filter(isKilled).length
        return (
          <View key={r.id} style={{ gap: 8 }}>
            <SectionTitle right={<Row gap={6}><Text style={{ color: C.parch400, fontSize: 12 }}>{d}/{inRegion.length}</Text><ProgressBar value={d / inRegion.length} color={r.color} style={{ width: 56 }} /></Row>}>
              {r.nameEs}
            </SectionTitle>
            {items.map((b) => {
              const at = run.done[bossKey(b)] as number | undefined
              const k = BOSS_KIND[b.kind]
              return (
                <Row key={b.id} gap={12} style={{ alignItems: 'flex-start', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, opacity: at ? 0.55 : 1 }}>
                  <Check checked={Boolean(at)} onToggle={() => toggle(bossKey(b))} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: C.parch100, fontSize: 15, fontWeight: '600', textDecorationLine: at ? 'line-through' : 'none' }}>{b.name}</Text>
                    <Row gap={6} style={{ flexWrap: 'wrap' }}>
                      <Badge color={k.color}>{k.label}</Badge>
                      {b.required && <Badge>Obligatorio</Badge>}
                      {b.dlc && <Badge color={C.dlc}>DLC</Badge>}
                    </Row>
                    <T dim style={{ fontSize: 12 }}>{b.place} · <Text style={{ fontStyle: 'italic' }}>{b.en}</Text></T>
                    {at && <Text style={{ color: alpha(C.gold500, 0.9), fontSize: 12 }}>Derrotado el {dateFmt.format(at)}</Text>}
                  </View>
                </Row>
              )
            })}
          </View>
        )
      })}
      {regions.length === 0 && <Panel><T muted style={{ textAlign: 'center' }}>Ningún jefe coincide con estos filtros.</T></Panel>}
    </View>
  )
}

// ---- Diario ---------------------------------------------------------------
const dayFmt = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' })
const timeFmt = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' })
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function JournalTab({ tasks }: { tasks: Task[] }) {
  const { run } = useActiveRun()
  const entries = useMemo(() => {
    if (!run) return []
    const taskById = new Map(tasks.map((t) => [t.id, t]))
    const bossByKey = new Map(BOSSES.map((b) => [bossKey(b), b]))
    return Object.entries(run.done).map(([key, at]) => {
      const boss = bossByKey.get(key)
      if (boss) return { key, at, title: boss.name, kind: 'boss' as const, detail: `${BOSS_KIND[boss.kind].label} · ${boss.place}` }
      const t = taskById.get(key)
      if (!t) return null
      return { key, at, title: t.title, kind: t.kind === 'main' ? 'main' as const : 'task' as const, detail: t.group }
    }).filter((e): e is NonNullable<typeof e> => !!e).sort((a, b) => b.at - a.at)
  }, [run, tasks])
  if (!run) return null
  if (!entries.length) return <Panel><T muted>Todavía no has marcado nada. Cada tarea, paso o jefe que completes aparecerá aquí con su fecha.</T></Panel>

  const days = new Map<string, typeof entries>()
  for (const e of entries) {
    const k = new Date(e.at).toDateString()
    days.set(k, [...(days.get(k) ?? []), e])
  }
  const bosses = entries.filter((e) => e.kind === 'boss').length
  return (
    <View style={{ gap: 12 }}>
      <Row>
        <Stat label="Hitos" value={String(entries.length)} />
        <Stat label="Jefes" value={String(bosses)} />
        <Stat label="Días" value={String(days.size)} />
      </Row>
      {[...days.entries()].map(([k, list]) => (
        <Panel key={k}>
          <Eyebrow>{cap(dayFmt.format(list[0].at))}</Eyebrow>
          {list.map((e) => (
            <Row key={e.key} gap={10} style={{ alignItems: 'flex-start' }}>
              <Text style={{ color: C.parch400, fontSize: 12, width: 42 }}>{timeFmt.format(e.at)}</Text>
              {e.kind === 'boss' ? <Skull size={14} color="#e0614f" /> : e.kind === 'main' ? <Sparkles size={14} color={C.gold400} /> : <View style={{ width: 14 }} />}
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.parch100, fontSize: 14 }}>{e.title}</Text>
                {e.detail && <Text style={{ color: C.parch400, fontSize: 12 }}>{e.detail}</Text>}
              </View>
            </Row>
          ))}
        </Panel>
      ))}
    </View>
  )
}
