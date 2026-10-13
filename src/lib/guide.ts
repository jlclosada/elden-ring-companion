import { BUILD_PLANS, CHAPTERS, CHAPTER_BY_ID, CHAPTER_ORDER, SPINE, type ChapterId, type GuideStep, type Loadout, type Ref } from '../data/guide'
import { CLASS_BY_ID, STAT_KEYS } from '../data/classes'
import type { Run, Stats } from '../data/types'
import { checkpointStats, levelFromStats, runesBetween } from './stats'

export interface PrepInfo {
  chapter: ChapterId
  target: Stats
  level: number
  loadout: Loadout
  changed: string[]
  upgrades: { ref: Ref; from: number; to: number; stone: 'smithing' | 'somber'; cost: { name: string; qty: number }[] }[]
  stones: string
  farm?: string
}

export interface ResolvedStep extends GuideStep {
  prep?: PrepInfo
  index: number
}

/** Antes de qué jefe va el paso de preparación de cada capítulo */
const PREP_BEFORE: Partial<Record<ChapterId, string>> = {
  limgrave: 'g-margit', stormveil: 'g-godrick', liurnia: 'g-rennala', caelid: 'g-radahn', altus: 'g-rykard',
  leyndell: 'g-morgott', giants: 'g-fire-giant', endgame: 'g-farum', dlc: 'g-dlc-lion',
}
const BOSS_NAME: Partial<Record<ChapterId, string>> = {
  setup: 'el camino principal', limgrave: 'Margit', stormveil: 'Godrick', liurnia: 'Rennala', caelid: 'Radahn', altus: 'Rykard',
  leyndell: 'Morgott', giants: 'el Gigante de Fuego', endgame: 'Farum Azula', dlc: 'el León Danzante',
}

export function hasGuide(buildId: string) {
  return Boolean(BUILD_PLANS[buildId])
}

/** Equipo acumulado hasta un capítulo */
export function loadoutAt(buildId: string, chapter: ChapterId): Loadout | null {
  const plan = BUILD_PLANS[buildId]
  if (!plan) return null
  let acc: Partial<Loadout> = {}
  for (const ch of CHAPTER_ORDER) {
    if (plan.loadouts[ch]) acc = { ...acc, ...plan.loadouts[ch] }
    if (ch === chapter) break
  }
  return acc.weapon ? (acc as Loadout) : null
}

function diffLoadout(prev: Loadout | null, next: Loadout): string[] {
  if (!prev) return ['weapon', 'spells', 'talismans', 'spirit']
  const keys: (keyof Loadout)[] = ['weapon', 'affinity', 'ash', 'offhand', 'catalyst', 'spells', 'talismans', 'spirit', 'tear', 'twoHand']
  return keys.filter((k) => JSON.stringify(prev[k]) !== JSON.stringify(next[k]))
}

export function buildGuide(buildId: string, classId: string, dlcEnabled: boolean): ResolvedStep[] {
  const plan = BUILD_PLANS[buildId]
  if (!plan) return []
  const out: GuideStep[] = []
  let prevLoadout: Loadout | null = null
  const reached = new Map<string, number>()

  for (const chId of CHAPTER_ORDER) {
    const ch = CHAPTER_BY_ID[chId]
    if (ch.dlc && !dlcEnabled) continue
    const spine = SPINE.filter((s) => s.chapter === chId)
    const own = plan.steps.filter((s) => s.chapter === chId)
    const slot = (name: string) => own.filter((s) => (s.slot ?? 'end') === name)
    const list: GuideStep[] = []

    // Inicio del capítulo
    if (chId === 'setup') {
      list.push({ id: `${buildId}-start`, chapter: 'setup', kind: 'tip', title: 'Crea tu personaje', fight: 'ninguno', how: plan.start })
      list.push(...spine.filter((s) => s.id === 'g-start' || s.id === 'g-torrent'))
      list.push(...slot('start'))
      for (const s of spine.filter((s) => s.id !== 'g-start' && s.id !== 'g-torrent')) {
        if (s.id === 'g-trap') list.push(...slot('beforeTrap'))
        list.push(s)
        if (s.id === 'g-trap') list.push(...slot('afterTrap'))
      }
    } else {
      list.push(...slot('start'), ...spine)
    }

    // Paso de preparación (nivel + mejora + equipo) antes del jefe del capítulo
    const loadout = loadoutAt(buildId, chId)!
    const target = checkpointStats(classId, plan.levels[chId] ?? {})
    const upgrades: PrepInfo['upgrades'] = []
    const addUpgrade = (ref: Ref, stone: 'smithing' | 'somber') => {
      const to = ch.upgrade[stone === 'somber' ? 'somber' : 'regular']
      const from = reached.get(ref.name) ?? 0
      reached.set(ref.name, Math.max(from, to))
      upgrades.push({ ref, from, to, stone, cost: stoneCost(stone, from, to) })
    }
    addUpgrade(loadout.weapon, loadout.stone)
    if (loadout.catalyst && loadout.upgradeCatalyst !== false) addUpgrade(loadout.catalyst, loadout.catalystStone ?? 'somber')
    const prep: GuideStep & { prep: PrepInfo } = {
      id: `${buildId}-prep-${chId}`, chapter: chId, kind: 'prep', fight: 'ninguno',
      title: chId === 'setup' ? 'Gasta las runas: nivel, mejora y equipo' : `Prepárate para ${BOSS_NAME[chId]}: nivel, mejora y equipo`,
      how: [
        'Sube de nivel en cualquier lugar de gracia (opción «Subir de nivel» tras hablar con Melina).',
        'Mejora con el herrero Hewg en la Mesa Redonda.',
        'Equípate en el menú de equipo y aplica cenizas/afinidades en un lugar de gracia (necesitas el Cuchillo de afilar).',
      ],
      prep: { chapter: chId, target, level: levelFromStats(target), loadout, changed: diffLoadout(prevLoadout, loadout), upgrades, stones: ch.stones, farm: ch.farm },
    }
    prevLoadout = loadout

    // Pasos propios de final de capítulo + preparación antes del jefe
    const end = [...slot('end'), ...slot('beforeBoss')]
    const before = PREP_BEFORE[chId]
    const idx = before ? list.findIndex((s) => s.id === before) : -1
    if (idx >= 0) list.splice(idx, 0, ...end, prep)
    else list.push(...end, prep)
    out.push(...list)
  }
  return out.map((s, index) => ({ ...s, index }))
}

/** Piedras necesarias para pasar un arma de +from a +to */
export function stoneCost(stone: 'smithing' | 'somber', from: number, to: number) {
  const acc = new Map<string, number>()
  for (let n = from; n < to; n++) {
    let name: string, qty: number
    if (stone === 'somber') {
      name = n + 1 === 10 ? 'Somber Ancient Dragon Smithing Stone' : `Somber Smithing Stone [${n + 1}]`
      qty = 1
    } else if (n + 1 === 25) {
      name = 'Ancient Dragon Smithing Stone'; qty = 1
    } else {
      name = `Smithing Stone [${Math.floor(n / 3) + 1}]`
      qty = ((n % 3) + 1) * 2
    }
    acc.set(name, (acc.get(name) ?? 0) + qty)
  }
  return [...acc].map(([name, qty]) => ({ name, qty }))
}

export const stepKey = (id: string) => `g:${id}`

export function isStepDone(run: Run, step: GuideStep) {
  if (run.done[stepKey(step.id)]) return true
  // Un paso queda hecho si todas sus tareas de la checklist están hechas
  return Boolean(step.taskIds?.length && step.taskIds.every((t) => run.done[t]))
}

export function currentStep(run: Run, steps: ResolvedStep[]) {
  return steps.find((s) => !isStepDone(run, s)) ?? null
}

export function guideProgress(run: Run, steps: ResolvedStep[]) {
  const done = steps.filter((s) => isStepDone(run, s)).length
  return { done, total: steps.length, pct: steps.length ? done / steps.length : 0 }
}

/** Cambios de atributos necesarios desde las stats actuales */
export function statDelta(current: Stats, target: Stats) {
  const rows = STAT_KEYS.filter((k) => target[k] > current[k]).map((k) => ({ k, from: current[k], to: target[k], add: target[k] - current[k] }))
  const level = levelFromStats(current)
  const nextLevel = level + rows.reduce((a, r) => a + r.add, 0)
  return { rows, level, nextLevel, runes: runesBetween(level, nextLevel) }
}

export function planClass(buildId: string) {
  const id = BUILD_PLANS[buildId]?.classId
  return id ? CLASS_BY_ID[id] : undefined
}

export { CHAPTERS, CHAPTER_BY_ID }
