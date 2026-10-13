import { defineConfig, type Plugin, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const COMFY_URL = process.env.COMFY_URL ?? 'http://127.0.0.1:8188'
const NOVEL_DIR = join(__dirname, 'src/content/novela')

/**
 * Proxy del Estudio hacia ComfyUI (/comfy → COMFY_URL). ComfyUI rechaza (403) las peticiones cuya cabecera
 * Origin no coincide con su host, así que se elimina: para él son peticiones locales normales.
 */
const comfyProxy: ProxyOptions = {
  target: COMFY_URL,
  changeOrigin: true,
  ws: true,
  rewrite: (p) => p.replace(/^\/comfy/, ''),
  configure: (proxy) => {
    proxy.on('proxyReq', (req) => req.removeHeader('origin'))
    proxy.on('proxyReqWs', (req) => req.removeHeader('origin'))
  },
}

/**
 * Solo en desarrollo: POST /api/ilustraciones/:capitulo guarda una imagen generada en ComfyUI como
 * ilustración de ese capítulo (src/content/novela/ilustraciones/<capitulo>.webp + manifest.json).
 */
function illustrationsApi(): Plugin {
  return {
    name: 'ilustraciones-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/ilustraciones/', async (req, res) => {
        const send = (code: number, body: object) => { res.statusCode = code; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(body)) }
        const slug = decodeURIComponent((req.url ?? '').replace(/^\//, '').split('?')[0])
        if (req.method !== 'POST') return send(405, { error: 'Método no permitido' })
        // El slug debe ser un capítulo existente: evita escribir fuera de la carpeta
        if (!/^\d{2}-[a-z0-9-]+$/.test(slug) || !existsSync(join(NOVEL_DIR, `${slug}.md`))) return send(400, { error: 'Capítulo desconocido' })
        try {
          let raw = ''
          for await (const chunk of req) raw += chunk
          const { filename, subfolder = '', type = 'output', prompt, seed, model } = JSON.parse(raw)
          if (typeof filename !== 'string') return send(400, { error: 'Falta la imagen' })
          const q = new URLSearchParams({ filename, subfolder, type })
          const img = await fetch(`${COMFY_URL}/view?${q}`)
          if (!img.ok) return send(502, { error: `ComfyUI respondió ${img.status}` })
          const { default: sharp } = await import('sharp')
          const outDir = join(NOVEL_DIR, 'ilustraciones')
          await sharp(Buffer.from(await img.arrayBuffer())).webp({ quality: 82 }).toFile(join(outDir, `${slug}.webp`))
          const manifestPath = join(outDir, 'manifest.json')
          const manifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {}
          manifest[slug] = { seed, model, prompt, source: 'estudio', generatedAt: new Date().toISOString() }
          await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
          send(200, { ok: true })
        } catch (e) {
          send(500, { error: e instanceof Error ? e.message : String(e) })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), illustrationsApi()],
  server: {
    // Necesario para la recarga en caliente dentro de Docker
    watch: process.env.CHOKIDAR_USEPOLLING ? { usePolling: true } : undefined,
    proxy: { '/comfy': comfyProxy },
  },
  preview: { proxy: { '/comfy': comfyProxy } },
})
