#!/usr/bin/env node
/**
 * Genera las ilustraciones de «El Anillo Roto» con ComfyUI (API local) y las guarda en
 * src/content/novela/ilustraciones/<capítulo>.webp, donde las recogen el lector y el PDF.
 *
 *   npm run illustrate                         # genera las que falten
 *   npm run illustrate -- --only 01-la-tormenta,21-margit --force
 *   npm run illustrate -- --only 21-margit --force --variant 2   # otra versión (otra semilla)
 *   npm run illustrate -- --dry-run            # solo muestra los prompts
 *
 * Modelos: checkpoint SDXL (28 pasos, CFG 6) o Z-Image Turbo en archivos separados (8 pasos, CFG 1).
 * Opciones: --url http://127.0.0.1:8000 (o COMFY_URL), --ckpt <modelo> (o COMFY_CKPT),
 *           --steps, --cfg, --width 1216, --height 832, --sampler dpmpp_2m, --scheduler karras
 * Si no se indica --url se prueban los puertos de ComfyUI Desktop (8000) y ComfyUI clásico (8188).
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID, createHash } from 'node:crypto'
import sharp from 'sharp'
import { NEGATIVE, PROMPTS, STYLE } from './illustrations/prompts.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'src/content/novela/ilustraciones')
const MANIFEST = join(OUT_DIR, 'manifest.json')
const TIMEOUT_MS = 20 * 60 * 1000

// ---- Argumentos -----------------------------------------------------------
const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback
}
const cfg = {
  url: opt('url', process.env.COMFY_URL),
  ckpt: opt('ckpt', process.env.COMFY_CKPT),
  steps: opt('steps') ? Number(opt('steps')) : null,
  cfg: opt('cfg') ? Number(opt('cfg')) : null,
  width: Number(opt('width', 1216)),
  height: Number(opt('height', 832)),
  sampler: opt('sampler'),
  scheduler: opt('scheduler'),
  variant: Number(opt('variant', 0)),
  only: opt('only', '')?.split(',').map((s) => s.trim()).filter(Boolean),
  force: flag('force'),
  dry: flag('dry-run'),
}

const exists = (p) => access(p).then(() => true, () => false)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
/** Semilla estable por capítulo: volver a generar da la misma imagen salvo que cambie el prompt o --variant */
const seedFor = (slug) => createHash('sha256').update(`${slug}:${cfg.variant}`).digest().readUInt32BE(0)

// ---- ComfyUI --------------------------------------------------------------
async function findServer() {
  const candidates = cfg.url ? [cfg.url] : ['http://127.0.0.1:8000', 'http://127.0.0.1:8188']
  for (const base of candidates) {
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/system_stats`, { signal: AbortSignal.timeout(3000) })
      const json = await res.json()
      if (json?.system) return { base: base.replace(/\/$/, ''), stats: json }
    } catch { /* probar el siguiente */ }
  }
  return null
}

const listOf = async (base, node, field) => {
  const info = await (await fetch(`${base}/object_info/${node}`)).json()
  return info?.[node]?.input?.required?.[field]?.[0] ?? []
}

/**
 * Elige el modelo: un checkpoint SDXL de un solo archivo o, si no hay, Z-Image Turbo
 * (modelo de difusión + codificador Qwen + VAE en archivos separados, como lo instala Comfy Desktop).
 */
async function pickModel(base) {
  const ckpts = await listOf(base, 'CheckpointLoaderSimple', 'ckpt_name')
  const unets = await listOf(base, 'UNETLoader', 'unet_name')
  const want = cfg.ckpt?.toLowerCase()
  const zimage = unets.find((n) => (want ? n.toLowerCase().includes(want) : /z[_-]?image/i.test(n)))
  // Para los óleos del libro se prefiere un SDXL generalista antes que uno fotorrealista o de anime (Pony)
  const realistic = (n) => /realvis|juggernaut|realistic|epicrealism|pony/i.test(n)
  const ckpt = want
    ? ckpts.find((n) => n.toLowerCase().includes(want))
    : ckpts.find((n) => /xl/i.test(n) && !realistic(n)) ?? ckpts.find((n) => /xl/i.test(n)) ?? ckpts[0]
  if (ckpt && !(want && zimage && !ckpts.some((n) => n.toLowerCase().includes(want)))) {
    return { kind: 'sdxl', name: ckpt, steps: 28, cfg: 6, sampler: 'dpmpp_2m', scheduler: 'karras' }
  }
  if (zimage) {
    const clips = await listOf(base, 'CLIPLoader', 'clip_name')
    const vaes = await listOf(base, 'VAELoader', 'vae_name')
    const clip = clips.find((n) => /qwen/i.test(n))
    const vae = vaes.find((n) => /^ae\./i.test(n)) ?? vaes.find((n) => /flux|ae/i.test(n))
    if (!clip || !vae) throw new Error(`Falta el codificador Qwen o el VAE de Z-Image (text_encoders: ${clips.join(', ') || '-'}; vae: ${vaes.join(', ') || '-'})`)
    return { kind: 'zimage', name: zimage, clip, vae, steps: 8, cfg: 1, sampler: 'res_multistep', scheduler: 'simple' }
  }
  throw new Error(`No hay ningún modelo utilizable${want ? ` que coincida con "${cfg.ckpt}"` : ''}. Checkpoints: ${ckpts.join(', ') || '-'}; modelos de difusión: ${unets.join(', ') || '-'}`)
}

function workflow({ model, positive, negative, seed, slug }) {
  const sampler = (m, latent) => ({
    class_type: 'KSampler',
    inputs: {
      seed, steps: cfg.steps ?? model.steps, cfg: cfg.cfg ?? model.cfg, sampler_name: cfg.sampler ?? model.sampler,
      scheduler: cfg.scheduler ?? model.scheduler, denoise: 1, model: m, positive: ['6', 0], negative: ['7', 0], latent_image: latent,
    },
  })
  const tail = {
    8: { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: model.kind === 'sdxl' ? ['4', 2] : ['12', 0] } },
    9: { class_type: 'SaveImage', inputs: { filename_prefix: `anillo-roto/${slug}`, images: ['8', 0] } },
  }
  if (model.kind === 'sdxl') {
    return {
      4: { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: model.name } },
      5: { class_type: 'EmptyLatentImage', inputs: { width: cfg.width, height: cfg.height, batch_size: 1 } },
      6: { class_type: 'CLIPTextEncode', inputs: { text: positive, clip: ['4', 1] } },
      7: { class_type: 'CLIPTextEncode', inputs: { text: negative, clip: ['4', 1] } },
      3: sampler(['4', 0], ['5', 0]),
      ...tail,
    }
  }
  // Z-Image Turbo: flujo de la plantilla oficial de ComfyUI (8 pasos, CFG 1)
  return {
    10: { class_type: 'UNETLoader', inputs: { unet_name: model.name, weight_dtype: 'default' } },
    11: { class_type: 'CLIPLoader', inputs: { clip_name: model.clip, type: 'lumina2', device: 'default' } },
    12: { class_type: 'VAELoader', inputs: { vae_name: model.vae } },
    13: { class_type: 'ModelSamplingAuraFlow', inputs: { shift: 3, model: ['10', 0] } },
    5: { class_type: 'EmptySD3LatentImage', inputs: { width: cfg.width, height: cfg.height, batch_size: 1 } },
    6: { class_type: 'CLIPTextEncode', inputs: { text: positive, clip: ['11', 0] } },
    7: { class_type: 'CLIPTextEncode', inputs: { text: negative, clip: ['11', 0] } },
    3: sampler(['13', 0], ['5', 0]),
    ...tail,
  }
}

async function generate(base, job) {
  const res = await fetch(`${base}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: workflow(job), client_id: randomUUID() }),
  })
  const body = await res.json()
  if (!res.ok || body.error) throw new Error(`ComfyUI rechazó el flujo: ${JSON.stringify(body.error ?? body.node_errors ?? body)}`)

  const id = body.prompt_id
  const start = Date.now()
  while (Date.now() - start < TIMEOUT_MS) {
    await sleep(2000)
    const hist = (await (await fetch(`${base}/history/${id}`)).json())[id]
    if (!hist) continue
    if (hist.status?.status_str === 'error') throw new Error(`Error en ComfyUI: ${JSON.stringify(hist.status.messages?.at(-1) ?? hist.status)}`)
    const img = hist.outputs?.['9']?.images?.[0]
    if (img) {
      const q = new URLSearchParams({ filename: img.filename, subfolder: img.subfolder ?? '', type: img.type ?? 'output' })
      return Buffer.from(await (await fetch(`${base}/view?${q}`)).arrayBuffer())
    }
  }
  throw new Error('Tiempo de espera agotado')
}

// ---- Principal ------------------------------------------------------------
const fmtTime = (ms) => (ms < 60000 ? `${Math.round(ms / 1000)} s` : `${Math.floor(ms / 60000)} min ${Math.round((ms % 60000) / 1000)} s`)

async function main() {
  const selected = cfg.only?.length ? PROMPTS.filter((p) => cfg.only.some((o) => p.slug.startsWith(o))) : PROMPTS
  if (!selected.length) throw new Error(`Ningún capítulo coincide con --only ${cfg.only.join(',')}`)

  if (cfg.dry) {
    for (const p of selected) console.log(`\n${p.slug}  (seed ${p.seed ?? seedFor(p.slug)})\n  ${p.scene}, ${STYLE}`)
    console.log(`\nNegativo: ${NEGATIVE}`)
    return
  }

  const server = await findServer()
  if (!server) {
    throw new Error(
      'No encuentro ComfyUI. Abre Comfy Desktop (o arranca ComfyUI) y vuelve a probar.\n' +
      'Si usa otro puerto, indícalo: npm run illustrate -- --url http://127.0.0.1:PUERTO',
    )
  }
  const model = await pickModel(server.base)
  const device = server.stats.devices?.[0]
  console.log(`ComfyUI ${server.stats.system?.comfyui_version ?? ''} en ${server.base} · ${device?.name ?? device?.type ?? ''}`)
  console.log(`Modelo: ${model.name} (${model.kind === 'sdxl' ? 'SDXL' : 'Z-Image'}) · ${cfg.width}×${cfg.height} · ${cfg.steps ?? model.steps} pasos · CFG ${cfg.cfg ?? model.cfg}\n`)

  await mkdir(OUT_DIR, { recursive: true })
  const manifest = (await exists(MANIFEST)) ? JSON.parse(await readFile(MANIFEST, 'utf8')) : {}

  const pending = []
  for (const p of selected) {
    if (!cfg.force && (await exists(join(OUT_DIR, `${p.slug}.webp`)))) continue
    pending.push(p)
  }
  if (!pending.length) { console.log('Todas las ilustraciones ya existen (usa --force para regenerarlas).'); return }

  let done = 0, failed = 0
  const t0 = Date.now()
  for (const p of pending) {
    const seed = p.seed ?? seedFor(p.slug)
    const positive = `${p.scene}, ${STYLE}`
    const n = done + failed + 1
    const eta = done ? ` · faltan ~${fmtTime(((Date.now() - t0) / done) * (pending.length - n + 1))}` : ''
    process.stdout.write(`[${n}/${pending.length}] ${p.slug}${eta} … `)
    const t = Date.now()
    try {
      const png = await generate(server.base, { model, positive, negative: NEGATIVE, seed, slug: p.slug })
      await sharp(png).webp({ quality: 82 }).toFile(join(OUT_DIR, `${p.slug}.webp`))
      manifest[p.slug] = {
        seed, variant: cfg.variant, model: model.name, steps: cfg.steps ?? model.steps, cfg: cfg.cfg ?? model.cfg,
        sampler: cfg.sampler ?? model.sampler, scheduler: cfg.scheduler ?? model.scheduler,
        size: `${cfg.width}x${cfg.height}`, prompt: positive, generatedAt: new Date().toISOString(),
      }
      await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
      done++
      console.log(`ok (${fmtTime(Date.now() - t)})`)
    } catch (e) {
      failed++
      console.log(`FALLO\n   ${e.message}`)
      if (/rechazó|checkpoint|modelo/i.test(e.message)) break // error de configuración: no tiene sentido seguir
    }
  }
  console.log(`\n${done} generadas, ${failed} fallidas en ${fmtTime(Date.now() - t0)} → ${OUT_DIR}`)
  if (failed) process.exitCode = 1
}

main().catch((e) => { console.error(`\n✖ ${e.message}`); process.exit(1) })
