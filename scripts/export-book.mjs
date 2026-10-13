#!/usr/bin/env node
/**
 * Exporta la edición impresa de «El Anillo Roto» a PDF sin pasar por el diálogo de impresión.
 * Abre /lore/libro en Chrome sin interfaz, espera a que Paged.js componga el libro y guarda el PDF.
 *
 *   npm run libro:pdf                                  # usa http://localhost:5173 (npm run dev)
 *   npm run libro:pdf -- --url http://localhost:5179 --formato A5 --cronicas --out libro.pdf
 *
 * Requiere Google Chrome (o CHROME_PATH) y el servidor de la app en marcha.
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d }
const flag = (n) => args.includes(`--${n}`)

const base = opt('url', 'http://localhost:5173').replace(/\/$/, '')
const query = new URLSearchParams()
if (opt('formato')) query.set('formato', opt('formato'))
if (flag('cronicas')) query.set('cronicas', '1')
for (const k of ['ilustraciones', 'mapa', 'reparto', 'glosario']) if (flag(`sin-${k}`)) query.set(k, '0')
const out = resolve(opt('out', 'El-Anillo-Roto.pdf'))

const CHROME = process.env.CHROME_PATH ?? [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find((p) => existsSync(p))
if (!CHROME) { console.error('✖ No encuentro Chrome. Indica la ruta con CHROME_PATH.'); process.exit(1) }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const profile = await mkdtemp(join(tmpdir(), 'libro-chrome-'))
  const port = 9300 + Math.floor(Math.random() * 500)
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--window-size=1600,1200', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
  try {
    // Esperar al puerto de depuración
    let target
    for (let i = 0; i < 50 && !target; i++) {
      try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page') } catch { await sleep(200) }
    }
    if (!target) throw new Error('Chrome no ha arrancado')

    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })
    let id = 0
    const pending = new Map()
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } }
    const send = (method, params = {}) => new Promise((res, rej) => {
      const mid = ++id
      pending.set(mid, (m) => (m.error ? rej(new Error(m.error.message)) : res(m.result)))
      ws.send(JSON.stringify({ id: mid, method, params }))
    })
    const evaluate = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value

    await send('Page.enable')
    const url = `${base}/lore/libro${query.size ? `?${query}` : ''}`
    console.log(`Componiendo ${url} …`)
    await send('Page.navigate', { url })

    const t0 = Date.now()
    let last = ''
    for (;;) {
      await sleep(1000)
      const status = await evaluate(`document.querySelector('.book-toolbar p')?.textContent ?? ''`).catch(() => '')
      if (/No se pudo/.test(status)) throw new Error(status)
      if (/^\d+ páginas\./.test(status)) { console.log(`  ${status.split('.')[0]} en ${Math.round((Date.now() - t0) / 1000)} s`); break }
      const pages = status.match(/(\d+) páginas/)?.[1]
      if (pages && pages !== last) { process.stdout.write(`\r  ${pages} páginas…`); last = pages }
      if (Date.now() - t0 > 15 * 60 * 1000) throw new Error('Tiempo de espera agotado')
    }

    const { data } = await send('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 })
    await writeFile(out, Buffer.from(data, 'base64'))
    console.log(`✓ ${out}`)
    ws.close()
  } finally {
    chrome.kill()
    await rm(profile, { recursive: true, force: true }).catch(() => {})
  }
}

main().catch((e) => { console.error(`\n✖ ${e.message}`); process.exit(1) })
