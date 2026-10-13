// Recopila el compendio completo de Elden Ring:
//  1) Datos estructurados de https://eldenring.fanapis.com (estadísticas, imágenes, escalados)
//  2) Sección "Acquisition" de cada objeto desde la wiki de Fandom (dónde se consigue)
// Uso: node scripts/fetch-data.mjs [--no-wiki]
import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fetchDlc } from './dlc.mjs'

const API = 'https://eldenring.fanapis.com/api'
const WIKI = 'https://eldenring.fandom.com/api.php'
const OUT = new URL('../src/data/generated/', import.meta.url)
const CACHE = new URL('../scripts/.wiki-cache.json', import.meta.url)
const withWiki = !process.argv.includes('--no-wiki')
const withDlc = !process.argv.includes('--no-dlc')

const CATEGORIES = [
  'weapons', 'shields', 'armors', 'talismans', 'sorceries', 'incantations',
  'ashes', 'spirits', 'items', 'ammos', 'bosses', 'locations', 'npcs', 'classes',
]
// Categorías para las que tiene sentido buscar "cómo se obtiene"
const WIKI_CATEGORIES = new Set(['weapons', 'shields', 'armors', 'talismans', 'sorceries', 'incantations', 'ashes', 'spirits', 'items'])

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'elden-ring-companion-data/1.0' } })
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      return await res.json()
    } catch (e) {
      if (i === tries - 1) throw e
      await sleep(800 * (i + 1))
    }
  }
}

async function fetchCategory(cat) {
  const all = []
  for (let page = 0; ; page++) {
    const { data, total } = await getJson(`${API}/${cat}?limit=100&page=${page}`)
    all.push(...data)
    if (all.length >= total || data.length === 0) break
  }
  // La API tiene duplicados ocasionales
  const seen = new Set()
  return all.filter((x) => (seen.has(x.name) ? false : seen.add(x.name)))
}

// ---- Wiki ----------------------------------------------------------------
function wikiTitle(name, cat) {
  let t = name.trim()
  if (cat === 'ashes') t = t.replace(/^Ash of War:\s*/i, 'Ash of War: ')
  // La API usa "Title Case" agresivo (p.ej. "Briars Of Punishment")
  t = t.replace(/\b(Of|The|And|In|To|A|With|From)\b/g, (m, w, off) => (off === 0 ? m : m.toLowerCase()))
  return t
}

function wikiTitles(name, cat) {
  const t = wikiTitle(name, cat)
  const hyphen = t.replace(/-([a-z])/g, (_, c) => '-' + c.toUpperCase()).replace(/\((\w)/g, (_, c) => '(' + c.toUpperCase())
  const noAltered = t.replace(/\s*\(altered\)/i, '')
  const plural = t.replace(/^Ashes Of War:/i, 'Ash of War:')
  const noQual = t.replace(/\s*\[\d+\]$/, '')
  return [...new Set([t, hyphen, plural, noAltered, noQual, hyphen.replace(/\s*\(Altered\)/, '')])]
}

function cleanWikitext(s) {
  let out = s
  for (let i = 0; i < 3; i++) out = out.replace(/\{\{[^{}]*\}\}/g, '')
  return out
    .replace(/<ref[^>]*\/>/g, '')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[(?:File|Image):[^\]]*\]\]/gi, '')
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/\[https?:\S+ ([^\]]*)\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/\n{2,}/g, '\n')
    .split('\n')
    .map((l) => l.replace(/^[*#:]+\s*/, '').trim())
    .filter((l) => l && !l.startsWith('{|') && !l.startsWith('|') && !l.startsWith('!'))
    .join('\n')
    .trim()
}

function extractAcquisition(wikitext) {
  const re = /^==\s*(Acquisition|Location|Locations|Availability|Where to find|How to get)\s*==\s*$/im
  const m = wikitext.match(re)
  if (!m) {
    // Algunas páginas solo lo indican en el infobox (| obtained = …)
    const inf = wikitext.match(/^\|\s*(?:obtained|location|acquisition)\s*=\s*(.+)$/im)
    return inf ? cleanWikitext(inf[1]).slice(0, 600) || null : null
  }
  const start = m.index + m[0].length
  const rest = wikitext.slice(start)
  const end = rest.search(/^==[^=]/m)
  const text = cleanWikitext(end === -1 ? rest : rest.slice(0, end))
  return text ? text.slice(0, 600) : null
}

async function wikiAcquisition(title) {
  const url = `${WIKI}?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&redirects=1&format=json`
  try {
    const json = await getJson(url, 2)
    const wt = json?.parse?.wikitext?.['*']
    return wt ? extractAcquisition(wt) : null
  } catch {
    return null
  }
}

async function pool(items, size, fn) {
  let i = 0
  const workers = Array.from({ length: size }, async () => {
    while (i < items.length) {
      const idx = i++
      await fn(items[idx], idx)
    }
  })
  await Promise.all(workers)
}

// ---- Normalización -------------------------------------------------------
const num = (v) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v))
const stats = (arr) => Object.fromEntries((arr ?? []).map((a) => [a.name, a.amount ?? a.scaling]))

function normalize(cat, x) {
  const base = { id: x.id, name: x.name, image: x.image ?? null, description: x.description ?? '' }
  switch (cat) {
    case 'weapons':
    case 'shields':
      return { ...base, category: x.category, weight: num(x.weight), attack: stats(x.attack), defence: stats(x.defence), scaling: stats(x.scalesWith), requires: stats(x.requiredAttributes) }
    case 'armors':
      return { ...base, category: x.category, weight: num(x.weight), negation: stats(x.dmgNegation), resistance: stats(x.resistance) }
    case 'talismans':
      return { ...base, effect: x.effect }
    case 'sorceries':
    case 'incantations':
      return { ...base, cost: num(x.cost), slots: num(x.slots), effect: x.effects, requires: stats(x.requires) }
    case 'ashes':
      return { ...base, affinity: x.affinity, skill: x.skill }
    case 'spirits':
      return { ...base, fpCost: num(x.fpCost), hpCost: num(x.hpCost), effect: x.effect }
    case 'items':
      return { ...base, type: x.type, effect: x.effect }
    case 'ammos':
      return { ...base, type: x.type, passive: x.passive, attack: stats(x.attackPower) }
    case 'bosses':
      return { ...base, region: x.region, location: x.location, drops: x.drops ?? [], hp: x.healthPoints }
    case 'locations':
      return { ...base, region: x.region }
    case 'npcs':
      return { ...base, location: x.location, role: x.role?.trim(), quote: x.quote }
    case 'classes':
      return { ...base, stats: Object.fromEntries(Object.entries(x.stats ?? {}).map(([k, v]) => [k, num(v)])) }
    default:
      return base
  }
}

// ---- Correcciones manuales ----------------------------------------------
// La Fan API tiene erratas de nombre y algún hueco; se corrigen aquí.
const RENAMES = { 'Terra Magicus': 'Terra Magica', 'Burn O Flame!': 'Burn, O Flame!', "Ezykes's Decay": null }
const ADDITIONS = {
  incantations: [{
    id: 'manual-fgms', name: 'Flame, Grant Me Strength', image: 'https://static.wikia.nocookie.net/eldenring/images/7/75/ER_Icon_Spell_Flame%2C_Grant_Me_Strength.png/revision/latest/scale-to-width-down/160?cb=20220410221824', cost: 28, slots: 1,
    description: 'Incantation of the Fire Giants. Grants the strength of fire to the caster, raising physical and fire attack.',
    effect: 'Raises physical and fire attack power', requires: { Intelligence: 0, Faith: 15, Arcane: 0 },
  }],
}
function applyFixes(cat, items) {
  const out = []
  for (const it of items) {
    if (it.name in RENAMES) {
      if (RENAMES[it.name] === null) continue
      it.name = RENAMES[it.name]
    }
    out.push(it)
  }
  for (const add of ADDITIONS[cat] ?? []) if (!out.some((x) => x.name === add.name)) out.push({ ...add })
  return out
}

// ---- Main ----------------------------------------------------------------
await mkdir(OUT, { recursive: true })
const cache = existsSync(CACHE) ? JSON.parse(await readFile(CACHE, 'utf8')) : {}
const summary = {}
const byCat = {}

for (const cat of CATEGORIES) {
  process.stdout.write(`· ${cat} … `)
  const raw = await fetchCategory(cat)
  const items = applyFixes(cat, raw.map((x) => normalize(cat, x)))
  if (withWiki && WIKI_CATEGORIES.has(cat)) {
    let found = 0
    await pool(items, 6, async (it) => {
      for (const title of wikiTitles(it.name, cat)) {
        if (!cache[title]) cache[title] = await wikiAcquisition(title)
        it.obtain = cache[title]
        if (it.obtain) break
      }
      if (it.obtain) found++
    })
    process.stdout.write(`${items.length} (${found} con ubicación) `)
  } else process.stdout.write(`${items.length} `)
  byCat[cat] = items
  console.log('✓')
}

const dlcCounts = {}
if (withDlc) {
  console.log('· Shadow of the Erdtree (wiki) …')
  const baseNames = Object.fromEntries(Object.entries(byCat).map(([c, list]) => [c, new Set(list.map((x) => x.name.toLowerCase()))]))
  const dlc = await fetchDlc(baseNames, pool)
  for (const [cat, list] of Object.entries(dlc)) {
    byCat[cat] = [...(byCat[cat] ?? []), ...list]
    dlcCounts[cat] = list.length
  }
}

for (const [cat, items] of Object.entries(byCat)) {
  summary[cat] = items.length
  await writeFile(new URL(`${cat}.json`, OUT), JSON.stringify(items))
}
await writeFile(CACHE, JSON.stringify(cache))
await writeFile(new URL('summary.json', OUT), JSON.stringify({ generatedAt: new Date().toISOString(), counts: summary, dlc: dlcCounts }, null, 2))
console.log('Hecho:', summary)
