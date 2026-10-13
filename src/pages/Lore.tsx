import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, FileDown } from 'lucide-react'
import { CHAPTERS, CHARACTERS, LORE_PARTS, type LoreCharacter } from '../data/lore'
import { CHAPTERS as NOVEL, NOVEL_SUBTITLE, NOVEL_TITLE, chapterExists } from '../content/novela'
import { readProgress, TableOfContents } from './NovelReader'
import { Badge, cx } from '../components/ui'
import { RefThumb } from '../components/ItemCard'

export const readingMinutes = (c: (typeof CHAPTERS)[number]) =>
  Math.max(2, Math.round(c.sections.flatMap((s) => s.text).join(' ').split(/\s+/).length / 220))

export default function LorePage() {
  const [who, setWho] = useState<LoreCharacter | null>(null)
  const progress = readProgress()
  const written = NOVEL.filter((c) => chapterExists(c.slug)).length

  return (
    <div className="space-y-14">
      {/* Portada: la novela */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5">
        <img src="/tiles/surface-preview.webp" alt="" className="absolute inset-0 h-full w-full object-cover object-[55%_30%] opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/30 via-ink-950/80 to-ink-950" />
        <div className="relative grid gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-20">
          <div className="text-center lg:text-left">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">Novela</div>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-tight text-gold-gradient sm:text-6xl">{NOVEL_TITLE}</h1>
            <div className="mt-2 font-display text-lg tracking-wide text-parch-300">{NOVEL_SUBTITLE}</div>
            <p className="font-lore mt-6 max-w-2xl text-xl italic leading-relaxed text-parch-200 lg:max-w-xl">
              La historia completa de Elden Ring, de la tormenta de los dragones a la última ascensión de Miquella, contada como una novela en seis libros.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link to={`/lore/novela/${progress?.slug ?? NOVEL[0].slug}`} className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-6 font-semibold text-ink-950 shadow-[0_8px_30px_-8px_rgba(230,197,111,.6)] hover:brightness-110">
                {progress ? `Continuar: capítulo ${NOVEL.findIndex((c) => c.slug === progress.slug) + 1}` : 'Empezar a leer'}
              </Link>
              {progress && <Link to={`/lore/novela/${NOVEL[0].slug}`} className="inline-flex h-12 items-center rounded-xl border border-gold-500/40 px-5 text-gold-300 hover:bg-gold-500/10">Desde el principio</Link>}
              <Link to="/lore/libro" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 px-5 text-parch-200 hover:border-gold-500/40 hover:text-gold-300"><FileDown size={17} />Exportar a PDF</Link>
            </div>
            <div className="mt-4 text-xs text-parch-400">{written} de {NOVEL.length} capítulos · 6 libros</div>
          </div>
          <div className="panel scrollbar-thin max-h-[30rem] overflow-y-auto p-4 text-left">
            <TableOfContents current={progress?.slug} />
          </div>
        </div>
      </section>

      <div className="ornament font-display text-sm tracking-[0.25em]">CRÓNICAS BREVES</div>
      <p className="-mt-8 text-center text-sm text-parch-400">Resúmenes por épocas, con las reliquias y lugares de cada una.</p>

      {/* Capítulos por partes */}
      {LORE_PARTS.map((part) => {
        const chs = CHAPTERS.filter((c) => c.part === part)
        return (
          <section key={part}>
            <div className="ornament mb-6 font-display text-sm tracking-[0.25em]">{part.toUpperCase()}</div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {chs.map((c) => (
                <Link key={c.id} to={`/lore/${c.id}`} className="item-card panel group flex gap-5 overflow-hidden p-5">
                  <div className="relic-frame grid size-24 shrink-0 place-items-center rounded-2xl p-3 sm:size-28">
                    <RefThumb cat={c.cover.cat} name={c.cover.name} size={84} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-parch-400">
                      <span className="font-display text-gold-400">Capítulo {c.number}</span>· {c.era}
                    </div>
                    <h2 className="mt-1 font-display text-xl leading-snug text-parch-100 group-hover:text-gold-300">{c.title}</h2>
                    <p className="font-lore mt-2 line-clamp-3 text-[15px] leading-relaxed text-parch-300">{c.summary}</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-parch-400">
                      <Clock size={11} />{readingMinutes(c)} min{c.dlc && <Badge color="#d98a4a">Contiene DLC</Badge>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}

      {/* Personajes */}
      <section id="personajes">
        <div className="ornament mb-6 font-display text-sm tracking-[0.25em]">DRAMATIS PERSONAE</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-7">
          {CHARACTERS.map((ch) => (
            <button key={ch.id} onClick={() => setWho(ch)} className={cx('item-card panel p-4 text-left', who?.id === ch.id && 'ring-1 ring-gold-400/60')}>
              <div className="relic-frame mx-auto grid size-20 place-items-center rounded-full p-2">
                {ch.portrait ? <RefThumb cat={ch.portrait.cat} name={ch.portrait.name} size={60} /> : <span className="font-display text-2xl text-gold-400">{ch.name[0]}</span>}
              </div>
              <div className="mt-3 text-center font-display text-[15px] leading-tight text-parch-100">{ch.name}</div>
              <div className="text-center text-[11px] text-parch-400">{ch.title}</div>
            </button>
          ))}
        </div>
        {who && (
          <div className="panel rise mx-auto mt-4 max-w-3xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl text-gold-gradient">{who.name}</h3>
                <div className="text-sm text-parch-400">{who.title}{who.dlc && ' · Shadow of the Erdtree'}</div>
              </div>
              <button onClick={() => setWho(null)} className="text-sm text-parch-400 hover:text-parch-100">Cerrar</button>
            </div>
            <p className="font-lore mt-4 text-lg leading-relaxed text-parch-200">{who.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CHAPTERS.filter((c) => c.characters.includes(who.id)).map((c) => (
                <Link key={c.id} to={`/lore/${c.id}`} className="rounded-full border border-gold-500/30 px-3 py-1 text-xs text-gold-300 hover:bg-gold-500/10">Cap. {c.number} · {c.title}</Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <p className="text-center text-xs text-parch-400">
        Relato propio basado en las descripciones de objetos, los diálogos del juego y las interpretaciones más aceptadas por la comunidad.
        Elden Ring cuenta su historia de forma fragmentaria: algunos puntos son interpretación y se señalan como tal.
      </p>
    </div>
  )
}
