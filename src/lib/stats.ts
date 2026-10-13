import { CLASS_BY_ID, STAT_KEYS, STAT_META } from '../data/classes'
import type { Build, StatKey, Stats } from '../data/types'

export const levelFromStats = (s: Stats) => STAT_KEYS.reduce((a, k) => a + s[k], 0) - 79

/** Coste en runas de pasar del nivel `lvl` al siguiente (fórmula oficial). */
export function runeCost(lvl: number) {
  const x = lvl + 81
  return Math.floor((Math.max(0, x - 92) * 0.02 + 0.1) * x * x) + 1
}

export function runesBetween(from: number, to: number) {
  let total = 0
  for (let l = from; l < to; l++) total += runeCost(l)
  return total
}

/** Rellena un checkpoint parcial con las estadísticas base de la clase. */
export function checkpointStats(classId: string, partial: Partial<Stats>): Stats {
  const base = CLASS_BY_ID[classId]?.stats ?? CLASS_BY_ID.wretch.stats
  const out = { ...base }
  for (const k of STAT_KEYS) if (partial[k] !== undefined) out[k] = Math.max(base[k], partial[k]!)
  return out
}

/** Siguiente checkpoint todavía no alcanzado y qué subir a continuación. */
export function nextAllocation(build: Build, classId: string, current: Stats) {
  for (const cp of build.checkpoints) {
    const target = checkpointStats(classId, cp.stats)
    const missing = STAT_KEYS.filter((k) => current[k] < target[k])
    if (missing.length) {
      // Prioriza según el orden de la build y la distancia relativa al objetivo
      const ranked = [...missing].sort((a, b) => {
        const pa = build.primary.indexOf(a), pb = build.primary.indexOf(b)
        const ra = (target[a] - current[a]) / target[a], rb = (target[b] - current[b]) / target[b]
        const wa = (pa === -1 ? 9 : pa) - ra * 4, wb = (pb === -1 ? 9 : pb) - rb * 4
        return wa - wb
      })
      return { checkpoint: cp, target, missing: ranked, levelTarget: levelFromStats(target) }
    }
  }
  return null
}

export function softCapStatus(k: StatKey, v: number) {
  const caps = STAT_META[k].caps
  const passed = caps.filter((c) => v >= c).length
  return { passed, next: caps[passed] ?? null }
}

export type Req = Record<string, number>
/** Comprueba requisitos de un arma/hechizo del compendio contra unas estadísticas. */
export function meetsRequirements(req: Req | undefined, s: Stats, twoHand = false) {
  if (!req) return { ok: true, missing: [] as { stat: string; need: number; have: number }[] }
  const map: Record<string, StatKey> = { Str: 'str', Dex: 'dex', Int: 'int', Fai: 'fai', Arc: 'arc', Intelligence: 'int', Faith: 'fai', Arcane: 'arc', Strength: 'str', Dexterity: 'dex' }
  const missing: { stat: string; need: number; have: number }[] = []
  for (const [k, need] of Object.entries(req)) {
    const key = map[k]
    if (!key || !need) continue
    let have = s[key]
    if (key === 'str' && twoHand) have = Math.floor(have * 1.5)
    if (have < need) missing.push({ stat: key, need, have })
  }
  return { ok: missing.length === 0, missing }
}

// Niveles de mejora de armas aproximados recomendados por nivel de personaje
export function recommendedUpgrade(level: number) {
  const table: [number, number, number][] = [[20, 3, 1], [35, 6, 3], [50, 9, 4], [70, 12, 5], [90, 15, 6], [110, 18, 7], [130, 22, 8], [999, 25, 10]]
  const row = table.find((r) => level <= r[0])!
  return { regular: row[1], somber: row[2] }
}
