import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ChevronDown, AlertTriangle, EyeOff } from 'lucide-react'
import type { Task } from '../data/types'
import { LOCATION_BY_ID } from '../data/locations'
import { REGION_BY_ID } from '../data/regions'
import { useRuns, useActiveRun } from '../store/runs'
import { Badge, Check, cx } from './ui'
import { RefDetail, RefThumb } from './ItemCard'

const KIND_LABEL: Record<Task['kind'], { label: string; color: string }> = {
  main: { label: 'Principal', color: '#e6c56f' },
  boss: { label: 'Jefe', color: '#e0614f' },
  item: { label: 'Objeto', color: '#6fc3a3' },
  upgrade: { label: 'Mejora', color: '#5fd3e0' },
  key: { label: 'Clave', color: '#c0a8ff' },
  npc: { label: 'PNJ', color: '#7fb1e8' },
  shortcut: { label: 'Atajo', color: '#c0c7d1' },
  dungeon: { label: 'Mazmorra', color: '#a38bd6' },
}

export function TaskRow({ task, reasons, warning, index, compact }: { task: Task; reasons?: string[]; warning?: string; index?: number; compact?: boolean }) {
  const { run } = useActiveRun()
  const toggle = useRuns((s) => s.toggleTask)
  const hide = useRuns((s) => s.hideTask)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(false)
  const done = Boolean(run?.done[task.id])
  const loc = task.location ? LOCATION_BY_ID[task.location] : undefined
  const region = loc ? REGION_BY_ID[loc.region] : undefined
  const kind = KIND_LABEL[task.kind]

  return (
    <div className={cx('group rounded-xl border border-white/5 bg-white/[.02] transition hover:border-white/10', done && 'opacity-55')}>
      <div className="flex items-start gap-3 p-3">
        {index !== undefined ? (
          <div className="grid size-6 shrink-0 place-items-center rounded-full bg-gold-500/15 font-display text-xs text-gold-300">{index + 1}</div>
        ) : null}
        <Check checked={done} onChange={() => toggle(task.id)} label={task.title} />
        {task.ref && !compact && (
          <button onClick={() => setDetail(true)} className="shrink-0" aria-label={`Ver ${task.ref.name}`}>
            <RefThumb cat={task.ref.cat} name={task.ref.name} size={40} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cx('text-sm font-medium text-parch-100', done && 'line-through decoration-parch-400')}>{task.title}</span>
            {!compact && <Badge color={kind.color}>{kind.label}</Badge>}
            {task.required && !compact && <Badge color="#e6c56f">Obligatorio</Badge>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-parch-400">
            {loc && (
              <Link to={`/mapa?loc=${loc.id}`} className="inline-flex items-center gap-1 hover:text-gold-300">
                <MapPin size={12} />{loc.name}{region ? ` · ${region.nameEs}` : ''}
              </Link>
            )}
            {reasons?.map((r) => <span key={r} className="text-gold-500/90">• {r}</span>)}
          </div>
          {warning && <div className="mt-1 flex items-center gap-1 text-xs text-[#e9a25b]"><AlertTriangle size={12} />{warning}</div>}
          {open && task.detail && <p className="rise mt-2 text-sm leading-relaxed text-parch-300">{task.detail}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {reasons && (
            <button onClick={() => hide(task.id)} title="No recomendar" className="rounded p-1 text-parch-400 opacity-0 transition hover:bg-white/5 hover:text-parch-100 group-hover:opacity-100" aria-label="No recomendar más">
              <EyeOff size={14} />
            </button>
          )}
          {task.detail && (
            <button onClick={() => setOpen((o) => !o)} className="rounded p-1 text-parch-400 hover:bg-white/5 hover:text-parch-100" aria-label="Detalles">
              <ChevronDown size={16} className={cx('transition', open && 'rotate-180')} />
            </button>
          )}
        </div>
      </div>
      {detail && task.ref && <RefDetail cat={task.ref.cat} name={task.ref.name} onClose={() => setDetail(false)} stats={run?.stats} locationId={task.location} />}
    </div>
  )
}
