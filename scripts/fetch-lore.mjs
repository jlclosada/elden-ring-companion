// Añade a cada objeto del compendio su descripción completa del juego (todos los párrafos)
// y, si existe, la sección de trasfondo/notas de lore de la wiki de Fandom.
// Uso: node scripts/fetch-lore.mjs   (requiere haber ejecutado antes scripts/fetch-data.mjs)
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const WIKI = 'https://eldenring.fandom.com/api.php'
const GEN = new URL('../src/data/generated/', import.meta.url)
const CACHE = new URL('./.lore-cache.json', import.meta.url)
const CATS = ['weapons', 'shields', 'armors', 'talismans', 'sorceries', 'incantations', 'ashes', 'spirits', 'items']

const cache = existsSync(CACHE) ? JSON.parse(await readFile(CACHE, 'utf8')) : {}

async function api(params, tries = 3) {
  const url = `${WIKI}?${new URLSearchParams({ format: 'json', ...params })}`
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'elden-ring-companion-data/1.0' } })
      if (r.ok) return await r.json()
    } catch { /* reintento */ }
    await new Promise((res) => setTimeout(res, 600 * (i + 1)))
  }
  return null
}

const clean = (s = '') => {
  let out = s
  for (let i = 0; i < 3; i++) out = out.replace(/\{\{\s*(?:sic|nowrap|tooltip)\s*\|([^{}|]*)[^{}]*\}\}/gi, '$1').replace(/\{\{[^{}]*\}\}/g, '')
  return out
    .replace(/<ref[^>]*\/>|<ref[^>]*>[\s\S]*?<\/ref>/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[(?:File|Image):[^\]]*\]\]/gi, '')
    .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/[ \t]+/g, ' ')
    .split('\n').map((l) => l.trim()).filter(Boolean).join('\n')
    .trim()
}

function extract(wt) {
  // Descripción del juego: plantilla {{Description |EN_line1=… |EN_line2=…}}
  let lines = [...wt.matchAll(/\|\s*EN_line\d+\s*=\s*([\s\S]*?)(?=\n\s*\||\n?\}\})/g)].map((m) => clean(m[1])).filter(Boolean)
  if (!lines.length) {
    // Variante {{Description |EN=párrafos separados por líneas en blanco |JP=…}}
    const m = wt.match(/\{\{\s*Description\s*\|\s*EN\s*=\s*([\s\S]*?)(?=\n?\s*\|\s*[A-Z]{2}\s*=|\n?\}\})/i)
    if (m) lines = m[1].split(/\n\s*\n/).map((p) => clean(p).replace(/\n/g, ' ')).filter(Boolean)
  }
  // Trasfondo opcional
  const sec = wt.match(/^==\s*(Lore|Notes and Lore|Lore Notes|Trivia)\s*==\s*$([\s\S]*?)(?=^==[^=]|$(?![\s\S]))/im)
  const notes = sec ? clean(sec[2]).split('\n').map((l) => l.replace(/^[*#:]+\s*/, '')).filter((l) => l.length > 30).slice(0, 4) : []
  return { lines, notes }
}

function titles(name, cat) {
  let t = name.trim()
  if (cat === 'ashes') t = t.replace(/^Ashes? Of War:\s*/i, 'Ash of War: ')
  const small = t.replace(/\b(Of|The|And|In|To|A|With|From|On)\b/g, (m, _w, off) => (off === 0 ? m : m.toLowerCase()))
  const hyphen = small.replace(/-([a-z])/g, (_, c) => '-' + c.toUpperCase())
  const noAlt = small.replace(/\s*\((altered|Altered)\)/, '')
  return [...new Set([small, hyphen, t, noAlt, `${small} (Item)`, `${small} (spell)`])]
}

async function pool(items, size, fn) {
  let i = 0
  await Promise.all(Array.from({ length: size }, async () => { while (i < items.length) { const k = i++; await fn(items[k]) } }))
}

let total = 0, found = 0
for (const cat of CATS) {
  const file = new URL(`${cat}.json`, GEN)
  const list = JSON.parse(await readFile(file, 'utf8'))
  await pool(list, 8, async (e) => {
    total++
    for (const t of titles(e.name, cat)) {
      if (!(t in cache) || (cache[t] && !cache[t].lines.length)) {
        const d = await api({ action: 'parse', page: t, prop: 'wikitext', redirects: '1' })
        const wt = d?.parse?.wikitext?.['*']
        cache[t] = wt ? extract(wt) : null
      }
      const r = cache[t]
      if (r && r.lines.length) { e.lore = r.lines; if (r.notes.length) e.loreNotes = r.notes; found++; return }
    }
  })
  await writeFile(file, JSON.stringify(list))
  await writeFile(CACHE, JSON.stringify(cache))
  console.log(`· ${cat}: ${list.filter((x) => x.lore).length}/${list.length} con descripción completa`)
}
console.log(`Hecho: ${found}/${total}`)
