// Genera el mapa interactivo:
//  1) Descarga los mapas del juego en alta resolución y los datos de marcadores del proyecto
//     CreateDDy/EldenRing_MapInteractive (licencia MIT) — coordenadas en píxeles de esos mapas.
//  2) Trocea cada mapa en teselas WebP (layout Google z/y/x) para Leaflet → public/tiles/<capa>/
//  3) Normaliza marcadores reales (gracias, jefes, mazmorras, semillas, lágrimas, fragmentos…)
//  4) Geolocaliza cada objeto del compendio cruzando su texto "Acquisition" con los lugares conocidos
//  5) Asigna coordenadas reales a los lugares usados por las tareas/builds de la app
// Uso: node scripts/build-map.mjs [--force-tiles]
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile, readdir, copyFile, rm } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = new URL('..', import.meta.url).pathname
const CACHE = join(ROOT, '.cache/createdd')
const PKG = join(CACHE, 'EldenRingMap.V1.2')
const VENDOR = join(ROOT, 'data-src/createdd')
const TILES = join(ROOT, 'public/tiles')
const ICONS = join(ROOT, 'public/map-icons')
const GEN = join(ROOT, 'src/data/generated')
const RELEASE = 'https://github.com/CreateDDy/EldenRing_MapInteractive/releases/download/V1.2.5/EldenRingMap.V1.2.zip'
const force = process.argv.includes('--force-tiles')

const LAYERS = {
  surface: { file: 'map_surface.jpg' },
  underground: { file: 'map_underground.jpg' },
  shadow: { file: 'map_dlc.jpg', src: 'dlc' },
}

// ───────── 1. Assets ─────────
async function ensureAssets() {
  if (existsSync(join(PKG, 'maps/map_surface.jpg'))) return
  await mkdir(CACHE, { recursive: true })
  const zip = join(CACHE, 'release.zip')
  if (!existsSync(zip)) {
    console.log('· Descargando mapas y datos (≈380 MB, solo la primera vez)…')
    const res = await fetch(RELEASE, { redirect: 'follow' })
    if (!res.ok) throw new Error(`Descarga fallida: ${res.status}`)
    await writeFile(zip, Buffer.from(await res.arrayBuffer()))
  }
  console.log('· Extrayendo…')
  execFileSync('unzip', ['-o', '-q', zip, 'EldenRingMap.V1.2/maps/*', 'EldenRingMap.V1.2/DATA/*', 'EldenRingMap.V1.2/icons/markers/*', '-d', CACHE])
}

// ───────── 2. Teselas ─────────
async function buildTiles() {
  const meta = {}
  for (const [layer, { file }] of Object.entries(LAYERS)) {
    const src = join(PKG, 'maps', file)
    const m = await sharp(src, { limitInputPixels: false }).metadata()
    const maxZoom = Math.ceil(Math.log2(Math.max(m.width, m.height) / 256))
    meta[layer] = { width: m.width, height: m.height, maxZoom }
    const out = join(TILES, layer)
    if (existsSync(join(out, '0/0/0.webp')) && !force) continue
    console.log(`· Teselas ${layer} (${m.width}×${m.height}, z0-${maxZoom})…`)
    await rm(out, { recursive: true, force: true })
    await sharp(src, { limitInputPixels: false })
      .webp({ quality: 80, effort: 4 })
      .tile({ size: 256, layout: 'google', background: { r: 11, g: 9, b: 7, alpha: 1 } })
      .toFile(out)
    // Vista previa para la portada
    await sharp(src, { limitInputPixels: false }).resize(1800).webp({ quality: 72 }).toFile(join(TILES, `${layer}-preview.webp`))
  }
  return meta
}

// ───────── 3. Iconos ─────────
const ICON_FILES = {
  grace: 'grace.png', story_boss: 'story_bosses.png', field_boss: 'field_bosses.png', night_boss: 'night_cavalry.png',
  evergaol: 'evergaols.png', golden_seed: 'golden_seed.png', sacred_tear: 'sacred_tear.png', scadutree: 'scadutree.png',
  revered_ash: 'rspirit_ash.png', mausoleum: 'mausoleum.png', merchant: 'merchant.png', hub: 'hub.png', death_bird: 'death_bird.png',
}
async function buildIcons() {
  await mkdir(ICONS, { recursive: true })
  for (const [id, f] of Object.entries(ICON_FILES)) {
    const src = join(PKG, 'icons/markers', f)
    if (existsSync(src)) await sharp(src).resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toFile(join(ICONS, `${id}.webp`))
  }
}

// ───────── 4. Marcadores reales ─────────
const REGION_MAP = {
  limgrave: 'limgrave', stranded_graveyard: 'limgrave', stormhill: 'limgrave', stormveil_castle: 'limgrave',
  weeping_peninsula: 'weeping', 'liurnia of the lakes': 'liurnia', liurnia_of_the_lakes: 'liurnia', bellum_highway: 'liurnia',
  'ruin-strewn_precipice': 'liurnia', moonlight_altar: 'liurnia', raya_lucaria_academy: 'liurnia', caria_manor: 'liurnia',
  altus_plateau: 'altus', 'mt._gelmir': 'gelmir', volcano_manor: 'gelmir', capital_outskirts: 'leyndell',
  'leyndell,_royal_capital': 'leyndell', leyndell_royal_capital: 'leyndell', subterranean_shunning_grounds: 'shunning',
  caelid: 'caelid', "greyoll's_dragonbarrow": 'dragonbarrow', dragonbarrow: 'dragonbarrow', forbidden_lands: 'forbidden',
  mountaintops_of_the_giants: 'mountaintops', consecrated_snowfield: 'snowfield', "miquella's_haligtree": 'haligtree',
  'elphael,_brace_of_the_haligtree': 'haligtree', crumbling_farum_azula: 'farum', 'leyndell,_ashen_capital': 'leyndell',
  ainsel_river: 'ainsel', ainsel_river_main: 'ainsel', lake_of_rot: 'lakeofrot', siofra_river: 'siofra',
  'nokron,_eternal_city': 'nokron', mohgwyn_palace: 'mohgwyn', deeproot_depths: 'deeproot',
  gravesite_plaint: 'gravesite', gravesite_plain: 'gravesite', castle_ensis: 'gravesite', belurat_tower_settlement: 'gravesite',
  cerulean_coast: 'cerulean', "charo's_hidden_grave": 'charo', stone_coffin_fissure: 'charo', jagged_peak: 'jagged',
  scadu_altus: 'scadu', abyssal_woods: 'abyssal', "midra's_manse": 'abyssal', shadow_keep: 'scadu', scaduview: 'hinterland',
  'ancient_ruins_of_rauh': 'rauh', 'enir-ilim': 'enir', hinterland: 'hinterland',
}
const regionOf = (raw) => (raw ? REGION_MAP[raw.toLowerCase().replace(/\s+/g, '_')] ?? REGION_MAP[raw.toLowerCase()] ?? null : null)
const layerOf = (raw) => (raw === 'dlc' ? 'shadow' : raw === 'Hub' ? 'surface' : raw)

async function readData(rel) {
  return JSON.parse(await readFile(join(VENDOR, rel), 'utf8'))
}

async function vendorData() {
  await mkdir(VENDOR, { recursive: true })
  const walk = async (dir, rel = '') => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (e.name === '__pycache__') continue
      if (e.isDirectory()) { await mkdir(join(VENDOR, rel, e.name), { recursive: true }); await walk(join(dir, e.name), join(rel, e.name)) }
      else if (e.name.endsWith('.json')) await copyFile(join(dir, e.name), join(VENDOR, rel, e.name))
    }
  }
  if (existsSync(join(PKG, 'DATA'))) await walk(join(PKG, 'DATA'))
}

const lootName = (l) => (typeof l === 'string' ? l.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : l?.en ?? '')

async function buildMarkers(layersMeta) {
  const markers = []
  const add = (m) => {
    const L = layersMeta[m.layer]
    if (!L || !Number.isFinite(m.x) || !Number.isFinite(m.y) || m.x < 0 || m.y < 0 || m.x > L.width || m.y > L.height) return // descarta coordenadas corruptas
    markers.push(m)
  }
  const nested = (data, cat, fn = () => ({})) => {
    for (const [layerRaw, groups] of Object.entries(data)) {
      const entries = Array.isArray(groups) ? [[null, groups]] : Object.entries(groups)
      for (const [group, list] of entries) for (const p of list) {
        add({ id: `${cat}:${p.id ?? `${layerRaw}-${p.x}-${p.y}`}`, cat, layer: layerOf(p.map_layer === 'surface' && layerRaw === 'Hub' ? 'surface' : layerRaw),
          x: Math.round(p.x), y: Math.round(p.y), name: p.name_en ?? '', desc: p.description_en ?? '', region: regionOf(group), ...fn(p, group) })
      }
    }
  }
  nested(await readData('locations/graces.json'), 'grace', (p, g) => (g === 'Limgrave' && p.name_en === 'Roundtable Hold' ? { cat: 'hub' } : {}))
  nested(await readData('locations/dungeons.json'), 'dungeon', (p) => ({ loot: (p.loot || []).map(lootName).filter(Boolean) }))
  nested(await readData('locations/evergaols.json'), 'evergaol', (p) => ({ loot: (p.loot_items || []).map(lootName).filter(Boolean) }))
  nested(await readData('locations/mausoleum.json'), 'mausoleum')
  nested(await readData('locations/mausoleum_coffin.json'), 'mausoleum')
  nested(await readData('npc/merchant.json'), 'merchant')
  nested(await readData('key_items/golden_seeds.json'), 'golden_seed')
  nested(await readData('key_items/sacred_tears.json'), 'sacred_tear', () => ({ name: 'Sacred Tear' }))
  nested(await readData('key_items/scadutree.json'), 'scadutree')
  nested(await readData('key_items/rspirit_ash.json'), 'revered_ash')
  for (const [file, cat] of [['enemies/story_bosses.json', 'story_boss'], ['enemies/other_bosses.json', 'field_boss']]) {
    const d = await readData(file)
    for (const [layerRaw, list] of Object.entries(d)) for (const p of list) {
      add({ id: `${cat}:${p.id}`, cat, layer: layerOf(layerRaw), x: Math.round(p.x), y: Math.round(p.y), name: p.name_en, desc: p.description_en ?? '',
        loot: (p.loot_items || []).map(lootName).filter(Boolean) })
    }
  }
  const night = await readData('enemies/night_boss.json')
  for (const [kind, list] of Object.entries(night)) for (const p of list) {
    add({ id: `night_boss:${kind}-${p.id}`, cat: kind === 'death_rite_birds' || kind === 'death_birds' ? 'death_bird' : 'night_boss', layer: 'surface',
      x: Math.round(p.x), y: Math.round(p.y), name: p.name_en, desc: p.description_en ?? '', loot: (p.loot_items || []).map(lootName).filter(Boolean) })
  }
  // ids únicos
  const seen = new Map()
  for (const m of markers) { const n = seen.get(m.id) ?? 0; seen.set(m.id, n + 1); if (n) m.id = `${m.id}~${n}` }
  return markers
}

// ───────── 5. Geolocalización de objetos ─────────
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()
// Nombres demasiado genéricos o repetidos para ubicar un objeto
const STOP = new Set(['isolated merchant', 'nomadic merchant', 'abandoned merchant', 'hermit merchant', 'death rite bird', "night's cavalry", 'golden seed', 'sacred tear',
  'scadutree fragment', 'revered spirit ash', 'roundtable hold', 'stormveil', 'rise', 'temple', 'church', 'cave', 'catacombs', 'tunnel'])

function placeIndex(markers) {
  const byName = new Map()
  for (const m of markers) {
    if (!['grace', 'dungeon', 'evergaol', 'mausoleum', 'story_boss', 'field_boss', 'merchant'].includes(m.cat)) continue
    const n = norm(m.name)
    if (n.length < 5 || STOP.has(n)) continue
    if (!byName.has(n)) byName.set(n, [])
    byName.get(n).push(m)
  }
  // Variantes sin el artículo inicial ("The First Step" → "First Step")
  for (const [n, list] of [...byName]) if (n.startsWith('the ')) byName.set(n.slice(4), list)
  return [...byName.entries()].sort((a, b) => b[0].length - a[0].length)
}

const SHOP = /^(purchase|sold|can be purchased|trade|exchange)|remembrance|finger reader enia|twin maiden husks|starting (weapon|equipment|armor)|keepsake|origin/i

function locate(index, text) {
  const t = ` ${norm(text)} `
  let best = null
  for (const [name, list] of index) {
    const i = t.indexOf(` ${name} `)
    if (i === -1) continue
    // Prefiere el nombre más largo; a igual longitud, el que aparece antes
    if (!best || name.length > best.name.length || (name.length === best.name.length && i < best.i)) best = { name, list, i }
  }
  if (!best) return null
  return best.list[0]
}

async function geolocateItems(markers) {
  const index = placeIndex(markers)
  const cats = ['weapons', 'shields', 'armors', 'talismans', 'sorceries', 'incantations', 'ashes', 'spirits', 'items']
  const out = []
  const stats = {}
  for (const cat of cats) {
    const list = JSON.parse(await readFile(join(GEN, `${cat}.json`), 'utf8'))
    let placed = 0
    for (const e of list) {
      if (!e.obtain) continue
      const firstLine = e.obtain.split('\n')[0]
      if (SHOP.test(firstLine)) continue
      if (cat === 'armors' && /\((altered)\)/i.test(e.name)) continue
      if (cat === 'items' && /^(smithing stone|somber smithing stone|golden rune|rune arc|stonesword key|ghost glovewort|grave glovewort|lord's rune|hero's rune|numen's rune)/i.test(e.name)) continue
      const place = locate(index, e.obtain)
      if (!place) continue
      out.push({ id: `item:${cat}:${e.id}`, cat: `item_${cat}`, layer: place.layer, px: place.x, py: place.y, x: place.x, y: place.y, name: e.name,
        desc: e.obtain.split('\n').slice(0, 2).join(' '), ref: { cat, name: e.name }, near: place.name, region: place.region, approx: true, dlc: Boolean(e.dlc), image: e.image ?? null })
      placed++
    }
    stats[cat] = placed
  }
  // Reparte los objetos de un mismo lugar en una espiral alrededor del punto
  const groups = new Map()
  for (const m of out) { const k = `${m.layer}:${m.px}:${m.py}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(m) }
  for (const list of groups.values()) {
    list.forEach((m, i) => {
      const a = i * 2.39996 // ángulo áureo
      const r = 26 + 9 * Math.sqrt(i)
      m.x = Math.round(m.px + Math.cos(a) * r)
      m.y = Math.round(m.py + Math.sin(a) * r)
      delete m.px; delete m.py
    })
  }
  console.log('· Objetos geolocalizados:', stats, 'total', out.length)
  return out
}

// ───────── 6. Coordenadas de los lugares de la app ─────────
async function appLocationCoords(markers) {
  const src = await readFile(join(ROOT, 'src/data/locations.ts'), 'utf8') + await readFile(join(ROOT, 'src/data/dlc.ts'), 'utf8')
  const locs = [...src.matchAll(/\b[LU]\('([^']+)',\s*(['"])(.+?)\2,\s*'([^']+)'/g)].map((m) => ({ id: m[1], name: m[3], region: m[4] }))
  const all = markers.filter((m) => !m.cat.startsWith('item_'))
  const byNorm = new Map()
  for (const m of all) if (!byNorm.has(norm(m.name))) byNorm.set(norm(m.name), m)
  const { _comment, ...OVERRIDE } = JSON.parse(await readFile(join(ROOT, 'scripts/location-overrides.json'), 'utf8'))
  const coords = {}
  const missing = []
  for (const l of locs) {
    const o = OVERRIDE[l.id]
    if (o?.near) {
      const a = all.find((x) => x.name === o.near)
      if (!a) { missing.push(`${l.id} (ancla «${o.near}» no existe)`); continue }
      coords[l.id] = { layer: a.layer, x: a.x + (o.dx ?? 0), y: a.y + (o.dy ?? 0), ...(o.approx ? { approx: true } : { marker: a.id }) }
      continue
    }
    if (o) { coords[l.id] = { layer: o.layer, x: o.x, y: o.y }; continue }
    const n = norm(l.name.replace(/\s*\(.*\)\s*$/, ''))
    const m = byNorm.get(n) ?? byNorm.get(n.replace(/^the /, '')) ?? all.find((x) => norm(x.name).startsWith(n) || n.startsWith(norm(x.name)) && norm(x.name).length > 8)
    if (m) coords[l.id] = { layer: m.layer, x: m.x, y: m.y, marker: m.id }
    else missing.push(`${l.id} (${l.name})`)
  }
  if (missing.length) console.log(`· Lugares sin coordenadas (${missing.length}):`, missing.join(', '))
  return coords
}

// ───────── Main ─────────
await ensureAssets()
await vendorData()
const layersMeta = await buildTiles()
await buildIcons()
const markers = await buildMarkers(layersMeta)
const items = await geolocateItems(markers)
const coords = await appLocationCoords(markers)
await writeFile(join(GEN, 'map.json'), JSON.stringify({ layers: layersMeta, markers: [...markers, ...items] }))
await writeFile(join(GEN, 'location-coords.json'), JSON.stringify(coords, null, 0))
const counts = {}
for (const m of [...markers, ...items]) counts[m.cat] = (counts[m.cat] ?? 0) + 1
console.log('Hecho:', markers.length + items.length, 'marcadores', counts)
