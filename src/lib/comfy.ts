import artStyle from '../content/novela/art-style.json'

/**
 * Cliente mínimo de ComfyUI para el Estudio. Todas las llamadas pasan por el proxy /comfy
 * (vite.config.ts en desarrollo, nginx en Docker), que evita los bloqueos de origen de ComfyUI.
 */
export const COMFY = '/comfy'

export interface ComfyImage { filename: string; subfolder: string; type: string }

export interface ComfyModel {
  kind: 'sdxl' | 'zimage'
  name: string
  clip?: string
  vae?: string
  steps: number
  cfg: number
  sampler: string
  scheduler: string
  /** Etiquetas que el modelo espera al principio del prompt (p. ej. las «score» de Pony) */
  prefix?: string
  negPrefix?: string
  /** Capas de CLIP a saltar (Pony y los modelos de anime funcionan con 2) */
  clipSkip?: number
}

export type StyleGroup = 'Realista' | 'Moderno' | 'Clásico' | 'Libre'
export interface StylePreset { id: string; label: string; group: StyleGroup; style: string; negative: string }

const BASE_NEGATIVE = 'text, letters, watermark, signature, logo, lowres, blurry, jpeg artifacts, deformed, bad anatomy, extra limbs, extra fingers, mutated hands, disfigured face'
/** Para los estilos fotográficos: aleja el resultado de pinturas y dibujos */
const PHOTO_NEGATIVE = `${BASE_NEGATIVE}, painting, drawing, illustration, sketch, cartoon, anime, comic, 3d render, cgi, plastic skin, airbrushed, oversaturated`

export const STYLE_GROUPS: StyleGroup[] = ['Realista', 'Moderno', 'Clásico', 'Libre']

export const STYLE_PRESETS: StylePreset[] = [
  // ───── Realista ─────
  {
    id: 'foto', label: 'Fotografía realista', group: 'Realista',
    style: 'professional photograph, photorealistic, natural lighting, sharp focus, high detail, shot on a full-frame camera, 35mm lens, realistic textures',
    negative: PHOTO_NEGATIVE,
  },
  {
    id: 'retrato', label: 'Retrato fotográfico', group: 'Realista',
    style: 'portrait photography, photorealistic, detailed skin texture, natural skin tones, 85mm lens, shallow depth of field, soft studio lighting, catchlight in the eyes, bokeh background',
    negative: `${PHOTO_NEGATIVE}, cross-eyed, asymmetric eyes`,
  },
  {
    id: 'coche', label: 'Coches y producto', group: 'Realista',
    style: 'automotive photography, photorealistic, glossy reflective paint, studio lighting with soft reflections, low angle, sharp details, commercial advertising photo, 8k',
    negative: `${PHOTO_NEGATIVE}, distorted wheels, asymmetric car, warped body panels`,
  },
  {
    id: 'cine', label: 'Cinematográfico', group: 'Realista',
    style: 'cinematic film still, photorealistic, anamorphic lens, dramatic lighting, color graded, film grain, shallow depth of field, widescreen composition',
    negative: PHOTO_NEGATIVE,
  },
  {
    id: 'urbana', label: 'Calle y viajes', group: 'Realista',
    style: 'street photography, documentary style, photorealistic, candid, golden hour light, natural colors, high detail',
    negative: PHOTO_NEGATIVE,
  },
  // ───── Moderno ─────
  {
    id: 'digital', label: 'Ilustración digital', group: 'Moderno',
    style: 'modern digital illustration, clean shapes, vibrant colors, smooth shading, trending digital art, highly detailed',
    negative: `${BASE_NEGATIVE}, photo, muddy colors`,
  },
  {
    id: 'anime', label: 'Anime', group: 'Moderno',
    style: 'anime style, cel shading, clean line art, vibrant colors, detailed background, key visual',
    negative: `${BASE_NEGATIVE}, photo, photorealistic, 3d render`,
  },
  {
    id: 'render3d', label: 'Render 3D estilizado', group: 'Moderno',
    style: 'stylized 3d render, soft global illumination, cute proportions, smooth materials, octane render, animated movie style',
    negative: `${BASE_NEGATIVE}, photo, flat, 2d, sketch`,
  },
  {
    id: 'comic', label: 'Cómic', group: 'Moderno',
    style: 'comic book art, bold ink outlines, halftone shading, dynamic composition, vivid flat colors',
    negative: `${BASE_NEGATIVE}, photo, photorealistic, 3d render`,
  },
  {
    id: 'scifi', label: 'Ciencia ficción', group: 'Moderno',
    style: 'futuristic sci-fi concept art, neon lights, cyberpunk atmosphere, volumetric fog, highly detailed, cinematic',
    negative: `${BASE_NEGATIVE}, medieval, cartoon`,
  },
  // ───── Clásico ─────
  { id: 'libro', label: 'Óleo del libro', group: 'Clásico', style: artStyle.style, negative: artStyle.negative },
  {
    id: 'concept', label: 'Arte conceptual fantasía', group: 'Clásico',
    style: 'cinematic dark fantasy concept art, matte painting, volumetric light, epic scale, highly detailed, dramatic atmosphere',
    negative: `${BASE_NEGATIVE}, cartoon, anime, flat colors`,
  },
  {
    id: 'grabado', label: 'Grabado a tinta', group: 'Clásico',
    style: 'antique engraving, detailed ink etching, cross-hatching, sepia ink on aged parchment, old book illustration, high contrast, intricate linework',
    negative: `${BASE_NEGATIVE}, color, photo, 3d render, anime`,
  },
  {
    id: 'acuarela', label: 'Acuarela', group: 'Clásico',
    style: 'watercolor painting, loose washes, ink outlines, textured paper, storybook illustration',
    negative: `${BASE_NEGATIVE}, photo, 3d render`,
  },
  // ───── Libre ─────
  { id: 'ninguno', label: 'Sin estilo (solo tu prompt)', group: 'Libre', style: '', negative: BASE_NEGATIVE },
]

export const ASPECTS = [
  { id: 'landscape', label: 'Horizontal', w: 1216, h: 832 },
  { id: 'square', label: 'Cuadrado', w: 1024, h: 1024 },
  { id: 'portrait', label: 'Vertical', w: 832, h: 1216 },
] as const
export type AspectId = (typeof ASPECTS)[number]['id']

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${COMFY}${path}`, init)
  if (!res.ok) throw new Error(`ComfyUI respondió ${res.status}`)
  return res.json() as Promise<T>
}

export async function systemStats() {
  return json<{ system: { comfyui_version?: string }; devices?: { name?: string; type?: string }[] }>('/system_stats')
}

async function listOf(node: string, field: string): Promise<string[]> {
  const info = await json<Record<string, { input?: { required?: Record<string, unknown[]> } }>>(`/object_info/${node}`)
  return (info?.[node]?.input?.required?.[field]?.[0] as string[] | undefined) ?? []
}

/** Modelos utilizables: checkpoints SDXL de un archivo y Z-Image Turbo en archivos separados (misma lógica que scripts/illustrate.mjs). */
export async function listModels(): Promise<ComfyModel[]> {
  const [ckpts, unets, clips, vaes] = await Promise.all([
    listOf('CheckpointLoaderSimple', 'ckpt_name'), listOf('UNETLoader', 'unet_name'),
    listOf('CLIPLoader', 'clip_name'), listOf('VAELoader', 'vae_name'),
  ])
  const models: ComfyModel[] = ckpts.map((name): ComfyModel => isPony(name)
    // Pony Diffusion V6 XL: etiquetas de calidad, clip skip 2 y euler a (recomendación de sus autores)
    ? { kind: 'sdxl', name, steps: 25, cfg: 7, sampler: 'euler_ancestral', scheduler: 'normal', clipSkip: 2,
        prefix: 'score_9, score_8_up, score_7_up, ', negPrefix: 'score_6, score_5, score_4, ' }
    : isRealistic(name)
      // Ajustes recomendados para los modelos fotorrealistas (RealVisXL, Juggernaut…)
      ? { kind: 'sdxl', name, steps: 30, cfg: 5, sampler: 'dpmpp_2m_sde', scheduler: 'karras' }
      : { kind: 'sdxl', name, steps: 28, cfg: 6, sampler: 'dpmpp_2m', scheduler: 'karras' })
  const clip = clips.find((n) => /qwen/i.test(n))
  const vae = vaes.find((n) => /^ae\./i.test(n)) ?? vaes.find((n) => /flux|ae/i.test(n))
  for (const name of unets.filter((n) => /z[_-]?image/i.test(n))) {
    if (clip && vae) models.push({ kind: 'zimage', name, clip, vae, steps: 8, cfg: 1, sampler: 'res_multistep', scheduler: 'simple' })
  }
  // SDXL primero: con 16 GB de RAM es el que va fluido
  return models.sort((a, b) => Number(a.kind !== 'sdxl') - Number(b.kind !== 'sdxl'))
}

/** Modelos afinados para fotorrealismo */
export const isRealistic = (name: string) => /realvis|juggernaut|realistic|epicrealism/i.test(name)
/** Pony Diffusion y sus derivados (anime, cómic, ilustración estilizada) */
export const isPony = (name: string) => /pony/i.test(name)

/** Estilos para los que conviene Pony si está instalado */
const PONY_PRESETS = new Set(['anime', 'comic', 'digital', 'render3d'])

/** Modo automático: modelo fotorrealista para los estilos realistas; SDXL base para el resto. */
export function autoModel(models: ComfyModel[], group: StyleGroup | undefined, presetId?: string): ComfyModel | undefined {
  const pony = models.find((m) => m.kind === 'sdxl' && isPony(m.name))
  if (pony && presetId && PONY_PRESETS.has(presetId)) return pony
  const realistic = models.find((m) => m.kind === 'sdxl' && isRealistic(m.name))
  const general = models.find((m) => m.kind === 'sdxl' && !isRealistic(m.name) && !isPony(m.name))
  return (group === 'Realista' ? realistic ?? general : general ?? realistic) ?? models[0]
}

/** Imagen subida a la carpeta input de ComfyUI */
export interface InputImage { name: string; subfolder: string }

export interface LoraPick { name: string; strength: number }

export interface GenerateParams {
  model: ComfyModel; positive: string; negative: string; seed: number; width: number; height: number; steps?: number
  /** img2img: imagen de partida y cuánto se permite cambiarla (0 = igual, 1 = nueva) */
  init?: { image: InputImage; denoise: number }
  /** IP-Adapter: imágenes de referencia de personaje/estilo y su peso */
  refs?: { images: InputImage[]; weight: number; mode: RefMode }
  loras?: LoraPick[]
}

/** Qué copia el IP-Adapter de las referencias */
export type RefMode = 'general' | 'estilo' | 'composicion'
export const REF_MODES: { id: RefMode; label: string; hint: string }[] = [
  { id: 'general', label: 'Todo', hint: 'Personaje, ropa, colores y estilo' },
  { id: 'estilo', label: 'Solo estilo', hint: 'Copia la estética, no el contenido' },
  { id: 'composicion', label: 'Composición', hint: 'Copia la disposición de la escena' },
]

const ref = (id: number | string, out = 0): [string, number] => [String(id), out]
const loadImage = (img: InputImage) => ({ class_type: 'LoadImage', inputs: { image: img.subfolder ? `${img.subfolder}/${img.name}` : img.name } })

export function buildWorkflow({ model, positive, negative, seed, width, height, steps, init, refs, loras }: GenerateParams) {
  const wf: Record<string, { class_type: string; inputs: Record<string, unknown> }> = {}
  let modelOut: [string, number]
  let clipOut: [string, number]
  let vaeOut: [string, number]

  if (model.kind === 'sdxl') {
    wf[4] = { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: model.name } }
    modelOut = ref(4, 0); clipOut = ref(4, 1); vaeOut = ref(4, 2)
  } else {
    wf[10] = { class_type: 'UNETLoader', inputs: { unet_name: model.name, weight_dtype: 'default' } }
    wf[11] = { class_type: 'CLIPLoader', inputs: { clip_name: model.clip, type: 'lumina2', device: 'default' } }
    wf[12] = { class_type: 'VAELoader', inputs: { vae_name: model.vae } }
    modelOut = ref(10); clipOut = ref(11); vaeOut = ref(12)
  }

  // LoRAs encadenados (personajes o estilos entrenados con muchas imágenes)
  ;(loras ?? []).filter((l) => l.name && l.strength).forEach((l, i) => {
    const id = 40 + i
    if (model.kind === 'sdxl') {
      wf[id] = { class_type: 'LoraLoader', inputs: { lora_name: l.name, strength_model: l.strength, strength_clip: l.strength, model: modelOut, clip: clipOut } }
      modelOut = ref(id, 0); clipOut = ref(id, 1)
    } else {
      wf[id] = { class_type: 'LoraLoaderModelOnly', inputs: { lora_name: l.name, strength_model: l.strength, model: modelOut } }
      modelOut = ref(id, 0)
    }
  })

  // IP-Adapter: las referencias se promedian en un único "concepto visual"
  if (model.clipSkip) {
    wf[45] = { class_type: 'CLIPSetLastLayer', inputs: { stop_at_clip_layer: -model.clipSkip, clip: clipOut } }
    clipOut = ref(45)
  }

  if (refs?.images.length && model.kind === 'sdxl') {
    wf[50] = { class_type: 'IPAdapterUnifiedLoader', inputs: { model: modelOut, preset: 'PLUS (high strength)' } }
    let batch: [string, number] | undefined
    refs.images.forEach((img, i) => {
      const load = 60 + i * 3
      wf[load] = loadImage(img)
      wf[load + 1] = { class_type: 'PrepImageForClipVision', inputs: { image: ref(load), interpolation: 'LANCZOS', crop_position: 'center', sharpening: 0 } }
      if (!batch) batch = ref(load + 1)
      else {
        wf[load + 2] = { class_type: 'ImageBatch', inputs: { image1: batch, image2: ref(load + 1) } }
        batch = ref(load + 2)
      }
    })
    const weightType = refs.mode === 'estilo' ? 'style transfer' : refs.mode === 'composicion' ? 'composition' : 'linear'
    wf[51] = {
      class_type: 'IPAdapterAdvanced',
      inputs: {
        model: ref(50, 0), ipadapter: ref(50, 1), image: batch, weight: refs.weight, weight_type: weightType,
        combine_embeds: 'average', start_at: 0, end_at: 1, embeds_scaling: 'V only',
      },
    }
    modelOut = ref(51)
  }
  if (model.kind === 'zimage') {
    wf[13] = { class_type: 'ModelSamplingAuraFlow', inputs: { shift: 3, model: modelOut } }
    modelOut = ref(13)
  }

  wf[6] = { class_type: 'CLIPTextEncode', inputs: { text: (model.prefix ?? '') + positive, clip: clipOut } }
  wf[7] = { class_type: 'CLIPTextEncode', inputs: { text: (model.negPrefix ?? '') + negative, clip: clipOut } }

  // Latente de partida: vacío, o la imagen base codificada (img2img)
  if (init) {
    wf[20] = loadImage(init.image)
    wf[21] = { class_type: 'ImageScale', inputs: { image: ref(20), upscale_method: 'lanczos', width, height, crop: 'center' } }
    wf[5] = { class_type: 'VAEEncode', inputs: { pixels: ref(21), vae: vaeOut } }
  } else {
    wf[5] = { class_type: model.kind === 'sdxl' ? 'EmptyLatentImage' : 'EmptySD3LatentImage', inputs: { width, height, batch_size: 1 } }
  }

  wf[3] = {
    class_type: 'KSampler',
    inputs: {
      seed, steps: steps ?? model.steps, cfg: model.cfg, sampler_name: model.sampler, scheduler: model.scheduler,
      denoise: init ? init.denoise : 1, model: modelOut, positive: ref(6), negative: ref(7), latent_image: ref(5),
    },
  }
  wf[8] = { class_type: 'VAEDecode', inputs: { samples: ref(3), vae: vaeOut } }
  wf[9] = { class_type: 'SaveImage', inputs: { filename_prefix: 'estudio/img', images: ref(8) } }
  return wf
}

/** Sube una imagen a la carpeta input de ComfyUI (para img2img o referencias). */
export async function uploadImage(file: Blob, filename: string): Promise<InputImage> {
  const form = new FormData()
  form.append('image', file, filename)
  form.append('subfolder', 'estudio')
  form.append('type', 'input')
  const res = await fetch(`${COMFY}/upload/image`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(`No se pudo subir la imagen (${res.status})`)
  const body = await res.json() as { name: string; subfolder?: string }
  return { name: body.name, subfolder: body.subfolder ?? '' }
}

/** Copia una imagen generada a la carpeta input para poder editarla. */
export async function reuseOutput(img: ComfyImage): Promise<InputImage> {
  const blob = await (await fetch(viewUrl(img))).blob()
  return uploadImage(blob, img.filename)
}

export const inputUrl = (img: InputImage) => viewUrl({ filename: img.name, subfolder: img.subfolder, type: 'input' })

export interface Capabilities { ipadapter: boolean; ipadapterModels: boolean; loras: string[] }

/** Qué funciones avanzadas admite el ComfyUI conectado. */
export async function capabilities(): Promise<Capabilities> {
  const info = await json<Record<string, { input?: { required?: Record<string, unknown[]> } }>>('/object_info')
  const loras = (info.LoraLoader?.input?.required?.lora_name?.[0] as string[] | undefined) ?? []
  const ipadapter = Boolean(info.IPAdapterUnifiedLoader && info.IPAdapterAdvanced && info.PrepImageForClipVision)
  const clipVision = (info.CLIPVisionLoader?.input?.required?.clip_name?.[0] as string[] | undefined) ?? []
  return { ipadapter, ipadapterModels: ipadapter && clipVision.length > 0, loras }
}

export async function queuePrompt(params: GenerateParams, clientId: string): Promise<string> {
  const res = await fetch(`${COMFY}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: buildWorkflow(params), client_id: clientId }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.error) {
    const detail = body.error?.message ?? Object.values(body.node_errors ?? {}).map((e) => (e as { errors?: { message: string }[] }).errors?.[0]?.message).join('; ')
    throw new Error(detail || `ComfyUI respondió ${res.status}`)
  }
  return body.prompt_id as string
}

export type HistoryEntry = { status?: { status_str?: string; completed?: boolean; messages?: [string, Record<string, unknown>][] }; outputs?: Record<string, { images?: ComfyImage[] }> }

export async function history(promptId: string): Promise<HistoryEntry | undefined> {
  return (await json<Record<string, HistoryEntry>>(`/history/${promptId}`))[promptId]
}

/** Cancela un trabajo: lo quita de la cola si espera, o interrumpe la ejecución si es el actual. */
export async function cancel(promptId: string, running: boolean) {
  if (running) await fetch(`${COMFY}/interrupt`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt_id: promptId }) })
  else await fetch(`${COMFY}/queue`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delete: [promptId] }) })
}

export const viewUrl = (img: ComfyImage) => `${COMFY}/view?${new URLSearchParams({ filename: img.filename, subfolder: img.subfolder, type: img.type })}`

export const wsUrl = (clientId: string) => `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}${COMFY}/ws?clientId=${clientId}`

export const randomSeed = () => Math.floor(Math.random() * 2 ** 32)
