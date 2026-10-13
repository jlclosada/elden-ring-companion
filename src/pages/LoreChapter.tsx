import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MapPin, AlertTriangle, BookOpen } from 'lucide-react'
import { CHAPTERS, CHARACTER_BY_ID, LORE_BY_ID } from '../data/lore'
import type { CompendiumCat } from '../data/types'
import { LOCATION_BY_ID } from '../data/locations'
import { Empty, Panel } from '../components/ui'
import { RefDetail, RefThumb } from '../components/ItemCard'
import { readingMinutes } from './Lore'

export default function LoreChapterPage() {
  const { id } = useParams()
  const c = id ? LORE_BY_ID[id] : undefined
  const [progress, setProgress] = useState(0)
  const [relic, setRelic] = useState<{ cat: CompendiumCat; name: string } | null>(null)
  const [spoiler, setSpoiler] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      setProgress(Math.min(1, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [id])
  useEffect(() => { setSpoiler(false) }, [id])

  if (!c) return <Empty title="Capítulo no encontrado" action={<Link to="/lore" className="text-gold-400 hover:underline">Volver al lore</Link>} />
  const prev = CHAPTERS[c.number - 2], next = CHAPTERS[c.number]
  const hidden = c.dlc && !spoiler

  return (
    <article>
      <div className="fixed inset-x-0 top-0 z-40 h-0.5 bg-transparent lg:left-64">
        <div className="h-full bg-gradient-to-r from-gold-600 to-gold-300 transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>

      <Link to="/lore" className="mb-6 inline-flex items-center gap-1 text-sm text-parch-400 hover:text-gold-300"><ArrowLeft size={14} />Crónicas</Link>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="mx-auto w-full max-w-[44rem]">
          <header className="text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-500">{c.part}</div>
            <div className="relic-frame mx-auto mt-6 grid size-28 place-items-center rounded-full p-3">
              <RefThumb cat={c.cover.cat} name={c.cover.name} size={84} />
            </div>
            <div className="mt-5 font-display text-sm tracking-[0.3em] text-parch-400">CAPÍTULO {c.number}</div>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-gold-gradient sm:text-5xl">{c.title}</h1>
            <div className="mt-3 text-sm text-parch-400">{c.era} · {readingMinutes(c)} min de lectura</div>
            <p className="font-lore mx-auto mt-8 max-w-md text-xl italic leading-relaxed text-parch-300">«{c.epigraph}»</p>
            <div className="ornament mt-10 text-gold-500">✦</div>
          </header>

          {hidden ? (
            <Panel className="mt-10 p-8 text-center">
              <AlertTriangle className="mx-auto text-[#d98a4a]" />
              <h2 className="mt-3 font-display text-xl text-parch-100">Spoilers de Shadow of the Erdtree</h2>
              <p className="mt-2 text-sm text-parch-300">Este capítulo revela la historia del DLC, incluido el origen de Marika.</p>
              <button onClick={() => setSpoiler(true)} className="mt-5 rounded-xl border border-[#d98a4a]/50 px-5 py-2 text-sm text-[#e9a25b] hover:bg-[#d98a4a]/10">Leer igualmente</button>
            </Panel>
          ) : (
            <div className="prose-lore mt-10">
              {c.sections.map((s, i) => (
                <section key={i}>
                  {s.heading && <h2 className="mb-6 mt-12 text-center font-display text-2xl tracking-wide text-gold-300">{s.heading}</h2>}
                  {s.text.map((p, j) => <p key={j}>{p}</p>)}
                </section>
              ))}
              <div className="ornament my-14 text-gold-500">✦ ✦ ✦</div>
            </div>
          )}

          <nav className="grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link to={`/lore/${prev.id}`} className="item-card panel p-4">
                <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-parch-400"><ArrowLeft size={12} />Capítulo {prev.number}</div>
                <div className="mt-1 font-display text-parch-100">{prev.title}</div>
              </Link>
            ) : <span />}
            {next ? (
              <Link to={`/lore/${next.id}`} className="item-card panel p-4 text-right">
                <div className="flex items-center justify-end gap-1 text-[11px] uppercase tracking-wider text-parch-400">Capítulo {next.number}<ArrowRight size={12} /></div>
                <div className="mt-1 font-display text-parch-100">{next.title}</div>
              </Link>
            ) : (
              <Link to="/lore" className="item-card panel p-4 text-right">
                <div className="flex items-center justify-end gap-1 text-[11px] uppercase tracking-wider text-parch-400">Fin<BookOpen size={12} /></div>
                <div className="mt-1 font-display text-parch-100">Volver a las crónicas</div>
              </Link>
            )}
          </nav>
        </div>

        {/* Lateral */}
        <aside className="space-y-5 xl:sticky xl:top-8 xl:self-start">
          <Panel className="p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-parch-400">Reliquias del capítulo</div>
            <div className="space-y-1.5">
              {c.relics.map((r) => (
                <button key={r.name} onClick={() => setRelic(r)} className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left hover:bg-white/5">
                  <RefThumb cat={r.cat} name={r.name} size={40} />
                  <span className="text-sm text-parch-100">{r.name.replace(/^Ashes? of War: /i, '')}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-parch-400">Pulsa una reliquia para leer su descripción del juego.</p>
          </Panel>
          <Panel className="p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-parch-400">Personajes</div>
            <div className="flex flex-wrap gap-1.5">
              {c.characters.map((id) => CHARACTER_BY_ID[id]).filter(Boolean).map((ch) => (
                <Link key={ch.id} to="/lore#personajes" className="flex items-center gap-1.5 rounded-full border border-white/10 py-0.5 pl-0.5 pr-2.5 text-xs text-parch-200 hover:border-gold-500/40">
                  {ch.portrait ? <RefThumb cat={ch.portrait.cat} name={ch.portrait.name} size={22} /> : <span className="grid size-[22px] place-items-center rounded-full bg-white/5 font-display text-[10px] text-gold-400">{ch.name[0]}</span>}
                  {ch.name}
                </Link>
              ))}
            </div>
          </Panel>
          {c.places.length > 0 && (
            <Panel className="p-4">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-parch-400">Lugares</div>
              <div className="space-y-1">
                {c.places.map((p) => LOCATION_BY_ID[p]).filter(Boolean).map((l) => (
                  <Link key={l.id} to={`/mapa?loc=${l.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-parch-200 hover:bg-white/5 hover:text-gold-300">
                    <MapPin size={13} className="text-gold-400" />{l.name}
                  </Link>
                ))}
              </div>
            </Panel>
          )}
        </aside>
      </div>
      {relic && <RefDetail cat={relic.cat} name={relic.name} onClose={() => setRelic(null)} />}
    </article>
  )
}
