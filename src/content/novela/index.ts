/**
 * «El Anillo Roto» — novela de la historia completa de Elden Ring.
 * Cada capítulo vive en un archivo Markdown de esta carpeta (se carga bajo demanda).
 * Prosa propia basada en las descripciones de objetos, diálogos y trasfondo del juego;
 * los diálogos son recreaciones libres, no transcripciones.
 */
export interface NovelChapter {
  slug: string
  book: number
  title: string
  era: string
}

export const NOVEL_TITLE = 'El Anillo Roto'
export const NOVEL_SUBTITLE = 'Novela de las Tierras Intermedias'

export const BOOKS = [
  { n: 1, title: 'Libro I', name: 'Antes del Árbol' },
  { n: 2, title: 'Libro II', name: 'La Edad del Oro' },
  { n: 3, title: 'Libro III', name: 'La Fractura' },
  { n: 4, title: 'Libro IV', name: 'El Sinluz' },
  { n: 5, title: 'Libro V', name: 'La Tierra de las Sombras' },
  { n: 6, title: 'Libro VI', name: 'La llama de la ruina' },
]

export const CHAPTERS: NovelChapter[] = [
  {
    slug: '01-la-tormenta',
    book: 1,
    title: 'La tormenta que no pasaba',
    era: 'Era de los Dragones',
  },
  { slug: '01a-el-draco-negro', book: 1, title: 'El draco negro', era: 'Era de los Dragones' },
  { slug: '01b-el-crisol', book: 1, title: 'El crisol', era: 'Era del Crisol' },
  {
    slug: '02-las-estrellas',
    book: 1,
    title: 'Los que miraban las estrellas',
    era: 'Era de los Dragones',
  },
  { slug: '03-las-chamanas', book: 1, title: 'La aldea de las chamanas', era: 'Era del Crisol' },
  { slug: '04-la-puerta-divina', book: 1, title: 'La Puerta Divina', era: 'Era del Crisol' },
  { slug: '04a-el-camino-del-oeste', book: 1, title: 'El camino del oeste', era: 'Era del Crisol' },
  {
    slug: '05-los-gigantes',
    book: 2,
    title: 'La guerra contra los gigantes',
    era: 'Albor del Árbol Áureo',
  },
  { slug: '05a-el-rey-barbaro', book: 2, title: 'El rey bárbaro', era: 'Albor del Árbol Áureo' },
  {
    slug: '06a-la-caceria-de-dioses',
    book: 2,
    title: 'La cacería de dioses',
    era: 'Albor del Árbol Áureo',
  },
  {
    slug: '06-ojos-lobregos',
    book: 2,
    title: 'La Reina de los Ojos Lóbregos',
    era: 'Albor del Árbol Áureo',
  },
  {
    slug: '06b-la-hoja-negra',
    book: 2,
    title: 'La Hoja Negra',
    era: 'Nacimiento de la Orden Áurea',
  },
  { slug: '07-la-abundancia', book: 2, title: 'La Edad de la Abundancia', era: 'Edad Dorada' },
  { slug: '07a-las-cloacas', book: 2, title: 'Las cloacas', era: 'Edad Dorada' },
  {
    slug: '08-el-dragon-y-el-principe',
    book: 2,
    title: 'El dragón y el príncipe',
    era: 'Edad Dorada',
  },
  { slug: '09-la-cruzada', book: 2, title: 'La cruzada', era: 'Edad Dorada' },
  {
    slug: '10-las-guerras-de-liurnia',
    book: 2,
    title: 'Las guerras de Liurnia',
    era: 'Edad Dorada',
  },
  { slug: '11-la-larga-marcha', book: 2, title: 'La Larga Marcha', era: 'Edad Dorada' },
  { slug: '12-el-segundo-senor', book: 2, title: 'El segundo Señor', era: 'Edad Dorada' },
  { slug: '13-el-nino-que-no-crecia', book: 2, title: 'El niño que no crecía', era: 'Edad Dorada' },
  {
    slug: '14-los-cuchillos-negros',
    book: 3,
    title: 'La noche de los cuchillos negros',
    era: 'La Fractura',
  },
  {
    slug: '15-el-principe-de-la-muerte',
    book: 3,
    title: 'El Príncipe de la Muerte',
    era: 'La Fractura',
  },
  { slug: '16-el-martillo', book: 3, title: 'El martillo', era: 'La Fractura' },
  {
    slug: '17-la-guerra-de-los-fragmentos',
    book: 3,
    title: 'La guerra de los fragmentos',
    era: 'La Fractura',
  },
  { slug: '18-aeonia', book: 3, title: 'Aeonia', era: 'La Fractura' },
  { slug: '19-la-capilla', book: 4, title: 'La Capilla de la Anticipación', era: 'Necrolimbo' },
  { slug: '20-la-doncella-sin-dedos', book: 4, title: 'La doncella sin dedos', era: 'Necrolimbo' },
  { slug: '21-margit', book: 4, title: 'El Augurio Caído', era: 'Necrolimbo' },
  { slug: '22-velo-tormentoso', book: 4, title: 'Velo Tormentoso', era: 'Necrolimbo' },
  { slug: '23-la-mesa-redonda', book: 4, title: 'La Mesa Redonda', era: 'Mesa Redonda' },
  { slug: '24-liurnia', book: 4, title: 'La bruja de la torre', era: 'Liurnia de los Lagos' },
  {
    slug: '24a-la-reina-de-la-luna-llena',
    book: 4,
    title: 'La Reina de la Luna Llena',
    era: 'Raya Lucaria',
  },
  { slug: '25-el-festival', book: 4, title: 'El festival de Radahn', era: 'Caelid' },
  {
    slug: '25a-la-caida-de-las-estrellas',
    book: 4,
    title: 'La caída de las estrellas',
    era: 'Dunas de Melenarroja',
  },
  { slug: '26-las-ciudades-eternas', book: 4, title: 'Las ciudades eternas', era: 'Nokron' },
  { slug: '26a-el-rio-ainsel', book: 4, title: 'El río Ainsel', era: 'Nokstella' },
  {
    slug: '26b-la-novia-de-la-noche',
    book: 4,
    title: 'La novia de la noche',
    era: 'Catedral de Manus Celes',
  },
  { slug: '27-la-mansion-del-volcan', book: 4, title: 'La meseta dorada', era: 'Altus' },
  {
    slug: '27a-el-senor-de-la-blasfemia',
    book: 4,
    title: 'El Señor de la Blasfemia',
    era: 'Monte Gelmir',
  },
  { slug: '28-la-capital-dorada', book: 4, title: 'La capital dorada', era: 'Leyndell' },
  { slug: '28a-el-que-vigila', book: 4, title: 'El que vigila', era: 'Leyndell' },
  { slug: '29-bajo-la-capital', book: 4, title: 'Bajo la capital', era: 'Leyndell' },
  {
    slug: '29a-las-raices-profundas',
    book: 4,
    title: 'Las raíces profundas',
    era: 'Profundidades de las raíces',
  },
  { slug: '30-el-senor-de-la-sangre', book: 4, title: 'El señor de la sangre', era: 'Mohgwyn' },
  {
    slug: '31-la-llanura-de-las-tumbas',
    book: 5,
    title: 'La llanura de las tumbas',
    era: 'Reino de las Sombras',
  },
  { slug: '31a-la-tinaja-roja', book: 5, title: 'La tinaja roja', era: 'Belurat' },
  { slug: '32-castillo-ensis', book: 5, title: 'Las lunas gemelas', era: 'Reino de las Sombras' },
  {
    slug: '33-el-jardin-purpura',
    book: 5,
    title: 'El jardín púrpura',
    era: 'Reino de las Sombras',
  },
  {
    slug: '34-el-pico-escarpado',
    book: 5,
    title: 'El pico de los dragones',
    era: 'Reino de las Sombras',
  },
  {
    slug: '35-el-torreon-de-la-sombra',
    book: 5,
    title: 'El Torreón de la Sombra',
    era: 'Reino de las Sombras',
  },
  { slug: '35a-el-que-arde', book: 5, title: 'El que arde', era: 'Torreón de la Sombra' },
  {
    slug: '36-los-dedos-rotos',
    book: 5,
    title: 'La madre de los dedos',
    era: 'Catedral de Manus Metyr',
  },
  {
    slug: '36a-el-senor-de-la-llama',
    book: 5,
    title: 'El señor de la llama',
    era: 'Bosques Abisales',
  },
  {
    slug: '37-la-santa-del-brote',
    book: 5,
    title: 'La santa del brote',
    era: 'Reino de las Sombras',
  },
  { slug: '38-enir-ilim', book: 5, title: 'Enir-Ilim', era: 'Reino de las Sombras' },
  {
    slug: '38a-el-consorte-prometido',
    book: 5,
    title: 'El consorte prometido',
    era: 'Puerta de la Divinidad',
  },
  {
    slug: '39-las-cumbres',
    book: 6,
    title: 'Las cumbres de los gigantes',
    era: 'Cumbres de los Gigantes',
  },
  { slug: '39a-castillo-sol', book: 6, title: 'Castillo Sol', era: 'Campo de Nieve Consagrado' },
  { slug: '40-el-arbol-halito', book: 6, title: 'El Árbol Hierático', era: 'Elphael' },
  {
    slug: '40a-la-espada-de-miquella',
    book: 6,
    title: 'La Espada de Miquella',
    era: 'Raíces del Árbol Hierático',
  },
  { slug: '41-la-forja', book: 6, title: 'La forja', era: 'Cumbres de los Gigantes' },
  { slug: '42-farum-azula', book: 6, title: 'Farum Azula', era: 'Farum Azula' },
  { slug: '43-la-capital-de-ceniza', book: 6, title: 'La capital de ceniza', era: 'Leyndell' },
  { slug: '43a-hoarah-loux', book: 6, title: 'Hoarah Loux', era: 'Explanada del Árbol' },
  { slug: '44-dentro-del-arbol', book: 6, title: 'Dentro del Árbol', era: 'El Árbol Áureo' },
  { slug: '44a-la-bestia-de-elden', book: 6, title: 'La Bestia de Elden', era: 'El Árbol Áureo' },
  {
    slug: '45-la-era-de-las-estrellas',
    book: 6,
    title: 'La Era de las Estrellas',
    era: 'Dentro del Árbol',
  },
  { slug: '45a-las-puertas-azules', book: 6, title: 'Las puertas azules', era: 'Tierras Áridas' },
  { slug: '46-epilogo', book: 6, title: 'Epílogo: las eras que no fueron', era: 'Después' },
]

const files = import.meta.glob('./*.md', { query: '?raw', import: 'default' }) as Record<
  string,
  () => Promise<string>
>

export function chapterExists(slug: string) {
  return `./${slug}.md` in files
}

export async function loadChapter(slug: string): Promise<string> {
  const f = files[`./${slug}.md`]
  if (!f) throw new Error(`Capítulo no encontrado: ${slug}`)
  return f()
}

export type Block =
  | { t: 'p'; html: string }
  | { t: 'h'; text: string }
  | { t: 'hr' }
  | { t: 'quote'; html: string }

const inline = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')

/** Markdown mínimo: párrafos, ## títulos, * * * separadores y > citas. */
export function parseChapter(md: string): Block[] {
  const blocks: Block[] = []
  for (const raw of md.replace(/\r/g, '').split(/\n\s*\n/)) {
    const b = raw.trim()
    if (!b) continue
    if (/^(\* \* \*|---|\*\*\*)$/.test(b)) blocks.push({ t: 'hr' })
    else if (b.startsWith('## ')) blocks.push({ t: 'h', text: b.slice(3).trim() })
    else if (b.startsWith('> '))
      blocks.push({
        t: 'quote',
        html: inline(
          b
            .split('\n')
            .map((l) => l.replace(/^>\s?/, ''))
            .join(' '),
        ),
      })
    else blocks.push({ t: 'p', html: inline(b.replace(/\n/g, ' ')) })
  }
  return blocks
}
