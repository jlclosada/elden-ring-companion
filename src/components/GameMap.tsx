import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Layer } from '../data/types'
import { CATS, iconHtml, type MapLayerMeta, type MapMarker } from '../lib/mapData'

interface Props {
  layer: Layer
  meta: MapLayerMeta
  markers: MapMarker[]
  found?: Record<string, number>
  /** Marcadores con anillo dorado (pendientes de tu build) */
  highlight?: Set<string>
  /** Ruta numerada (ids de marcadores) */
  route?: string[]
  selectedId?: string | null
  onSelect?: (m: MapMarker | null) => void
  /** Centra en este marcador */
  focusId?: string | null
  className?: string
  /** Mapa pequeño embebido: sin scroll-zoom hasta hacer clic */
  compact?: boolean
  /** Encuadra los marcadores en lugar del mapa completo */
  fitMarkers?: boolean
}

export function GameMap({ layer, meta, markers, found = {}, highlight, route = [], selectedId, onSelect, focusId, className, compact, fitMarkers }: Props) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const tiles = useRef<L.TileLayer | null>(null)
  const group = useRef<L.LayerGroup | null>(null)
  const routeLayer = useRef<L.LayerGroup | null>(null)
  const pins = useRef(new Map<string, L.Marker>())
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const markersRef = useRef(markers)
  markersRef.current = markers
  const nativeMax = useRef(meta.maxZoom)
  nativeMax.current = meta.maxZoom

  const toLatLng = (x: number, y: number) => map.current!.unproject([x, y], meta.maxZoom)
  const byId = useMemo(() => new Map(markers.map((m) => [m.id, m])), [markers])

  // Inicialización
  useEffect(() => {
    const m = L.map(el.current!, {
      crs: L.CRS.Simple, zoomControl: false, attributionControl: false, zoomSnap: 0.1, zoomDelta: 0.5,
      wheelPxPerZoomLevel: 90, scrollWheelZoom: !compact, maxBoundsViscosity: 0.8, preferCanvas: false,
    })
    L.control.zoom({ position: 'topright', zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar' }).addTo(m)
    group.current = L.layerGroup().addTo(m)
    routeLayer.current = L.layerGroup().addTo(m)
    m.on('click', () => onSelectRef.current?.(null))
    if (compact) {
      m.on('focus click', () => m.scrollWheelZoom.enable())
      m.on('blur mouseout', () => m.scrollWheelZoom.disable())
    }
    const updateZoomClass = () => {
      const z = m.getZoom()
      const node = el.current!
      const depth = nativeMax.current - z // 0 = resolución nativa del mapa
      node.style.setProperty('--pin', `${Math.round(Math.max(15, Math.min(34, 34 - depth * 4.5)))}px`)
      // Equipo y objetos solo a partir de cierto zoom, como en MapGenie
      node.dataset.items = depth <= 2.01 ? 'on' : 'off'
    }
    m.on('zoomend', updateZoomClass)
    map.current = m
    // Recalcula el tamaño cuando el contenedor cambia (layout, panel lateral, móvil…)
    const ro = new ResizeObserver(() => m.invalidateSize({ pan: false }))
    ro.observe(el.current!)
    return () => { ro.disconnect(); m.remove(); map.current = null; pins.current.clear() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Capa de teselas
  useEffect(() => {
    const m = map.current!
    tiles.current?.remove()
    const bounds = L.latLngBounds(m.unproject([0, meta.height], meta.maxZoom), m.unproject([meta.width, 0], meta.maxZoom))
    tiles.current = L.tileLayer(`/tiles/${layer}/{z}/{y}/{x}.webp`, {
      maxNativeZoom: meta.maxZoom, maxZoom: meta.maxZoom + 1.5, minZoom: 0, noWrap: true, bounds, keepBuffer: 4,
      errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    }).addTo(m)
    m.setMinZoom(meta.maxZoom - 4.5)
    m.setMaxZoom(meta.maxZoom + 1.5)
    m.setMaxBounds(bounds.pad(0.15))
    const fit = () => {
      m.invalidateSize({ pan: false })
      const pts = fitMarkers ? markersRef.current.filter((x) => x.layer === layer).map((x) => m.unproject([x.x, x.y], meta.maxZoom)) : []
      if (pts.length > 1) m.fitBounds(L.latLngBounds(pts), { animate: false, padding: [40, 40], maxZoom: meta.maxZoom - 1 })
      else if (pts.length === 1) m.setView(pts[0], meta.maxZoom - 2, { animate: false })
      else m.fitBounds(bounds, { animate: false })
      m.fire('zoomend')
    }
    fit()
    const raf = requestAnimationFrame(fit)
    return () => cancelAnimationFrame(raf)
  }, [layer, meta, fitMarkers ? markers.map((x) => x.id).join() : ''])  // eslint-disable-line react-hooks/exhaustive-deps

  // Marcadores (diff por id)
  useEffect(() => {
    const g = group.current!
    const keep = new Set<string>()
    for (const mk of markers) {
      if (mk.layer !== layer) continue
      keep.add(mk.id)
      const cls = [
        found[mk.id] ? 'gm-found' : '',
        highlight?.has(mk.id) ? 'gm-hl' : '',
        mk.id === selectedId ? 'gm-sel' : '',
        mk.approx ? 'gm-approx' : '',
      ].join(' ')
      const ri = route.indexOf(mk.id)
      const html = iconHtml(mk.cat, cls) + (ri >= 0 ? `<span class="gm-route">${ri + 1}</span>` : '')
      const key = `${html}`
      let pin = pins.current.get(mk.id)
      if (!pin) {
        pin = L.marker(toLatLng(mk.x, mk.y), { icon: L.divIcon({ html, className: 'gm-icon', iconSize: [0, 0] }), keyboard: false, riseOnHover: true })
        pin.bindTooltip(mk.name || CATS[mk.cat]?.label || '', { direction: 'top', offset: [0, -14], className: 'gm-tip' })
        pin.on('click', (e) => { L.DomEvent.stopPropagation(e); onSelectRef.current?.(byId.get(mk.id) ?? mk) })
        ;(pin as L.Marker & { _k?: string })._k = key
        pins.current.set(mk.id, pin)
        g.addLayer(pin)
      } else if ((pin as L.Marker & { _k?: string })._k !== key) {
        pin.setIcon(L.divIcon({ html, className: 'gm-icon', iconSize: [0, 0] }))
        ;(pin as L.Marker & { _k?: string })._k = key
        pin.off('click')
        pin.on('click', (e) => { L.DomEvent.stopPropagation(e); onSelectRef.current?.(byId.get(mk.id) ?? mk) })
      }
      if (mk.id === selectedId) pin.setZIndexOffset(1000)
      else pin.setZIndexOffset(highlight?.has(mk.id) || ri >= 0 ? 500 : mk.cat.startsWith('item_') ? 0 : 100)
    }
    for (const [id, pin] of pins.current) if (!keep.has(id)) { g.removeLayer(pin); pins.current.delete(id) }
  }, [markers, layer, found, highlight, route, selectedId, byId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Ruta
  useEffect(() => {
    const rl = routeLayer.current!
    rl.clearLayers()
    const pts = route.map((id) => byId.get(id)).filter((m): m is MapMarker => !!m && m.layer === layer)
    if (pts.length > 1) {
      L.polyline(pts.map((p) => toLatLng(p.x, p.y)), { color: '#f4dc9a', weight: 3, opacity: 0.85, dashArray: '8 8', interactive: false }).addTo(rl)
    }
  }, [route, byId, layer]) // eslint-disable-line react-hooks/exhaustive-deps

  // Foco
  useEffect(() => {
    if (!focusId) return
    const mk = byId.get(focusId)
    if (!mk || mk.layer !== layer) return
    const m = map.current!
    m.flyTo(toLatLng(mk.x, mk.y), Math.max(m.getZoom(), meta.maxZoom - 1), { duration: 0.8 })
  }, [focusId, layer, byId]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className={`gm-map ${className ?? ''}`} />
}
