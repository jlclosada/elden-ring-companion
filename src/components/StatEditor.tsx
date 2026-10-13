import { Minus, Plus } from 'lucide-react'
import { STAT_KEYS, STAT_META } from '../data/classes'
import type { Build, Stats } from '../data/types'
import { checkpointStats, levelFromStats, nextAllocation, runeCost, runesBetween, softCapStatus } from '../lib/stats'
import { Badge, Panel, cx } from './ui'

export function StatEditor({ stats, base, onChange, build, classId }: { stats: Stats; base: Stats; onChange: (s: Stats) => void; build?: Build; classId: string }) {
  const level = levelFromStats(stats)
  const next = build ? nextAllocation(build, classId, stats) : null
  const set = (k: keyof Stats, v: number) => onChange({ ...stats, [k]: Math.max(base[k], Math.min(99, v)) })

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Panel className="p-5">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-parch-400">Nivel</div>
            <div className="font-display text-4xl text-gold-gradient">{level}</div>
          </div>
          <div className="text-right text-xs text-parch-400">
            Siguiente nivel: <b className="text-parch-200">{runeCost(level).toLocaleString('es')}</b> runas
          </div>
        </div>
        <div className="space-y-3">
          {STAT_KEYS.map((k) => {
            const m = STAT_META[k]
            const v = stats[k]
            const cap = softCapStatus(k, v)
            const target = next?.target[k]
            const prio = next?.missing.indexOf(k)
            return (
              <div key={k} className="grid grid-cols-[68px_1fr_auto] items-center gap-3">
                <div>
                  <div className="text-xs font-semibold" style={{ color: m.color }}>{m.short}</div>
                  <div className="text-[10px] text-parch-400">{m.label}</div>
                </div>
                <div className="relative">
                  <input type="range" min={base[k]} max={99} value={v} onChange={(e) => set(k, +e.target.value)} className="w-full" aria-label={m.label} />
                  <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-2">
                    {m.caps.map((c) => (
                      <span key={c} className="absolute h-2 w-px bg-white/25" style={{ left: `${((c - base[k]) / (99 - base[k])) * 100}%` }} title={`Umbral ${c}`} />
                    ))}
                    {target && target > v && (
                      <span className="absolute -top-0.5 size-2 -translate-x-1 rounded-full bg-gold-400" style={{ left: `${((target - base[k]) / (99 - base[k])) * 100}%` }} title={`Objetivo ${target}`} />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => set(k, v - 1)} className="grid size-7 place-items-center rounded-md bg-white/5 text-parch-300 hover:bg-white/10" aria-label={`Bajar ${m.label}`}><Minus size={13} /></button>
                  <div className={cx('w-8 text-center font-display text-lg', prio === 0 ? 'text-gold-300' : 'text-parch-100')}>{v}</div>
                  <button onClick={() => set(k, v + 1)} className="grid size-7 place-items-center rounded-md bg-white/5 text-parch-300 hover:bg-white/10" aria-label={`Subir ${m.label}`}><Plus size={13} /></button>
                  {cap.next && v >= cap.next - 3 && <span className="hidden w-14 text-[10px] text-parch-400 sm:block">umbral {cap.next}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      {build && (
        <div className="space-y-4">
          <Panel className="p-5">
            <div className="text-[11px] uppercase tracking-[0.2em] text-parch-400">Siguiente punto</div>
            {next ? (
              <>
                <div className="mt-1 font-display text-xl text-parch-100">Objetivo ≈ nivel {next.levelTarget}</div>
                {next.checkpoint.note && <div className="text-sm text-gold-300">{next.checkpoint.note}</div>}
                <div className="mt-2 text-xs text-parch-400">{runesBetween(level, next.levelTarget).toLocaleString('es')} runas para llegar</div>
                <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-parch-400">Sube en este orden</div>
                <ol className="mt-2 space-y-1.5">
                  {next.missing.map((k, i) => (
                    <li key={k} className="flex items-center justify-between rounded-lg bg-white/[.03] px-3 py-2 text-sm">
                      <span className="flex items-center gap-2"><span className="text-parch-400">{i + 1}.</span><span style={{ color: STAT_META[k].color }}>{STAT_META[k].label}</span></span>
                      <span className="text-parch-200">{stats[k]} → <b>{next.target[k]}</b></span>
                    </li>
                  ))}
                </ol>
              </>
            ) : <div className="mt-2 text-sm text-moss-400">Has completado todos los puntos de control. ¡Build terminada!</div>}
          </Panel>
          <Panel className="p-5">
            <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-parch-400">Puntos de control de {build.name}</div>
            <div className="space-y-2">
              {build.checkpoints.map((cp) => {
                const t = checkpointStats(classId, cp.stats)
                const reached = STAT_KEYS.every((k) => stats[k] >= t[k])
                return (
                  <div key={cp.level} className={cx('rounded-lg border px-3 py-2', reached ? 'border-moss-400/30 bg-moss-400/5' : 'border-white/5')}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-parch-100">Nivel ≈ {levelFromStats(t)}</span>
                      {reached && <Badge color="#8fbf7a">Alcanzado</Badge>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-parch-400">
                      {STAT_KEYS.filter((k) => cp.stats[k]).map((k) => <span key={k}>{STAT_META[k].short} {t[k]}</span>)}
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
