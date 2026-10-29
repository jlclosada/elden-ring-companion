import { BOOKS, CHAPTERS, NOVEL_SUBTITLE, NOVEL_TITLE, VOLUMES, type Block } from '../../content/novela'
import { CRONOLOGIA, EDICION, EPIGRAFES_LIBRO, EPIGRAFES_VOLUMEN, GLOSARIO, NOTA_EDITORIAL, capitulosDe, numeroEnLetras } from '../../content/novela/edicion'
import { CHAPTERS as CRONICAS, CHARACTERS, LORE_PARTS } from '../../data/lore'

export interface BookOptions {
  cronicas: boolean
  reparto: boolean
  glosario: boolean
  mapa: boolean
  a4: boolean
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const cap1 = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function blocksHtml(blocks: Block[]) {
  return blocks.map((b, i) =>
    b.t === 'hr' ? '<div class="pausa">✦ ✦ ✦</div>'
      : b.t === 'h' ? `<h3>${esc(b.text)}</h3>`
        : b.t === 'quote' ? `<blockquote>${b.html}</blockquote>`
          : `<p${i === 0 ? ' class="primero"' : ''}>${b.html}</p>`,
  ).join('\n')
}

/**
 * Compone el libro completo como HTML para Paged.js: preliminares, seis libros con sus portadillas,
 * capítulos y apéndices. El HTML de los capítulos ya viene escapado por parseChapter.
 */
export function buildBookHtml(chapters: Record<string, Block[]>, o: BookOptions): string {
  const written = CHAPTERS.map((c, i) => ({ ...c, n: i + 1 })).filter((c) => chapters[c.slug])
  const autor = EDICION.autor.trim()
  const out: string[] = []

  // ── Preliminares ─────────────────────────────────────────────
  out.push(`<section class="front halftitle"><h1>${esc(NOVEL_TITLE)}</h1></section>`)
  out.push(`<section class="front verso coleccion"><div class="sc">${esc(EDICION.coleccion)}</div><p>${esc(NOVEL_TITLE)}</p></section>`)
  out.push(`<section class="front titlepage">
    ${autor ? `<div class="autor">${esc(autor)}</div>` : ''}
    <h1>${esc(NOVEL_TITLE)}</h1>
    <div class="subtitulo">${esc(NOVEL_SUBTITLE)}</div>
    <div class="orn">✦</div>
    <div class="sello">${esc(EDICION.sello)}</div>
  </section>`)
  out.push(`<section class="front verso creditos">
    <p><em>${esc(NOVEL_TITLE)}</em>. ${esc(NOVEL_SUBTITLE)}.</p>
    <p>${esc(EDICION.edicion)}.</p>
    ${autor ? `<p>© del texto: ${esc(autor)}.</p>` : ''}
    <p>Obra de ficción derivada, escrita por y para aficionados. Elden Ring y Shadow of the Erdtree son marcas y obras protegidas de FromSoftware, Inc. y Bandai Namco Entertainment. Esta edición no está afiliada ni respaldada por sus titulares y no tiene fines comerciales.</p>
    <p>Los diálogos y los personajes secundarios son invención de esta edición.</p>
    <p>${esc(EDICION.sello)}</p>
  </section>`)
  out.push(`<section class="front dedicatoria">${esc(EDICION.dedicatoria)}</section>`)
  out.push(`<section class="front epigrafe-libro"><blockquote>${esc(EDICION.epigrafe.texto)}</blockquote><div class="fuente">${esc(EDICION.epigrafe.fuente)}</div></section>`)

  // Índice con números de página (target-counter)
  const backItems: { id: string; t: string }[] = []
  if (o.reparto) backItems.push({ id: 'ap-reparto', t: 'Dramatis personae' })
  if (o.glosario) backItems.push({ id: 'ap-glosario', t: 'Glosario' })
  backItems.push({ id: 'ap-cronologia', t: 'Cronología' })
  if (o.cronicas) backItems.push({ id: 'ap-cronicas', t: 'Crónicas breves' })
  const tocLine = (href: string, n: string, t: string) => `<li><a href="#${href}"><span class="n">${n}</span><span class="t">${esc(t)}</span><span class="dots"></span></a></li>`
  out.push(`<section class="front indice"><h2 class="seccion-titulo">Índice</h2>
    <ol class="grupo">${tocLine('nota', '', 'Nota a esta edición')}</ol>
    ${BOOKS.map((b) => `${VOLUMES.find((v) => v.parts[0] === b.n) ? `<div class="grupo"><div class="grupo-titulo volumen">${esc(VOLUMES.find((v) => v.parts[0] === b.n)!.title)} · ${esc(VOLUMES.find((v) => v.parts[0] === b.n)!.name)}</div></div>` : ''}<div class="grupo"><div class="grupo-titulo">${esc(b.title)} · ${esc(b.name)}</div><ol>
      ${written.filter((c) => c.book === b.n).map((c) => tocLine(`cap-${c.slug}`, `${c.n}`, c.title)).join('')}
    </ol></div>`).join('')}
    <div class="grupo"><div class="grupo-titulo">Apéndices</div><ol>${backItems.map((x) => tocLine(x.id, '', x.t)).join('')}</ol></div>
  </section>`)

  out.push(`<section class="front nota" id="nota"><h2 class="seccion-titulo">Nota a esta edición</h2>
    ${NOTA_EDITORIAL.map((p) => `<p>${esc(p)}</p>`).join('')}
    <p class="firma">${esc(EDICION.sello)}</p>
  </section>`)

  if (o.mapa) {
    out.push(`<section class="front mapa"><figure><img src="/tiles/surface-preview.webp" alt="Mapa de las Tierras Intermedias"><figcaption>Las Tierras Intermedias</figcaption></figure></section>`)
  }

  // ── Libros y capítulos ───────────────────────────────────────
  for (const b of BOOKS) {
    const vol = VOLUMES.find((v) => v.parts[0] === b.n)
    if (vol) {
      const ve = EPIGRAFES_VOLUMEN[vol.n]
      out.push(`<section class="part volumen">
      <div class="num">${esc(vol.title.toUpperCase())}</div>
      <h1>${esc(vol.name)}</h1>
      <div class="orn">✦ ✦ ✦</div>
      ${ve ? `<blockquote>${esc(ve.texto)}</blockquote><div class="fuente">${esc(ve.fuente)}</div>` : ''}
    </section>`)
    }
    const epi = EPIGRAFES_LIBRO[b.n]
    out.push(`<section class="part">
      <div class="num">${esc(b.title.toUpperCase())}</div>
      <h1>${esc(b.name)}</h1>
      <div class="orn">✦</div>
      ${epi ? `<blockquote>${esc(epi.texto)}</blockquote><div class="fuente">${esc(epi.fuente)}</div>` : ''}
    </section>`)
    if (o.mapa && b.n === 6) {
      out.push(`<section class="front mapa"><figure><img src="/tiles/shadow-preview.webp" alt="Mapa de la Tierra de las Sombras"><figcaption>La Tierra de las Sombras</figcaption></figure></section>`)
    }
    for (const c of written.filter((x) => x.book === b.n)) {
      out.push(`<section class="chapter" id="cap-${c.slug}">
        <header>
          <div class="num">Capítulo ${numeroEnLetras(c.n)}</div>
          <h2 class="titulillo">${esc(c.title)}</h2>
          <div class="era">${esc(c.era)}</div>
        </header>
        <div class="texto">${blocksHtml(chapters[c.slug])}</div>
      </section>`)
    }
  }

  // ── Apéndices ────────────────────────────────────────────────
  if (o.reparto) {
    out.push(`<section class="back reparto" id="ap-reparto"><h2 class="seccion-titulo titulillo">Dramatis personae</h2><dl>
      ${CHARACTERS.map((ch) => `<div class="entrada"><dt>${esc(ch.name)}, <span class="rol">${esc(cap1(ch.title))}</span></dt><dd>${esc(ch.bio)}</dd></div>`).join('')}
    </dl></section>`)
  }
  if (o.glosario) {
    out.push(`<section class="back glosario" id="ap-glosario"><h2 class="seccion-titulo titulillo">Glosario</h2><dl>
      ${GLOSARIO.map((g) => `<div class="entrada"><dt>${esc(g.termino)}</dt><dd>${esc(g.definicion)}</dd></div>`).join('')}
    </dl></section>`)
  }
  out.push(`<section class="back cronologia" id="ap-cronologia"><h2 class="seccion-titulo titulillo">Cronología</h2><table>
    ${CRONOLOGIA.map((r) => `<tr><td class="era">${esc(r.era)}</td><td>${esc(r.hechos)}</td><td class="caps">cap. ${capitulosDe(r)}</td></tr>`).join('')}
  </table></section>`)
  if (o.cronicas) {
    out.push(`<section class="back cronica" id="ap-cronicas"><h2 class="seccion-titulo titulillo">Crónicas breves</h2>
      ${LORE_PARTS.map((part) => CRONICAS.filter((c) => c.part === part).map((c) => `
        <h3>${esc(c.title)}</h3><div class="epi">${esc(c.epigraph)}</div>
        ${c.sections.map((s) => `${s.heading ? `<h4>${esc(s.heading)}</h4>` : ''}${s.text.map((t) => `<p>${esc(t)}</p>`).join('')}`).join('')}
      `).join('')).join('')}
    </section>`)
  }
  out.push(`<section class="back colofon">
    <div class="orn">✦</div>
    <p class="sc">${esc(EDICION.sello)}</p>
  </section>`)

  return `<article class="libro${o.a4 ? ' a4' : ''}" lang="es">${out.join('\n')}</article>`
}
