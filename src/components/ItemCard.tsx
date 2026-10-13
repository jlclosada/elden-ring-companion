import { useEffect, useState } from 'react'
import { X, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CompendiumCat, CompendiumEntry, Stats } from '../data/types'
import { useEntry, CATEGORY_META } from '../lib/compendium'
import { meetsRequirements } from '../lib/stats'
import { STAT_META } from '../data/classes'
import { Badge, cx } from './ui'

export function ItemThumb({ src, alt, size = 48, className }: { src?: string | null; alt: string; size?: number; className?: string }) {
  const [err, setErr] = useState(false)
  return (
    <div className={cx('relative shrink-0 overflow-hidden rounded-lg border border-white/5 bg-gradient-to-br from-ink-700 to-ink-900', className)} style={{ width: size, height: size }}>
      {src && !err ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} className="h-full w-full object-contain p-1 drop-shadow-[0_2px_6px_rgba(0,0,0,.6)]" />
      ) : (
        <div className="grid h-full w-full place-items-center font-display text-sm text-gold-500/70">{alt.replace(/^Ash of War:\s*/i, '').slice(0, 2)}</div>
      )}
    </div>
  )
}

/** Miniatura que resuelve la imagen desde el compendio por nombre */
export function RefThumb({ cat, name, size = 44 }: { cat?: CompendiumCat; name?: string; size?: number }) {
  const e = useEntry(cat, name)
  return <ItemThumb src={e?.image} alt={name ?? '?'} size={size} />
}

const ATTR_ES: Record<string, string> = { Phy: 'Físico', Mag: 'Mágico', Fire: 'Fuego', Ligt: 'Rayo', Holy: 'Sagrado', Crit: 'Crítico', Boost: 'Bloqueo' }

export function EntryDetail({ entry, cat, stats, onClose, locationId }: { entry: CompendiumEntry; cat: CompendiumCat; stats?: Stats; onClose: () => void; locationId?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const req = entry.requires
  const check = stats && req ? meetsRequirements(req, stats) : null
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="panel rise max-h-[88vh] w-full max-w-lg overflow-y-auto p-5 sm:p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={entry.name}>
        <div className="flex items-start gap-4">
          <ItemThumb src={entry.image} alt={entry.name} size={84} />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold-500">{CATEGORY_META[cat].label}{entry.category ? ` · ${entry.category}` : ''}</div>
            <h3 className="font-display text-xl text-parch-100">{entry.name}</h3>
            {entry.weight != null && <div className="text-xs text-parch-400">Peso {entry.weight}</div>}
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-parch-400 hover:bg-white/5 hover:text-parch-100" aria-label="Cerrar"><X size={18} /></button>
        </div>

        {(entry.effect || entry.skill) && <p className="mt-4 rounded-lg bg-gold-500/5 p-3 text-sm text-gold-300">{entry.effect || entry.skill}</p>}

        {req && Object.values(req).some(Boolean) && (
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-parch-400">Requisitos {entry.scaling && '· Escalado'}</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(req).filter(([, v]) => v).map(([k, v]) => {
                const miss = check?.missing.find((m) => m.stat.slice(0, 3) === k.toLowerCase().slice(0, 3))
                const sc = entry.scaling?.[k] ?? entry.scaling?.[k.slice(0, 3)]
                return (
                  <Badge key={k} color={miss ? '#e36b5b' : '#8fbf7a'}>
                    {k.slice(0, 3).toUpperCase()} {v}{sc ? ` · ${sc}` : ''}{miss ? ` (tienes ${miss.have})` : ''}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {entry.attack && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {Object.entries(entry.attack).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white/[.03] py-2">
                <div className="text-[10px] uppercase tracking-wider text-parch-400">{ATTR_ES[k] ?? k}</div>
                <div className="font-display text-lg text-parch-100">{v}</div>
              </div>
            ))}
          </div>
        )}

        {entry.obtain && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-parch-400">
              <span>Cómo conseguirlo</span>
              {locationId && <Link to={`/mapa?loc=${locationId}`} className="flex items-center gap-1 normal-case tracking-normal text-gold-400 hover:underline"><MapPin size={12} />Ver en mapa</Link>}
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-parch-200">{entry.obtain}</p>
          </div>
        )}
        <div className="mt-5 space-y-3 border-t border-white/5 pt-4">
          {(entry.lore?.length ? entry.lore : [entry.description]).filter(Boolean).map((p, i) => (
            <p key={i} className={cx('font-lore whitespace-pre-line text-[1.05rem] leading-relaxed', i === 0 ? 'text-parch-200' : 'italic text-parch-400')}>{p}</p>
          ))}
        </div>
        <Link to={`/compendio/${cat}/${entry.id}`} onClick={onClose} className="mt-4 inline-flex items-center gap-1 text-sm text-gold-400 hover:underline">Ver ficha completa →</Link>
        {stats && <div className="mt-3 text-[11px] text-parch-400">Requisitos comparados con las estadísticas de tu partida ({Object.entries(stats).map(([k, v]) => `${STAT_META[k as keyof Stats].short} ${v}`).join(' · ')}).</div>}
      </div>
    </div>
  )
}

/** Abre el detalle a partir de una referencia por nombre */
export function RefDetail({ cat, name, onClose, stats, locationId }: { cat: CompendiumCat; name: string; onClose: () => void; stats?: Stats; locationId?: string }) {
  const e = useEntry(cat, name)
  if (!e) return null
  return <EntryDetail entry={e} cat={cat} onClose={onClose} stats={stats} locationId={locationId} />
}
