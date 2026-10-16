import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileDown, Loader2, BookOpen } from 'lucide-react'
import { Previewer } from 'pagedjs'
import { CHAPTERS, NOVEL_SUBTITLE, NOVEL_TITLE, chapterExists, loadChapter, parseChapter } from '../content/novela'
import { buildBookHtml, type BookOptions } from './book/buildBook'
import bookCss from './book/book.css?raw'
import { cx } from '../components/ui'

/** Formatos de página: tamaño y márgenes (superior, inferior, interior o lomo, exterior) */
const FORMATS = {
  '15x23': { label: '15 × 23 cm · novela', size: '152mm 229mm', mt: '18mm', mb: '21mm', mi: '21mm', mo: '15mm' },
  A5: { label: 'A5', size: '148mm 210mm', mt: '16mm', mb: '19mm', mi: '19mm', mo: '14mm' },
  A4: { label: 'A4', size: 'A4', mt: '24mm', mb: '27mm', mi: '30mm', mo: '22mm' },
} as const
type FormatId = keyof typeof FORMATS

const TOGGLES: { key: keyof Omit<BookOptions, 'a4'>; label: string }[] = [
  { key: 'mapa', label: 'Mapas' },
  { key: 'reparto', label: 'Dramatis personae' },
  { key: 'glosario', label: 'Glosario' },
  { key: 'cronicas', label: 'Crónicas breves' },
]

/**
 * Edición imprimible de la novela. Paged.js pagina el libro con reglas de imprenta (márgenes en espejo,
 * titulillos, capítulos en página impar, índice con números de página) y el PDF se guarda con el diálogo
 * de impresión del navegador. Las opciones viven en la URL: cambiarlas vuelve a componer el libro desde cero.
 */
export default function NovelBook() {
  const [params, setParams] = useSearchParams()
  const format = (params.get('formato') as FormatId) in FORMATS ? (params.get('formato') as FormatId) : '15x23'
  const opts: BookOptions = {
    mapa: params.get('mapa') !== '0',
    reparto: params.get('reparto') !== '0',
    glosario: params.get('glosario') !== '0',
    cronicas: params.get('cronicas') === '1',
    a4: format === 'A4',
  }
  const [pages, setPages] = useState(0)
  const [state, setState] = useState<'loading' | 'paginating' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [spreads, setSpreads] = useState(true)
  const target = useRef<HTMLDivElement>(null)
  const key = params.toString()

  // Cambiar una opción recarga la página: Paged.js no sabe deshacer una paginación
  const setOpt = (k: string, v: string | null) => {
    const next = new URLSearchParams(params)
    if (v === null) next.delete(k); else next.set(k, v)
    setParams(next, { replace: true })
    setTimeout(() => window.location.reload(), 0)
  }

  useEffect(() => {
    const prev = document.title
    document.title = `${NOVEL_TITLE} — ${NOVEL_SUBTITLE}`
    document.documentElement.classList.add('book-mode')
    return () => { document.title = prev; document.documentElement.classList.remove('book-mode') }
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const written = CHAPTERS.filter((c) => chapterExists(c.slug))
        const list = await Promise.all(written.map(async (c) => [c.slug, parseChapter(await loadChapter(c.slug))] as const))
        if (!alive || !target.current) return
        await document.fonts.ready
        setState('paginating')
        const f = FORMATS[format]
        const css = bookCss.replace('__SIZE__', f.size).replace('__MT__', f.mt).replace('__MB__', f.mb).replace(/__MI__/g, f.mi).replace(/__MO__/g, f.mo)
        const previewer = new Previewer()
        let n = 0
        previewer.on('page', () => { n++; if (n % 10 === 0) setPages(n) })
        target.current.innerHTML = ''
        const flow = await previewer.preview(buildBookHtml(Object.fromEntries(list), opts), [{ [`${location.origin}/libro.css`]: css }], target.current)
        if (!alive) return
        setPages(flow.total ?? n)
        setState('ready')
      } catch (e) {
        console.error(e)
        setError(e instanceof Error ? e.message : String(e))
        setState('error')
      }
    })()
    return () => { alive = false }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={cx('book-root', spreads && 'book-spreads', state === 'ready' && 'book-ready')}>
      <div className="book-toolbar sticky top-0 z-30 border-b border-white/10 bg-ink-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/lore" className="inline-flex items-center gap-1 text-sm text-parch-400 hover:text-gold-300"><ArrowLeft size={14} />Biblioteca</Link>
          <div className="font-display text-sm text-parch-200"><span className="text-gold-400">{NOVEL_TITLE}</span> · edición impresa</div>
          <div className="ml-auto flex flex-wrap items-center gap-3 text-xs text-parch-300">
            <select value={format} onChange={(e) => setOpt('formato', e.target.value)} aria-label="Formato" className="h-8 rounded-md border border-white/10 bg-ink-900 px-2">
              {(Object.keys(FORMATS) as FormatId[]).map((k) => <option key={k} value={k}>{FORMATS[k].label}</option>)}
            </select>
            {TOGGLES.map((t) => (
              <label key={t.key} className="flex items-center gap-1.5">
                <input type="checkbox" checked={opts[t.key]} className="accent-[#d4a94a]"
                  onChange={(e) => setOpt(t.key, t.key === 'cronicas' ? (e.target.checked ? '1' : null) : (e.target.checked ? null : '0'))} />
                {t.label}
              </label>
            ))}
            <button onClick={() => setSpreads((s) => !s)} className={cx('flex h-8 items-center gap-1.5 rounded-md border px-2', spreads ? 'border-gold-500/40 text-gold-300' : 'border-white/10')}>
              <BookOpen size={13} />Pliegos
            </button>
            <button onClick={() => window.print()} disabled={state !== 'ready'}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-b from-gold-400 to-gold-600 px-4 text-sm font-semibold text-ink-950 hover:brightness-110 disabled:opacity-50">
              {state === 'ready' ? <FileDown size={15} /> : <Loader2 size={15} className="animate-spin" />}Descargar PDF
            </button>
          </div>
        </div>
        <p className="mx-auto max-w-6xl px-4 pb-2 text-[11px] text-parch-400">
          {state === 'loading' && 'Reuniendo los capítulos…'}
          {state === 'paginating' && `Componiendo el libro… ${pages} páginas`}
          {state === 'ready' && <>{pages} páginas. En el diálogo de impresión elige <strong className="text-parch-200">Guardar como PDF</strong>, márgenes «Ninguno» y desactiva «Encabezados y pies de página».</>}
          {state === 'error' && <span className="text-blood-500">No se pudo componer el libro: {error}</span>}
        </p>
      </div>
      <div ref={target} className="book-target" />
    </div>
  )
}
