import { BUILD_BY_ID } from '../data/builds'
import { LOCATION_BY_ID } from '../data/locations'
import { UNIVERSAL_TASKS } from '../data/progression'
import { DLC_TASKS } from '../data/dlc'
import { PHASES, REGION_BY_ID } from '../data/regions'
import type { Build, Run, Tag, Task } from '../data/types'

/**
 * Construye la lista de tareas de una partida: tareas universales +
 * preparación específica de la build + equipo de la build.
 * Se deduplican tareas que apuntan al mismo objeto/ubicación.
 */
export function buildTasks(build: Build | undefined, setupEnabled: boolean, dlcEnabled = false): Task[] {
  const tasks: Task[] = UNIVERSAL_TASKS.map((t) => ({ ...t }))
  if (dlcEnabled) {
    // Todo el DLC queda bloqueado hasta entrar en el Reino de las Sombras
    for (const t of DLC_TASKS) tasks.push({ ...t, after: t.after ?? (t.id === 'dlc-enter' ? undefined : ['dlc-enter']) })
  }
  if (!build) return tasks
  const tagList = Object.keys(build.tags) as Tag[]

  if (setupEnabled) {
    for (const s of build.setup) tasks.push({ ...s, group: 'Preparación', tags: tagList })
  }

  const setupRefs = new Set(build.setup.map((s) => s.ref?.name).filter(Boolean))
  for (const g of build.gear) {
    if (setupEnabled && setupRefs.has(g.name)) continue
    if (g.stage === 'dlc' && !dlcEnabled) continue
    const id = `${build.id}:${slug(g.name)}`
    // Evita duplicar ítems que ya son tareas universales (p. ej. Mimic Tear)
    if (tasks.some((t) => t.ref?.name === g.name)) {
      const existing = tasks.find((t) => t.ref?.name === g.name)!
      existing.tags = Array.from(new Set([...existing.tags, ...tagList]))
      continue
    }
    tasks.push({
      id, title: g.name, kind: 'item', phase: g.phase, location: g.location, tags: tagList,
      detail: g.how, ref: { cat: g.cat, name: g.name }, group: 'Equipo de la build',
      ...(g.stage === 'dlc' ? { dlc: true, after: ['dlc-enter'] } : {}),
    })
  }
  return tasks
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export function isDone(run: Run, id: string) {
  return Boolean(run.done[id])
}

/** Fase actual: la mayor fase de cualquier tarea del camino principal completada. */
export function currentPhase(run: Run, tasks: Task[]) {
  const doneMain = tasks.filter((t) => !t.dlc && (t.kind === 'main' || t.required) && isDone(run, t.id))
  const byMain = doneMain.reduce((m, t) => Math.max(m, t.phase), 0)
  // Ajuste por nivel: si el jugador está sobrenivelado, abre la siguiente fase
  const byLevel = PHASES.filter((p) => p.id <= 10 && run.level >= p.levels[0] + 5).reduce((m, p) => Math.max(m, p.id), 0)
  return Math.min(10, Math.max(byMain, Math.min(byLevel, byMain + 1)))
}

/** Fase dentro del DLC (11-13), o null si aún no se ha entrado. */
export function dlcPhase(run: Run, tasks: Task[]) {
  if (!isDone(run, 'dlc-enter')) return null
  const done = tasks.filter((t) => t.dlc && t.kind === 'main' && isDone(run, t.id))
  const max = done.reduce((m, t) => Math.max(m, t.phase), 11)
  // Al terminar los jefes principales de una fase se abre la siguiente
  const pendingInMax = tasks.some((t) => t.dlc && t.kind === 'main' && t.phase === max && !isDone(run, t.id))
  return Math.min(13, pendingInMax ? max : max + 1)
}

export interface Recommendation {
  task: Task
  score: number
  reasons: string[]
  warning?: string
}

export function recommend(run: Run, tasks: Task[], limit = 8): Recommendation[] {
  const build = BUILD_BY_ID[run.buildId]
  const phase = currentPhase(run, tasks)
  const dPhase = dlcPhase(run, tasks) ?? 11
  const pending = tasks.filter((t) => !isDone(run, t.id) && !run.hiddenTasks?.includes(t.id))
  const nextMain = pending.filter((t) => t.kind === 'main').sort((a, b) => a.phase - b.phase)[0]
  const nextRegion = nextMain?.location ? LOCATION_BY_ID[nextMain.location]?.region : undefined

  // Tareas que desbloquean otras (p. ej. Torrent) suben de prioridad
  const unlocks = new Map<string, number>()
  for (const t of tasks) for (const a of t.after ?? []) unlocks.set(a, (unlocks.get(a) ?? 0) + 1)

  const recs: Recommendation[] = []
  for (const t of pending) {
    if (t.after?.some((id) => !isDone(run, id))) continue
    const ref = t.dlc ? dPhase : phase
    if (t.phase > ref + 1) continue

    const reasons: string[] = []
    let score = 0
    const loc = t.location ? LOCATION_BY_ID[t.location] : undefined
    const region = loc ? REGION_BY_ID[loc.region] : undefined

    if (t === nextMain) { score += 70; reasons.push('Siguiente paso del camino principal') }
    if (t.group === 'Preparación') { score += 55 + (phase === 0 ? 25 : 0); reasons.push('Preparación de la partida') }
    if (t.group === 'Equipo de la build') {
      const gear = build?.gear.find((g) => g.name === t.ref?.name)
      score += gear?.core ? 60 : 35
      reasons.push(gear?.core ? 'Pieza clave de tu build' : 'Mejora tu build')
    }
    if (t.group === 'Mejoras de frasco') { score += 40; reasons.push('Más frascos / potencia de curación') }
    if (t.group === 'Mejora de armas') { score += 30; reasons.push('Mejorar armas') }
    if (t.group === 'Cenizas de espíritu') { score += 32; reasons.push('Invocación muy útil') }
    if (t.group === 'Llaves y accesos') score += 25
    if (t.group === 'Jefes opcionales') score += 8
    const u = unlocks.get(t.id) ?? 0
    if (u) { score += 18 + Math.min(u, 4) * 4; reasons.push(t.id === 'dlc-enter' ? 'Abre Shadow of the Erdtree' : 'Desbloquea otras tareas') }

    // Afinidad de etiquetas con la build
    if (build) {
      const aff = t.tags.reduce((a, tag) => a + (tag === 'universal' ? 4 : build.tags[tag] ?? 0), 0)
      score += Math.min(aff, 8) * 4
    }

    // Distancia de fase
    if (t.phase < ref && t.phase >= 1) { score += 6; reasons.push('Pendiente de una zona anterior') }
    if (t.phase === ref + 1) score -= 22
    if (t.group === 'Bendición del Árbol Umbrío') { score += 45; reasons.push('Sube la Bendición del Árbol Umbrío') }
    if (t.dlc && t.group === 'Shadow of the Erdtree' && t.kind === 'main' && t !== nextMain) {
      const nextDlc = pending.filter((x) => x.dlc && x.kind === 'main').sort((a, b) => a.phase - b.phase)[0]
      if (t === nextDlc) { score += 60; reasons.push('Siguiente paso del DLC') }
    }

    // Cercanía a la región del siguiente paso
    if (nextRegion && loc?.region === nextRegion) { score += 10; reasons.push(`De camino (${REGION_BY_ID[nextRegion].nameEs})`) }

    let warning: string | undefined
    if (region && run.level < region.levels[0] - 5) {
      warning = `Zona de nivel ${region.levels[0]}-${region.levels[1]}: entra con cuidado`
      score -= Math.min(25, (region.levels[0] - run.level) * 0.8)
    }
    recs.push({ task: t, score, reasons: Array.from(new Set(reasons)), warning })
  }
  return recs.sort((a, b) => b.score - a.score).slice(0, limit)
}

export function progressStats(run: Run, tasks: Task[]) {
  const total = tasks.length
  const done = tasks.filter((t) => isDone(run, t.id)).length
  const main = tasks.filter((t) => t.kind === 'main')
  const mainDone = main.filter((t) => isDone(run, t.id)).length
  const build = tasks.filter((t) => t.group === 'Equipo de la build')
  const buildDone = build.filter((t) => isDone(run, t.id)).length
  return { total, done, pct: total ? done / total : 0, main: main.length, mainDone, build: build.length, buildDone }
}
