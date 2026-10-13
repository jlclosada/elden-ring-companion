import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Check as CheckIcon, ChevronsUpDown, Copy, Pencil, Plus } from 'lucide-react'
import { useRuns } from '../store/runs'
import { BUILD_BY_ID } from '../data/builds'
import { buildTasks, progressStats } from '../lib/plan'
import { ICONS, ProgressBar, cx } from './ui'

const timeAgo = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `hace ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.round(h / 24)} d`
}

/** Desplegable para cambiar de partida, renombrarla o duplicarla. */
export function RunSwitcher({ className }: { className?: string }) {
  const { runs, activeId, setActive, renameRun, duplicateRun } = useRuns()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const nav = useNavigate()
  const { pathname } = useLocation()
  const active = runs.find((r) => r.id === activeId)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) { setOpen(false); setEditing(null) } }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); setEditing(null) } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  if (!active) return null
  const commit = () => { if (editing) renameRun(editing, draft); setEditing(null) }

  return (
    <div ref={ref} className={cx('relative', className)}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="listbox"
        className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-sm text-parch-200 hover:border-gold-500/40 hover:text-gold-300">
        <ChevronsUpDown size={14} />Partidas <span className="rounded bg-white/5 px-1.5 text-[11px] text-parch-400">{runs.length}</span>
      </button>
      {open && (
        <div className="rise absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-ink-900 p-2 shadow-2xl">
          <div className="px-2 pb-2 pt-1 text-[10px] uppercase tracking-[0.2em] text-parch-400">Partidas en curso · se guardan solas</div>
          <ul className="scrollbar-thin max-h-80 space-y-1 overflow-y-auto" role="listbox">
            {runs.map((r) => {
              const b = BUILD_BY_ID[r.buildId]
              const p = progressStats(r, buildTasks(b, r.setupEnabled, r.dlcEnabled))
              const Icon = ICONS[b?.icon ?? 'Sword']
              const isActive = r.id === activeId
              return (
                <li key={r.id} role="option" aria-selected={isActive}
                  className={cx('group rounded-lg p-2', isActive ? 'bg-gold-500/10 ring-1 ring-gold-500/30' : 'hover:bg-white/5')}>
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-8 shrink-0 place-items-center rounded-md" style={{ background: `${b?.accent}22`, color: b?.accent }}><Icon size={16} /></div>
                    {editing === r.id ? (
                      <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
                        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(null); e.stopPropagation() }}
                        className="h-8 min-w-0 flex-1 rounded-md border border-gold-500/50 bg-ink-950 px-2 text-sm text-parch-100 outline-none" aria-label="Nombre de la partida" />
                    ) : (
                      <button className="min-w-0 flex-1 text-left" onClick={() => { setActive(r.id); setOpen(false); if (pathname !== '/partida') nav('/partida') }}>
                        <div className="flex items-center gap-1.5 truncate text-sm font-medium text-parch-100">{isActive && <CheckIcon size={13} className="shrink-0 text-gold-400" />}{r.name}</div>
                        <div className="truncate text-[11px] text-parch-400">{b?.name} · Nv {r.level} · {timeAgo(r.updatedAt)}</div>
                      </button>
                    )}
                    {editing !== r.id && (
                      <div className="flex shrink-0 opacity-60 group-hover:opacity-100">
                        <button onClick={() => { setEditing(r.id); setDraft(r.name) }} className="rounded p-1.5 text-parch-400 hover:bg-white/5 hover:text-parch-100" title="Renombrar" aria-label={`Renombrar ${r.name}`}><Pencil size={13} /></button>
                        <button onClick={() => duplicateRun(r.id)} className="rounded p-1.5 text-parch-400 hover:bg-white/5 hover:text-parch-100" title="Duplicar" aria-label={`Duplicar ${r.name}`}><Copy size={13} /></button>
                      </div>
                    )}
                  </div>
                  <ProgressBar value={p.pct} className="mt-2" color={b?.accent} />
                </li>
              )
            })}
          </ul>
          <button onClick={() => { setOpen(false); nav('/nueva') }} className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-gold-300 hover:bg-gold-500/10">
            <Plus size={15} />Nueva partida
          </button>
        </div>
      )}
    </div>
  )
}
