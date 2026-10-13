import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Layer } from '../data/types'
import { LAYER_LABEL, markerIdForLocation, useMapData } from '../lib/mapData'
import { useFound } from '../store/runs'
import { GameMap } from './GameMap'
import { cx } from './ui'

/**
 * Mapa real embebido que muestra un conjunto de lugares de la app (ids de locations.ts).
 * Pulsar un marcador abre el mapa completo centrado en él.
 */
export function MiniMap({ locations, route = false, className, focus }: { locations: string[]; route?: boolean; className?: string; focus?: string | null }) {
  const data = useMapData()
  const found = useFound()
  const nav = useNavigate()
  const ids = useMemo(() => locations.map(markerIdForLocation).filter((x, i, a): x is string => !!x && a.indexOf(x) === i), [locations])
  const markers = useMemo(() => (data ? data.markers.filter((m) => ids.includes(m.id)) : []), [data, ids])
  const layers = useMemo(() => Array.from(new Set(markers.map((m) => m.layer))), [markers])
  const hl = useMemo(() => new Set(ids), [ids])
  const routeIds = useMemo(() => (route ? ids : []), [route, ids])
  const focusMarker = focus ? markerIdForLocation(focus) : null
  const focusLayer = focusMarker ? markers.find((m) => m.id === focusMarker)?.layer : undefined
  const [picked, setPicked] = useState<Layer | null>(null)
  const layer: Layer = focusLayer ?? picked ?? layers[0] ?? 'surface'

  if (!data) return <div className={cx('grid place-items-center rounded-2xl border border-white/5 bg-ink-900 text-xs text-parch-400', className)}>Cargando mapa…</div>
  return (
    <div className={cx('relative overflow-hidden rounded-2xl border border-white/5', className)}>
      <GameMap compact fitMarkers layer={layer} meta={data.layers[layer]} markers={markers} found={found} highlight={hl}
        route={routeIds} focusId={focusMarker} onSelect={(m) => m && nav(`/mapa?m=${encodeURIComponent(m.id)}`)} className="h-full w-full" />
      {layers.length > 1 && (
        <div className="absolute left-2 top-2 z-[400] flex gap-1 rounded-lg bg-ink-950/85 p-1 backdrop-blur">
          {layers.map((l) => (
            <button key={l} onClick={() => setPicked(l)} className={cx('rounded-md px-2 py-1 text-[11px]', l === layer ? 'bg-gold-500/20 text-gold-300' : 'text-parch-300 hover:text-parch-100')}>
              {LAYER_LABEL[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
