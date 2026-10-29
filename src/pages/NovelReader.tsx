import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, List, Minus, Plus, X } from 'lucide-react'
import { BOOKS, CHAPTERS, VOLUMES, NOVEL_TITLE, chapterExists, loadChapter, parseChapter, type Block } from '../content/novela'
import { cx } from '../components/ui'
import { numeroEnLetras } from '../content/novela/edicion'

const FONT_KEY = 'novela-font'
export const PROGRESS_KEY = 'novela-progress'

export function readProgress(): { slug: string; pct: number } | null {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? 'null') } catch { return null }
}

export default function NovelReader() {
  const { slug = CHAPTERS[0].slug } = useParams()
  const nav = useNavigate()
  const idx = CHAPTERS.findIndex((c) => c.slug === slug)
  const ch = CHAPTERS[idx]
  const [blocks, setBlocks] = useState<Block[] | null>(null)
  const [progress, setProgress] = useState(0)
  const [toc, setToc] = useState(false)
  const [size, setSize] = useState(() => { try { return Number(localStorage.getItem(FONT_KEY)) || 1.22 } catch { return 1.22 } })

  useEffect(() => {
    setBlocks(null)
    if (!ch || !chapterExists(ch.slug)) return
    loadChapter(ch.slug).then((md) => {
      setBlocks(parseChapter(md))
      // Recupera la posición guardada si es el mismo capítulo
      const saved = readProgress()
      requestAnimationFrame(() => {
        if (saved?.slug === ch.slug && saved.pct > 0.02 && saved.pct < 0.98) {
          const h = document.documentElement
          window.scrollTo({ top: saved.pct * (h.scrollHeight - h.clientHeight) })
        } else window.scrollTo({ top: 0 })
      })
    })
  }, [ch?.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let t: number | undefined
    const onScroll = () => {
      const h = document.documentElement
      const pct = Math.min(1, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight))
      setProgress(pct)
      window.clearTimeout(t)
      t = window.setTimeout(() => { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify({ slug, pct })) } catch { /* ignore */ } }, 300)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.clearTimeout(t) }
  }, [slug])

  useEffect(() => { try { localStorage.setItem(FONT_KEY, String(size)) } catch { /* ignore */ } }, [size])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'ArrowRight' && CHAPTERS[idx + 1]) nav(`/lore/novela/${CHAPTERS[idx + 1].slug}`)
      if (e.key === 'ArrowLeft' && CHAPTERS[idx - 1]) nav(`/lore/novela/${CHAPTERS[idx - 1].slug}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, nav])

  const book = useMemo(() => BOOKS.find((b) => b.n === ch?.book), [ch])
  if (!ch) return <div className="py-20 text-center text-parch-400">Capítulo no encontrado. <Link to="/lore" className="text-gold-400">Volver</Link></div>
  const prev = CHAPTERS[idx - 1], next = CHAPTERS[idx + 1]
  const firstOfBook = CHAPTERS.findIndex((c) => c.book === ch.book) === idx

  return (
    <article className="pb-10">
      <div className="fixed inset-x-0 top-0 z-40 h-0.5 lg:left-64">
        <div className="h-full bg-gradient-to-r from-gold-600 to-gold-300" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Barra superior */}
      <div className="sticky top-0 z-30 -mx-4 mb-8 flex items-center gap-2 border-b border-white/5 bg-ink-950/85 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Link to="/lore" className="inline-flex items-center gap-1 text-sm text-parch-400 hover:text-gold-300"><ArrowLeft size={14} /><span className="hidden sm:inline">Biblioteca</span></Link>
        <div className="mx-auto truncate text-center font-display text-sm text-parch-300">
          <span className="text-gold-500">{NOVEL_TITLE}</span> · Capítulo {idx + 1}
        </div>
        <button onClick={() => setSize((s) => Math.max(1, +(s - 0.08).toFixed(2)))} className="grid size-8 place-items-center rounded-md text-parch-300 hover:bg-white/5" aria-label="Letra más pequeña"><Minus size={14} /></button>
        <button onClick={() => setSize((s) => Math.min(1.6, +(s + 0.08).toFixed(2)))} className="grid size-8 place-items-center rounded-md text-parch-300 hover:bg-white/5" aria-label="Letra más grande"><Plus size={14} /></button>
        <button onClick={() => setToc(true)} className="flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-parch-300 hover:bg-white/5"><List size={15} /><span className="hidden sm:inline">Índice</span></button>
      </div>

      <div className="mx-auto max-w-[42rem]">
        {firstOfBook && book && (
          <div className="mb-16 mt-6 text-center">
            <div className="font-display text-sm tracking-[0.4em] text-gold-500">{book.title.toUpperCase()}</div>
            <div className="mt-3 font-display text-3xl text-parch-100 sm:text-4xl">{book.name}</div>
            <div className="ornament mx-auto mt-8 max-w-xs text-gold-500">✦</div>
          </div>
        )}
        <header className="mb-12 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-parch-400">Capítulo {numeroEnLetras(idx + 1)}</div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-gold-gradient sm:text-5xl">{ch.title}</h1>
          <div className="font-lore mt-3 text-lg italic text-parch-400">{ch.era}</div>
        </header>

        {!chapterExists(ch.slug) ? (
          <p className="font-lore text-center text-lg italic text-parch-400">Este capítulo todavía se está escribiendo.</p>
        ) : !blocks ? (
          <p className="text-center text-sm text-parch-400">Abriendo el capítulo…</p>
        ) : (
          <div className="novel" style={{ fontSize: `${size}rem` }}>
            {blocks.map((b, i) =>
              b.t === 'hr' ? <div key={i} className="ornament my-10 text-sm text-gold-500/80">✦ ✦ ✦</div>
                : b.t === 'h' ? <h2 key={i} className="mb-6 mt-12 text-center font-display text-[1.3em] text-gold-300">{b.text}</h2>
                  : b.t === 'quote' ? <blockquote key={i} className="font-lore my-8 border-l-2 border-gold-500/40 pl-5 italic text-parch-300" dangerouslySetInnerHTML={{ __html: b.html }} />
                    : <p key={i} className={cx('font-lore', i === 0 && 'dropcap')} dangerouslySetInnerHTML={{ __html: b.html }} />,
            )}
          </div>
        )}

        <div className="ornament my-14 text-gold-500">✦</div>
        <nav className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link to={`/lore/novela/${prev.slug}`} className="item-card panel p-4">
              <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-parch-400"><ArrowLeft size={12} />Capítulo {idx}</div>
              <div className="mt-1 font-display text-parch-100">{prev.title}</div>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/lore/novela/${next.slug}`} className="item-card panel p-4 text-right">
              <div className="flex items-center justify-end gap-1 text-[11px] uppercase tracking-wider text-parch-400">Capítulo {idx + 2}<ArrowRight size={12} /></div>
              <div className="mt-1 font-display text-parch-100">{next.title}</div>
            </Link>
          ) : (
            <Link to="/lore" className="item-card panel p-4 text-right"><div className="font-display text-parch-100">Fin · Volver a la biblioteca</div></Link>
          )}
        </nav>
      </div>

      {/* Índice */}
      {toc && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setToc(false)}>
          <aside className="scrollbar-thin h-full w-full max-w-sm overflow-y-auto border-l border-white/10 bg-ink-950 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-display text-lg text-gold-gradient">{NOVEL_TITLE}</div>
              <button onClick={() => setToc(false)} className="rounded p-1 text-parch-400 hover:bg-white/5" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <TableOfContents current={ch.slug} onPick={() => setToc(false)} />
          </aside>
        </div>
      )}
    </article>
  )
}

export function TableOfContents({ current, onPick }: { current?: string; onPick?: () => void }) {
  return (
    <div className="space-y-5">
      {BOOKS.map((b) => (
        <div key={b.n}>
          {VOLUMES.find((v) => v.parts[0] === b.n) && (
            <div className="mb-3 mt-2 border-b border-gold-500/20 pb-1 font-display text-sm text-gold-300">
              {VOLUMES.find((v) => v.parts[0] === b.n)!.title} · {VOLUMES.find((v) => v.parts[0] === b.n)!.name}
            </div>
          )}
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-500">{b.title} · {b.name}</div>
          <ol className="space-y-0.5">
            {CHAPTERS.map((c, i) => ({ c, i })).filter(({ c }) => c.book === b.n).map(({ c, i }) => (
              <li key={c.slug}>
                <Link to={`/lore/novela/${c.slug}`} onClick={onPick}
                  className={cx('flex gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white/5', c.slug === current ? 'bg-gold-500/10 text-gold-300' : 'text-parch-200', !chapterExists(c.slug) && 'opacity-40')}>
                  <span className="w-6 shrink-0 text-right tabular-nums text-parch-400">{i + 1}.</span>{c.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}
