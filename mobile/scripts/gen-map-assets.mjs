// Empaqueta Leaflet y los iconos del mapa de la web en un módulo TS para el WebView del mapa.
// Uso: node scripts/gen-map-assets.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, '..', '..')
const leaflet = join(repo, 'node_modules', 'leaflet', 'dist')
const icons = join(repo, 'public', 'map-icons')

const js = readFileSync(join(leaflet, 'leaflet.js'), 'utf8')
const css = readFileSync(join(leaflet, 'leaflet.css'), 'utf8')
const map = Object.fromEntries(readdirSync(icons).filter((f) => f.endsWith('.webp'))
  .map((f) => [f.replace('.webp', ''), `data:image/webp;base64,${readFileSync(join(icons, f)).toString('base64')}`]))

const out = `// Generado por scripts/gen-map-assets.mjs — no editar a mano.
export const LEAFLET_JS = ${JSON.stringify(js)}
export const LEAFLET_CSS = ${JSON.stringify(css)}
export const MAP_ICONS: Record<string, string> = ${JSON.stringify(map)}
`
writeFileSync(join(here, '..', 'src', 'lib', 'mapAssets.ts'), out)
console.log(`mapAssets.ts: ${(out.length / 1024).toFixed(0)} KB, ${Object.keys(map).length} iconos`)
