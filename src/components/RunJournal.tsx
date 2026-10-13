import { useMemo, type ReactNode } from 'react'
import { CalendarDays, Clock, Flame, Skull, Trophy } from 'lucide-react'
import { useActiveRun } from '../store/runs'
import { BOSSES, BOSS_KIND, bossKey } from '../data/bosses'
import type { Task } from '../data/types'
import { Badge, Panel, SectionTitle } from './ui'

interface Entry { key: string; at: number; title: string; kind: 'boss' | 'main' | 'task'; detail?: string }

/** Dos hitos separados por más de esto pertenecen a sesiones distintas */
const SESSION_GAP = 3 * 60 * 60 * 1000
const dayFmt = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' })
const timeFmt = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' })
const shortFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })
const dayKey = (t: number) => new Date(t).toDateString()
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function RunJournal({ tasks }: { tasks: Task[] }) {
  const { run } = useActiveRun()

  const entries = useMemo<Entry[]>(() => {
    if (!run) return []
    const taskById = new Map(tasks.map((t) => [t.id, t]))
    const bossByKey = new Map(BOSSES.map((b) => [bossKey(b), b]))
    return Object.entries(run.done).map(([key, at]) => {
      const boss = bossByKey.get(key)
      if (boss) return { key, at, title: boss.name, kind: 'boss' as const, detail: `${BOSS_KIND[boss.kind].label} · ${boss.place}` }
      const t = taskById.get(key)
      return { key, at, title: t?.title ?? key, kind: t?.kind === 'main' ? 'main' as const : 'task' as const, detail: t?.group }
    }).sort((a, b) => a.at - b.at)
  }, [run, tasks])

  if (!run) return null
  if (!entries.length) {
    return <Panel className="p-8 text-center text-sm text-parch-300">Todavía no has marcado nada en esta partida. Cada tarea y cada jefe que completes quedará registrado aquí con su fecha.</Panel>
  }

  // Sesiones: hitos consecutivos separados por menos de SESSION_GAP
  const sessions: Entry[][] = []
  for (const e of entries) {
    const last = sessions.at(-1)
    if (last && e.at - last.at(-1)!.at < SESSION_GAP) last.push(e)
    else sessions.push([e])
  }
  const days = new Set(entries.map((e) => dayKey(e.at))).size
  const bosses = entries.filter((e) => e.kind === 'boss')
  const best = sessions.reduce((m, s) => (s.length > m.length ? s : m), sessions[0])
  const playedMs = sessions.reduce((n, s) => n + Math.max(0, s.at(-1)!.at - s[0].at), 0)

  // Racha: días seguidos (hasta hoy o hasta el último día jugado) con algún progreso
  const daySet = new Set(entries.map((e) => dayKey(e.at)))
  let streak = 0
  for (let d = new Date(entries.at(-1)!.at); daySet.has(d.toDateString()); d.setDate(d.getDate() - 1)) streak++

  // Agrupar por día, del más reciente al más antiguo
  const byDay = new Map<string, Entry[]>()
  for (const e of [...entries].reverse()) {
    const k = dayKey(e.at)
    byDay.set(k, [...(byDay.get(k) ?? []), e])
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Stat icon={<CalendarDays size={15} />} label="Días jugados" value={days} />
        <Stat icon={<Clock size={15} />} label="Sesiones" value={sessions.length} sub={playedMs > 0 ? `~${Math.round(playedMs / 3600000)} h registradas` : undefined} />
        <Stat icon={<Skull size={15} />} label="Jefes caídos" value={bosses.length} />
        <Stat icon={<Trophy size={15} />} label="Mejor sesión" value={best.length} sub={`hitos el ${shortFmt.format(best[0].at)}`} />
        <Stat icon={<Flame size={15} />} label="Racha" value={streak} sub={streak === 1 ? 'día' : 'días seguidos'} />
      </div>

      <Panel className="p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-display text-parch-100">Progreso acumulado</h3>
          <span className="text-xs text-parch-400">{shortFmt.format(entries[0].at)} — {shortFmt.format(entries.at(-1)!.at)}</span>
        </div>
        <ProgressChart entries={entries} />
      </Panel>

      <div>
        <SectionTitle>Crónica</SectionTitle>
        <ol className="relative space-y-6 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-white/10">
          {[...byDay.entries()].map(([k, list]) => (
            <li key={k} className="relative pl-7">
              <span className="absolute left-0 top-1.5 size-[15px] rounded-full border-2 border-gold-500 bg-ink-950" />
              <div className="mb-2 font-display text-sm text-gold-300">{cap(dayFmt.format(list[0].at))} <span className="ml-1 font-sans text-xs normal-case text-parch-400">· {list.length} {list.length === 1 ? 'hito' : 'hitos'}</span></div>
              <div className="space-y-1.5">
                {list.map((e) => (
                  <div key={e.key} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[.02] px-3 py-2">
                    <span className="w-11 shrink-0 pt-0.5 text-xs tabular-nums text-parch-400">{timeFmt.format(e.at)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-parch-100">{e.title}</span>
                        {e.kind === 'boss' && <Badge color="#e0614f">Jefe</Badge>}
                        {e.kind === 'main' && <Badge color="#e6c56f">Camino principal</Badge>}
                      </div>
                      {e.detail && <div className="text-xs text-parch-400">{e.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, sub }: { icon: ReactNode; label: string; value: number; sub?: string }) {
  return (
    <Panel className="p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-parch-400">{icon}{label}</div>
      <div className="mt-1 font-display text-2xl text-parch-100">{value}</div>
      {sub && <div className="text-xs text-parch-400">{sub}</div>}
    </Panel>
  )
}

/** Curva escalonada del número de hitos acumulados en el tiempo; los jefes se marcan con un punto rojo. */
function ProgressChart({ entries }: { entries: Entry[] }) {
  const W = 720, H = 160, P = 8
  const t0 = entries[0].at, t1 = Math.max(entries.at(-1)!.at, t0 + 1)
  const x = (t: number) => P + ((t - t0) / (t1 - t0)) * (W - P * 2)
  const y = (n: number) => H - P - (n / entries.length) * (H - P * 2)
  let d = `M ${x(t0)} ${y(0)}`
  entries.forEach((e, i) => { d += ` H ${x(e.at)} V ${y(i + 1)}` })
  const area = `${d} H ${x(t1)} V ${y(0)} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full" role="img" aria-label={`Progreso: ${entries.length} hitos completados`}>
      <defs>
        <linearGradient id="journalFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e6c56f" stopOpacity=".35" /><stop offset="1" stopColor="#e6c56f" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={P} x2={W - P} y1={y(entries.length * f)} y2={y(entries.length * f)} stroke="rgba(255,255,255,.06)" />)}
      <path d={area} fill="url(#journalFill)" />
      <path d={d} fill="none" stroke="#e6c56f" strokeWidth="2" strokeLinejoin="round" />
      {entries.map((e, i) => e.kind === 'boss' && (
        <circle key={e.key} cx={x(e.at)} cy={y(i + 1)} r="3.5" fill="#e0614f" stroke="#12100d" strokeWidth="1.5"><title>{e.title}</title></circle>
      ))}
    </svg>
  )
}
