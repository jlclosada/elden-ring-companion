// Extractor de Shadow of the Erdtree desde la wiki de Fandom.
// La Fan API solo cubre el juego base, así que el DLC se obtiene de las páginas
// "X (Shadow of the Erdtree)" y del infobox de cada objeto.
const WIKI = 'https://eldenring.fandom.com/api.php'

const SOURCES = {
  weapons: ['Melee Armaments (Shadow of the Erdtree)', 'Ranged Weapons/Catalysts (Shadow of the Erdtree)'],
  shields: ['Shields (Shadow of the Erdtree)'],
  talismans: ['Talismans (Shadow of the Erdtree)'],
  sorceries: ['Sorceries (Shadow of the Erdtree)'],
  incantations: ['Incantations (Shadow of the Erdtree)'],
  ashes: ['Ashes of War (Shadow of the Erdtree)'],
  spirits: ['Ashes (Shadow of the Erdtree)'],
  items: ['Key Items (Shadow of the Erdtree)', 'Tools (Shadow of the Erdtree)', 'Bolstering Materials (Shadow of the Erdtree)'],
  // No hay listado de armaduras del DLC: se filtra la página general por marcador de DLC
  armors: ['Armor'],
}

const DLC_MARKER = /\{\{\s*(SotE|in\s*\|\s*se)\s*\}\}|Shadow of the Erdtree|Realm of Shadow|Land of Shadow/i

async function api(params, tries = 3) {
  const url = `${WIKI}?${new URLSearchParams({ format: 'json', ...params })}`
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'elden-ring-companion-data/1.0' } })
      if (r.ok) return await r.json()
    } catch { /* reintento */ }
    await new Promise((res) => setTimeout(res, 700 * (i + 1)))
  }
  return null
}

async function listLinks(page) {
  const d = await api({ action: 'parse', page, prop: 'links', redirects: '1' })
  return (d?.parse?.links ?? []).filter((l) => l.ns === 0).map((l) => l['*'])
}

const clean = (s = '') => {
  let out = s
  for (let i = 0; i < 3; i++) out = out.replace(/\{\{[^{}]*\}\}/g, '')
  return out
    .replace(/<ref[^>]*\/>|<ref[^>]*>[\s\S]*?<\/ref>/g, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[(?:File|Image):[^\]]*\]\]/gi, '')
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/\s+\n/g, '\n')
    .trim()
}

function infobox(wt) {
  const m = wt.match(/\{\{\s*Infobox[^|]*([\s\S]*?)\n\}\}/i)
  const fields = {}
  if (!m) return fields
  for (const line of m[1].split(/\n?\s*\|(?=\s*[a-z_0-9]+\s*=)/i)) {
    const i = line.indexOf('=')
    if (i === -1) continue
    fields[line.slice(0, i).replace(/^\|/, '').trim().toLowerCase()] = line.slice(i + 1).trim()
  }
  return fields
}

function section(wt, names) {
  const re = new RegExp(`^==\\s*(${names})\\s*==\\s*$`, 'im')
  const m = wt.match(re)
  if (!m) return null
  const rest = wt.slice(m.index + m[0].length)
  const end = rest.search(/^==[^=]/m)
  const body = clean(end === -1 ? rest : rest.slice(0, end))
    .split('\n').map((l) => l.replace(/^[*#:]+\s*/, '').trim())
    .filter((l) => l && !l.startsWith('{|') && !l.startsWith('|') && !l.startsWith('!'))
    .join('\n')
  return body.slice(0, 600) || null
}

const num = (v) => (v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v))
const reqs = (f) => {
  const out = {}
  for (const [k, api] of [['str', 'Str'], ['dex', 'Dex'], ['int', 'Int'], ['fai', 'Fai'], ['arc', 'Arc']]) {
    const v = num(f[`${k}_req`]); if (v) out[api] = v
  }
  return out
}
const scaling = (f) => {
  const out = {}
  for (const [k, api] of [['str', 'Str'], ['dex', 'Dex'], ['int', 'Int'], ['fai', 'Fai'], ['arc', 'Arc']]) {
    const v = (f[`${k}_scale`] ?? '').trim(); if (v && v !== '-') out[api] = v
  }
  return out
}

function toEntry(cat, title, wt, image) {
  const f = infobox(wt)
  const desc = [...wt.matchAll(/\|\s*EN_line\d\s*=\s*([\s\S]*?)(?=\n\s*\||\n?\}\})/g)].map((m) => clean(m[1])).join(' ').trim()
  const base = {
    id: `dlc-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: title.replace(/\s*\(spell\)$/i, ''),
    image, description: desc, dlc: true,
    obtain: section(wt, 'Acquisition|Location|Locations|Availability') ?? (f.obtained ? clean(f.obtained) : null),
  }
  const effect = clean(f.item_effect ?? f.effects ?? f.effect ?? '') || undefined
  switch (cat) {
    case 'weapons':
    case 'shields':
      return { ...base, category: clean(f.type ?? ''), weight: num(f.weight), requires: reqs(f), scaling: scaling(f), effect,
        attack: { Phy: num(f.physical_power) ?? 0, Mag: num(f.magic_power) ?? 0, Fire: num(f.fire_power) ?? 0, Ligt: num(f.lightning_power) ?? 0, Holy: num(f.holy_power) ?? 0, Crit: num(f.critical) ?? 0 } }
    case 'sorceries':
    case 'incantations':
      return { ...base, cost: num(f.fp_cost), slots: num(f.slots_used ?? f.slots), effect,
        requires: { Intelligence: num(f.int_req) ?? 0, Faith: num(f.fai_req) ?? 0, Arcane: num(f.arc_req) ?? 0 } }
    case 'armors':
      return { ...base, category: clean(f.type ?? f.slot ?? ''), weight: num(f.weight), effect }
    case 'ashes':
      return { ...base, affinity: clean(f.affinity ?? ''), skill: clean(f.skill ?? f.skills ?? '') || effect }
    case 'spirits':
      return { ...base, fpCost: num(f.fp_cost), effect }
    default:
      return { ...base, type: clean(f.type ?? ''), effect }
  }
}

async function images(titles) {
  const out = {}
  for (let i = 0; i < titles.length; i += 50) {
    const d = await api({ action: 'query', prop: 'pageimages', piprop: 'original', redirects: '1', titles: titles.slice(i, i + 50).join('|') })
    const norm = Object.fromEntries((d?.query?.redirects ?? []).map((r) => [r.to, r.from]))
    for (const p of Object.values(d?.query?.pages ?? {})) {
      const src = p.original?.source
      if (src) out[norm[p.title] ?? p.title] = src.replace('/revision/latest', '/revision/latest/scale-to-width-down/160')
    }
  }
  return out
}

/** Devuelve { [cat]: entries[] } con el contenido del DLC. `baseNames` evita duplicar el juego base. */
export async function fetchDlc(baseNames, pool) {
  const result = {}
  for (const [cat, pages] of Object.entries(SOURCES)) {
    const titles = [...new Set((await Promise.all(pages.map(listLinks))).flat())]
      .filter((t) => !/Shadow of the Erdtree|^Elden Ring|^(Armor|Armaments|Ammunition|Ashes|Ashes of War|Bolstering Materials|Catalysts|Crafting Materials|Incantations|Info|Key Items|Melee Armaments|Ranged Armaments|Ranged Weapons|Ranged Weapons\/Catalysts|Shields|Sorceries|Spirit Ashes|Talismans|Tools|Weapons)$/i.test(t))
      .filter((t) => !baseNames[cat]?.has(t.toLowerCase()))
    const imgs = await images(titles)
    const entries = []
    await pool(titles, 6, async (title) => {
      const d = await api({ action: 'parse', page: title, prop: 'wikitext', redirects: '1' })
      const wt = d?.parse?.wikitext?.['*']
      if (!wt || !/\{\{\s*Infobox/i.test(wt)) return
      if (!DLC_MARKER.test(wt)) return
      entries.push(toEntry(cat, title, wt, imgs[title] ?? null))
    })
    entries.sort((a, b) => a.name.localeCompare(b.name))
    result[cat] = entries
    process.stdout.write(`  DLC ${cat}: ${entries.length}\n`)
  }
  return result
}
