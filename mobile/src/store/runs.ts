/** Partidas: misma lógica que la web (../src/store/runs.ts), guardadas con AsyncStorage. */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMemo } from 'react'
import { CLASS_BY_ID } from '@shared/data/classes'
import { BUILD_BY_ID } from '@shared/data/builds'
import type { Run, Stats } from '@shared/data/types'
import { buildTasks } from '@shared/lib/plan'
import { levelFromStats } from '@shared/lib/stats'

interface RunsState {
  runs: Run[]
  activeId: string | null
  createRun: (input: { name: string; buildId: string; classId: string; setupEnabled: boolean; dlcEnabled: boolean }) => string
  deleteRun: (id: string) => void
  renameRun: (id: string, name: string) => void
  duplicateRun: (id: string) => string | null
  /** Sustituye o fusiona partidas desde una copia de seguridad; devuelve cuántas se importaron */
  importBackup: (data: unknown, mode: 'merge' | 'replace') => number
  setActive: (id: string) => void
  toggleTask: (taskId: string) => void
  setStats: (stats: Stats) => void
  updateRun: (patch: Partial<Run>) => void
  hideTask: (taskId: string) => void
  /** Marcadores del mapa encontrados, por partida ('_free' sin partida activa) */
  found: Record<string, Record<string, number>>
  toggleFound: (markerId: string) => void
  setFoundMany: (ids: string[], value: boolean) => void
}

const uid = () => Math.random().toString(36).slice(2, 10)

export const useRuns = create<RunsState>()(
  persist(
    (set, get) => ({
      runs: [],
      activeId: null,
      createRun: ({ name, buildId, classId, setupEnabled, dlcEnabled }) => {
        const cls = CLASS_BY_ID[classId]
        const id = uid()
        const run: Run = {
          id, name, buildId, classId, setupEnabled, dlcEnabled,
          createdAt: Date.now(), updatedAt: Date.now(),
          done: {}, level: cls.level, stats: { ...cls.stats }, ng: 0, notes: '', hiddenTasks: [],
        }
        set({ runs: [run, ...get().runs], activeId: id })
        return id
      },
      deleteRun: (id) => {
        const runs = get().runs.filter((r) => r.id !== id)
        const { [id]: _removed, ...found } = get().found // eslint-disable-line @typescript-eslint/no-unused-vars
        set({ runs, found, activeId: get().activeId === id ? runs[0]?.id ?? null : get().activeId })
      },
      renameRun: (id, name) => {
        const clean = name.trim()
        if (!clean) return
        set({ runs: get().runs.map((r) => (r.id === id ? { ...r, name: clean, updatedAt: Date.now() } : r)) })
      },
      duplicateRun: (id) => {
        const src = get().runs.find((r) => r.id === id)
        if (!src) return null
        const copy: Run = { ...(JSON.parse(JSON.stringify(src)) as Run), id: uid(), name: `${src.name} (copia)`, createdAt: Date.now(), updatedAt: Date.now() }
        const found = get().found[id]
        set({ runs: [copy, ...get().runs], found: found ? { ...get().found, [copy.id]: { ...found } } : get().found })
        return copy.id
      },
      importBackup: (data, mode) => {
        const b = parseBackup(data)
        if (!b) return -1
        if (mode === 'replace') {
          set({ runs: b.runs, found: b.found, activeId: b.runs[0]?.id ?? null })
          return b.runs.length
        }
        // Fusionar: las partidas con el mismo id se sustituyen por la versión más reciente
        const cur = new Map(get().runs.map((r) => [r.id, r]))
        let n = 0
        for (const r of b.runs) {
          const prev = cur.get(r.id)
          if (!prev || prev.updatedAt <= r.updatedAt) { cur.set(r.id, r); n++ }
        }
        const found = { ...get().found }
        for (const [k, v] of Object.entries(b.found)) found[k] = { ...(found[k] ?? {}), ...v }
        const runs = [...cur.values()].sort((a, z) => z.updatedAt - a.updatedAt)
        set({ runs, found, activeId: get().activeId ?? runs[0]?.id ?? null })
        return n
      },
      setActive: (id) => set({ activeId: id }),
      toggleTask: (taskId) => mutateActive(set, get, (r) => {
        const done = { ...r.done }
        if (done[taskId]) delete done[taskId]
        else done[taskId] = Date.now()
        return { done }
      }),
      setStats: (stats) => mutateActive(set, get, () => ({ stats, level: levelFromStats(stats) })),
      updateRun: (patch) => mutateActive(set, get, () => patch),
      hideTask: (taskId) => mutateActive(set, get, (r) => ({ hiddenTasks: [...(r.hiddenTasks ?? []), taskId] })),
      found: {},
      toggleFound: (markerId) => {
        const key = get().activeId ?? '_free'
        const cur = { ...(get().found[key] ?? {}) }
        if (cur[markerId]) delete cur[markerId]
        else cur[markerId] = Date.now()
        set({ found: { ...get().found, [key]: cur } })
      },
      setFoundMany: (ids, value) => {
        const key = get().activeId ?? '_free'
        const cur = { ...(get().found[key] ?? {}) }
        for (const id of ids) { if (value) cur[id] = cur[id] ?? Date.now(); else delete cur[id] }
        set({ found: { ...get().found, [key]: cur } })
      },
    }),
    { name: 'sendero-de-gracia', version: 1, storage: createJSONStorage(() => AsyncStorage) },
  ),
)

// ---- Copia de seguridad -------------------------------------------------
export const BACKUP_FORMAT = 'sendero-de-gracia/backup'

export function makeBackup() {
  const { runs, found } = useRuns.getState()
  return { format: BACKUP_FORMAT, version: 1, exportedAt: new Date().toISOString(), runs, found }
}

function parseBackup(data: unknown): { runs: Run[]; found: Record<string, Record<string, number>> } | null {
  if (!data || typeof data !== 'object') return null
  const d = data as { format?: string; runs?: unknown; found?: unknown; state?: { runs?: unknown; found?: unknown } }
  // Acepta el formato propio y también el volcado crudo de localStorage de zustand
  const src = d.format === BACKUP_FORMAT ? d : d.state ?? d
  if (!Array.isArray(src.runs)) return null
  const runs = (src.runs as Run[]).filter((r) => r && typeof r.id === 'string' && typeof r.buildId === 'string' && CLASS_BY_ID[r.classId] && r.done && typeof r.done === 'object')
    .map((r) => ({ ...r, hiddenTasks: r.hiddenTasks ?? [], notes: r.notes ?? '', updatedAt: r.updatedAt ?? Date.now() }))
  const found = src.found && typeof src.found === 'object' ? (src.found as Record<string, Record<string, number>>) : {}
  return { runs, found }
}

type Setter = (p: Partial<RunsState>) => void
function mutateActive(set: Setter, get: () => RunsState, fn: (r: Run) => Partial<Run>) {
  const { runs, activeId } = get()
  set({ runs: runs.map((r) => (r.id === activeId ? { ...r, ...fn(r), updatedAt: Date.now() } : r)) })
}

const EMPTY: Record<string, number> = {}
export function useFound() {
  return useRuns((s) => s.found?.[s.activeId ?? '_free'] ?? EMPTY)
}

export function useActiveRun() {
  const run = useRuns((s) => s.runs.find((r) => r.id === s.activeId) ?? null)
  const build = run ? BUILD_BY_ID[run.buildId] : undefined
  const tasks = useMemo(() => (run ? buildTasks(build, run.setupEnabled, run.dlcEnabled) : []), [run?.buildId, run?.setupEnabled, run?.dlcEnabled]) // eslint-disable-line react-hooks/exhaustive-deps
  return { run, build, tasks }
}
