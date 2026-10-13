import { CATS } from '../lib/mapData'

/** Icono de categoría del mapa (icono del juego o glifo propio) */
export function CatIcon({ cat, size = 22 }: { cat: string; size?: number }) {
  const m = CATS[cat] ?? CATS.task
  if (m.img) return <img src={`/map-icons/${m.img}.webp`} alt="" width={size} height={size} className="shrink-0 object-contain drop-shadow" />
  return (
    <span className="grid shrink-0 place-items-center rounded-full border" style={{ width: size, height: size, color: m.color, borderColor: m.color, background: 'rgba(14,11,8,.9)' }}>
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: size * 0.6, height: size * 0.6 }} dangerouslySetInnerHTML={{ __html: m.glyph ?? '' }} />
    </span>
  )
}
