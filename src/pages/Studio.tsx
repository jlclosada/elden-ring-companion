import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BookImage, Dice5, Download, FolderPlus, ImagePlus, Images, Layers, Loader2, Maximize2, Paperclip, PenLine, RefreshCw, RotateCcw, Send, Square, Trash2, X } from 'lucide-react'
import {
  ASPECTS, REF_MODES, STYLE_GROUPS, STYLE_PRESETS, autoModel, cancel, capabilities, history, inputUrl, isPony, isRealistic, listModels, queuePrompt, randomSeed,
  reuseOutput, systemStats, uploadImage, viewUrl, wsUrl,
  type AspectId, type Capabilities, type ComfyImage, type ComfyModel, type HistoryEntry, type InputImage, type LoraPick, type RefMode,
} from '../lib/comfy'
import { CHAPTERS } from '../content/novela'
import { Badge, PageHeader, cx } from '../components/ui'

type Status = 'sending' | 'queued' | 'running' | 'done' | 'error' | 'cancelled'

interface Job {
  id: string
  prompt: string
  preset: string
  aspect: AspectId
  seed: number
  model: string
  status: Status
  promptId?: string
  progress?: number
  images?: ComfyImage[]
  error?: string
  /** img2img */
  init?: InputImage
  denoise?: number
  /** referencias IP-Adapter */
  refs?: InputImage[]
  refWeight?: number
  refMode?: RefMode
  lora?: LoraPick
  createdAt: number
  finishedAt?: number
}

const STORE_KEY = 'estudio-chat'
const MAX_JOBS = 120
/** Ejemplos variados: cada uno trae su estilo y formato */
const EXAMPLES: { prompt: string; preset: string; aspect: AspectId; tag: string }[] = [
  { tag: 'Coche', preset: 'coche', aspect: 'landscape', prompt: 'a matte black sports car parked on a wet city street at night, neon reflections on the asphalt' },
  { tag: 'Retrato', preset: 'retrato', aspect: 'portrait', prompt: 'portrait of a smiling woman in her thirties with curly hair, wearing a denim jacket, in a sunlit café' },
  { tag: 'Ciudad', preset: 'cine', aspect: 'landscape', prompt: 'a lone cyclist crossing a bridge in Madrid at sunrise, mist over the river' },
  { tag: 'Anime', preset: 'anime', aspect: 'landscape', prompt: 'a girl with headphones sitting on a rooftop above a futuristic city at sunset' },
  { tag: 'Producto', preset: 'foto', aspect: 'square', prompt: 'a pair of white running shoes floating above a pastel background, studio product shot' },
  { tag: 'Elden Ring', preset: 'libro', aspect: 'landscape', prompt: 'a lone tarnished knight kneeling before the colossal golden Erdtree at dusk' },
]
const PREFS_KEY = 'estudio-prefs-v2'
const COLLECTIONS_KEY = 'estudio-colecciones'
interface Attachment { img: InputImage; role: 'base' | 'ref' }
interface Collection { id: string; name: string; images: InputImage[] }
const loadCollections = (): Collection[] => { try { return JSON.parse(localStorage.getItem(COLLECTIONS_KEY) ?? '[]') } catch { return [] } }
const MAX_REFS = 12
const loadPrefs = (): { preset?: string; aspect?: AspectId; model?: string; denoise?: number; refWeight?: number; refMode?: RefMode; lora?: string; loraStrength?: number } => { try { return JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') } catch { return {} } }

const loadJobs = (): Job[] => { try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') } catch { return [] } }
const uid = () => Math.random().toString(36).slice(2, 10)
const fmtSecs = (ms: number) => (ms < 60000 ? `${Math.round(ms / 1000)} s` : `${Math.floor(ms / 60000)} min ${Math.round((ms % 60000) / 1000)} s`)

export default function StudioPage() {
  const [jobs, setJobs] = useState<Job[]>(loadJobs)
  const [conn, setConn] = useState<'checking' | 'ok' | 'down'>('checking')
  const [models, setModels] = useState<ComfyModel[]>([])
  const prefs = useMemo(loadPrefs, [])
  const [modelName, setModelName] = useState<string>(prefs.model ?? '')
  const [device, setDevice] = useState('')
  const [queueLeft, setQueueLeft] = useState(0)
  const [text, setText] = useState('')
  const [preset, setPreset] = useState(() => (STYLE_PRESETS.some((p) => p.id === prefs.preset) ? prefs.preset! : 'foto'))
  const [aspect, setAspect] = useState<AspectId>(prefs.aspect ?? 'landscape')
  const [seedInput, setSeedInput] = useState('')
  const [zoom, setZoom] = useState<Job | null>(null)
  const [toast, setToast] = useState<{ text: string; link?: string } | null>(null)
  const [caps, setCaps] = useState<Capabilities>({ ipadapter: false, ipadapterModels: false, loras: [] })
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(0)
  const [denoise, setDenoise] = useState(prefs.denoise ?? 0.6)
  const [refWeight, setRefWeight] = useState(prefs.refWeight ?? 0.8)
  const [refMode, setRefMode] = useState<RefMode>(prefs.refMode ?? 'general')
  const [lora, setLora] = useState(prefs.lora ?? '')
  const [loraStrength, setLoraStrength] = useState(prefs.loraStrength ?? 0.8)
  const [collections, setCollections] = useState<Collection[]>(loadCollections)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const clientId = useRef(uid() + uid())
  const listEnd = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  const patch = useCallback((match: (j: Job) => boolean, p: Partial<Job> | ((j: Job) => Partial<Job>)) => {
    setJobs((list) => list.map((j) => (match(j) ? { ...j, ...(typeof p === 'function' ? p(j) : p) } : j)))
  }, [])
  const byPrompt = (id: string) => (j: Job) => j.promptId === id

  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(jobs.slice(-MAX_JOBS))) } catch { /* ignore */ } }, [jobs])
  // Recuerda el último estilo, formato y modelo elegidos
  useEffect(() => {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify({ preset, aspect, model: modelName, denoise, refWeight, refMode, lora, loraStrength })) } catch { /* ignore */ }
  }, [preset, aspect, modelName, denoise, refWeight, refMode, lora, loraStrength])
  useEffect(() => { try { localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections)) } catch { /* ignore */ } }, [collections])
  useEffect(() => { listEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [jobs.length])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 6000); return () => clearTimeout(t) }, [toast])

  // ---- Conexión y modelos -------------------------------------------------
  const connect = useCallback(async () => {
    setConn('checking')
    try {
      const [stats, list, c] = await Promise.all([systemStats(), listModels(), capabilities().catch(() => null)])
      setModels(list)
      if (c) { setCaps(c); setLora((cur) => (c.loras.includes(cur) ? cur : '')) }
      // '' = automático; un modelo que ya no existe vuelve a automático
      setModelName((cur) => (list.some((m) => m.name === cur) ? cur : ''))
      setDevice(stats.devices?.[0]?.name ?? stats.devices?.[0]?.type ?? '')
      setConn('ok')
    } catch {
      setConn('down')
    }
  }, [])
  useEffect(() => { connect() }, [connect])

  // ---- Progreso en tiempo real (WebSocket de ComfyUI) ----------------------
  useEffect(() => {
    if (conn !== 'ok') return
    let ws: WebSocket | null = null
    let closed = false
    let retry: ReturnType<typeof setTimeout>
    const open = () => {
      ws = new WebSocket(wsUrl(clientId.current))
      ws.onmessage = (ev) => {
        if (typeof ev.data !== 'string') return // vistas previas binarias
        const msg = JSON.parse(ev.data) as { type: string; data: Record<string, unknown> }
        const pid = msg.data?.prompt_id as string | undefined
        switch (msg.type) {
          case 'status': setQueueLeft(((msg.data.status as { exec_info?: { queue_remaining?: number } })?.exec_info?.queue_remaining) ?? 0); break
          case 'execution_start': if (pid) patch(byPrompt(pid), { status: 'running', progress: 0 }); break
          case 'progress': if (pid) patch(byPrompt(pid), { status: 'running', progress: Number(msg.data.value) / Number(msg.data.max) }); break
          case 'executed': {
            const images = (msg.data.output as { images?: ComfyImage[] })?.images
            if (pid && images?.length) patch(byPrompt(pid), { images })
            break
          }
          case 'execution_success': if (pid) patch(byPrompt(pid), (j) => ({ status: j.images?.length ? 'done' : j.status, finishedAt: Date.now() })); break
          case 'execution_error': if (pid) patch(byPrompt(pid), { status: 'error', error: String(msg.data.exception_message ?? 'Error en ComfyUI'), finishedAt: Date.now() }); break
          case 'execution_interrupted': if (pid) patch(byPrompt(pid), { status: 'cancelled', finishedAt: Date.now() }); break
        }
      }
      ws.onclose = () => { if (!closed) retry = setTimeout(open, 3000) }
    }
    open()
    return () => { closed = true; clearTimeout(retry); ws?.close() }
  }, [conn, patch])

  // ---- Respaldo: consulta el historial de los trabajos pendientes ----------
  const pendingIds = jobs.filter((j) => (j.status === 'queued' || j.status === 'running') && j.promptId).map((j) => j.promptId!).join(',')
  useEffect(() => {
    if (!pendingIds || conn !== 'ok') return
    const t = setInterval(async () => {
      for (const id of pendingIds.split(',')) {
        let h: HistoryEntry | undefined
        try { h = await history(id) } catch { continue }
        if (!h) continue
        const msgs = h.status?.messages?.map((m) => m[0]) ?? []
        const images = h.outputs?.['9']?.images
        if (msgs.includes('execution_interrupted')) patch(byPrompt(id), { status: 'cancelled', finishedAt: Date.now() })
        else if (h.status?.status_str === 'error') {
          const err = h.status.messages?.find((m) => m[0] === 'execution_error')?.[1]?.exception_message
          patch(byPrompt(id), { status: 'error', error: String(err ?? 'Error en ComfyUI'), finishedAt: Date.now() })
        } else if (images?.length) patch(byPrompt(id), (j) => ({ status: 'done', images, finishedAt: j.finishedAt ?? Date.now() }))
      }
    }, 3000)
    return () => clearInterval(t)
  }, [pendingIds, conn, patch])

  // ---- Enviar -------------------------------------------------------------
  const presetGroup = STYLE_PRESETS.find((p) => p.id === preset)?.group
  const model = modelName ? models.find((m) => m.name === modelName) : autoModel(models, presetGroup, preset)
  const modelFor = (presetId: string) => (modelName ? model : autoModel(models, STYLE_PRESETS.find((p) => p.id === presetId)?.group, presetId))
  type SubmitInput = Pick<Job, 'prompt' | 'preset' | 'aspect' | 'init' | 'denoise' | 'refs' | 'refWeight' | 'refMode' | 'lora'> & { seed?: number }
  const submit = async (input: SubmitInput) => {
    const prompt = input.prompt.trim()
    const model = modelFor(input.preset)
    if (!prompt || !model) return
    // Las referencias solo funcionan con SDXL y con IP-Adapter instalado
    const refs = caps.ipadapterModels && model.kind === 'sdxl' && input.refs?.length ? input.refs : undefined
    const loraOk = input.lora && caps.loras.includes(input.lora.name) ? input.lora : undefined
    const style = STYLE_PRESETS.find((s) => s.id === input.preset) ?? STYLE_PRESETS[0]
    const size = ASPECTS.find((a) => a.id === input.aspect) ?? ASPECTS[0]
    const seed = input.seed ?? randomSeed()
    const job: Job = {
      id: uid(), prompt, preset: style.id, aspect: size.id, seed, model: model.name, status: 'sending', createdAt: Date.now(),
      init: input.init, denoise: input.init ? input.denoise ?? 0.6 : undefined,
      refs, refWeight: refs ? input.refWeight ?? 0.8 : undefined, refMode: refs ? input.refMode ?? 'general' : undefined, lora: loraOk,
    }
    setJobs((l) => [...l, job])
    try {
      const promptId = await queuePrompt({
        model, seed, width: size.w, height: size.h,
        positive: style.style ? `${prompt}, ${style.style}` : prompt, negative: style.negative,
        init: job.init ? { image: job.init, denoise: job.denoise! } : undefined,
        refs: job.refs ? { images: job.refs, weight: job.refWeight!, mode: job.refMode! } : undefined,
        loras: job.lora ? [job.lora] : undefined,
      }, clientId.current)
      patch((j) => j.id === job.id, { promptId, status: 'queued' })
    } catch (e) {
      patch((j) => j.id === job.id, { status: 'error', error: e instanceof Error ? e.message : String(e) })
    }
  }

  const onSend = () => {
    if (!text.trim()) return
    const seed = seedInput.trim() ? Number(seedInput) : undefined
    const base = attachments.find((a) => a.role === 'base')?.img
    const refs = attachments.filter((a) => a.role === 'ref').map((a) => a.img)
    submit({
      prompt: text, preset, aspect, seed: Number.isFinite(seed) ? seed : undefined,
      init: base, denoise, refs: refs.length ? refs : undefined, refWeight, refMode,
      lora: lora ? { name: lora, strength: loraStrength } : undefined,
    })
    setText('')
  }

  const reuse = (j: Job) => {
    setText(j.prompt); setPreset(j.preset); setAspect(j.aspect)
    setAttachments([...(j.init ? [{ img: j.init, role: 'base' as const }] : []), ...(j.refs ?? []).map((img) => ({ img, role: 'ref' as const }))])
    if (j.denoise) setDenoise(j.denoise)
    if (j.refWeight) setRefWeight(j.refWeight)
    if (j.refMode) setRefMode(j.refMode)
    requestAnimationFrame(() => textRef.current?.focus())
  }

  // ---- Imágenes adjuntas ----------------------------------------------------
  const addFiles = async (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith('image/'))
    if (!imgs.length) return
    setUploading((n) => n + imgs.length)
    for (const f of imgs) {
      try {
        const img = await uploadImage(f, f.name || `pegada-${uid()}.png`)
        setAttachments((list) => {
          if (list.some((a) => a.img.name === img.name && a.img.subfolder === img.subfolder)) return list
          // La primera imagen sirve de base para editar; las siguientes, de referencia
          const role: Attachment['role'] = list.length === 0 && imgs.length === 1 ? 'base' : 'ref'
          return [...list, { img, role }].slice(0, MAX_REFS + 1)
        })
      } catch (e) {
        setToast({ text: e instanceof Error ? e.message : String(e) })
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }
  const setRole = (i: number, role: Attachment['role']) =>
    setAttachments((list) => list.map((a, k) => (k === i ? { ...a, role } : role === 'base' && a.role === 'base' ? { ...a, role: 'ref' } : a)))
  const removeAttachment = (i: number) => setAttachments((list) => list.filter((_, k) => k !== i))

  const fromOutput = async (j: Job, role: Attachment['role']) => {
    const img = j.images?.[0]
    if (!img) return
    try {
      const input = await reuseOutput(img)
      setAttachments((list) => [...(role === 'base' ? list.map((a) => (a.role === 'base' ? { ...a, role: 'ref' as const } : a)) : list), { img: input, role }])
      if (role === 'base') { setText(j.prompt); setPreset(j.preset); setAspect(j.aspect) }
      requestAnimationFrame(() => textRef.current?.focus())
    } catch (e) {
      setToast({ text: e instanceof Error ? e.message : String(e) })
    }
  }

  const saveCollection = () => {
    const images = attachments.filter((a) => a.role === 'ref').map((a) => a.img)
    if (!images.length) return
    const name = prompt('Nombre de la colección (p. ej. «Malenia», «Leyndell», «Estilo oficial»):')?.trim()
    if (!name) return
    setCollections((list) => [...list.filter((c) => c.name !== name), { id: uid(), name, images }])
    setToast({ text: `Colección «${name}» guardada con ${images.length} imágenes` })
  }
  const loadCollection = (id: string) => {
    const c = collections.find((x) => x.id === id)
    if (!c) return
    setAttachments((list) => {
      const base = list.filter((a) => a.role === 'base')
      return [...base, ...c.images.map((img) => ({ img, role: 'ref' as const }))].slice(0, MAX_REFS + 1)
    })
  }
  const deleteCollection = (id: string) => setCollections((list) => list.filter((c) => c.id !== id))

  const hasBase = attachments.some((a) => a.role === 'base')
  const refCount = attachments.filter((a) => a.role === 'ref').length

  const saveToChapter = async (j: Job, slug: string) => {
    const img = j.images?.[0]
    if (!img) return
    const style = STYLE_PRESETS.find((s) => s.id === j.preset)
    const res = await fetch(`/api/ilustraciones/${slug}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...img, seed: j.seed, model: j.model, prompt: style?.style ? `${j.prompt}, ${style.style}` : j.prompt }),
    })
    const body = await res.json().catch(() => ({}))
    const idx = CHAPTERS.findIndex((c) => c.slug === slug)
    if (res.ok) setToast({ text: `Guardada como ilustración del capítulo ${idx + 1}`, link: `/lore/novela/${slug}` })
    else setToast({ text: `No se pudo guardar: ${body.error ?? res.status}` })
  }

  const active = jobs.filter((j) => j.status === 'queued' || j.status === 'running' || j.status === 'sending').length

  return (
    <div className="flex min-h-[calc(100vh-9rem)] flex-col lg:min-h-[calc(100vh-5rem)]">
      <PageHeader eyebrow="ComfyUI" title="Estudio de imágenes"
        actions={<>
          <ConnectionPill conn={conn} device={device} queue={Math.max(queueLeft, active)} onRetry={connect} />
          {jobs.length > 0 && (
            <button onClick={() => confirm('¿Borrar el historial del chat? Las imágenes siguen en la carpeta output de ComfyUI.') && setJobs([])}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs text-parch-300 hover:border-blood-500/50 hover:text-blood-500">
              <Trash2 size={13} />Vaciar
            </button>
          )}
        </>}>
        Describe lo que quieras —una foto realista, un coche, una persona, una escena de fantasía— y el modelo local lo genera. Escribe en inglés para mejores resultados.
      </PageHeader>

      {conn === 'down' && (
        <div className="mb-4 rounded-xl border border-[#e9a25b]/30 bg-[#e9a25b]/5 p-4 text-sm text-parch-200">
          No hay conexión con ComfyUI. Ábrelo (Comfy Desktop) y pulsa <button onClick={connect} className="text-gold-300 underline">reintentar</button>.
          <div className="mt-1 text-xs text-parch-400">El Estudio usa el proxy <code>/comfy</code> de <code>npm run dev</code> / <code>npm run preview</code> o del contenedor Docker, hacia el puerto 8188 (cámbialo con <code>COMFY_URL</code>).</div>
        </div>
      )}
      {conn === 'ok' && !models.length && (
        <div className="mb-4 rounded-xl border border-[#e9a25b]/30 bg-[#e9a25b]/5 p-4 text-sm text-parch-200">
          ComfyUI está abierto pero no tiene ningún modelo. Copia un checkpoint SDXL en <code>models/checkpoints</code> y pulsa <button onClick={connect} className="text-gold-300 underline">reintentar</button>.
        </div>
      )}

      {/* Conversación */}
      <div className="flex-1 space-y-6 pb-6">
        {jobs.length === 0 ? (
          <div className="grid place-items-center py-10 text-center">
            <div className="max-w-xl">
              <div className="font-display text-xl text-parch-100">¿Qué quieres pintar?</div>
              <p className="mt-2 text-sm text-parch-400">Fotos realistas, coches, personas, anime o fantasía: elige un estilo abajo o prueba un ejemplo. El estilo se añade solo a tu prompt.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {EXAMPLES.map((e) => (
                  <button key={e.prompt} onClick={() => { setText(e.prompt); setPreset(e.preset); setAspect(e.aspect); textRef.current?.focus() }}
                    className="rounded-xl border border-white/10 bg-white/[.02] p-3 text-left text-sm text-parch-300 hover:border-gold-500/40 hover:text-parch-100">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gold-500">{e.tag} · {STYLE_PRESETS.find((p) => p.id === e.preset)?.label}</span>
                    {e.prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : jobs.map((j) => (
          <JobItem key={j.id} job={j} onZoom={() => setZoom(j)} onReuse={() => reuse(j)}
            onVariation={() => submit({ ...j, seed: undefined })}
            onEdit={() => fromOutput(j, 'base')} onAsRef={() => fromOutput(j, 'ref')}
            onCancel={() => j.promptId && cancel(j.promptId, j.status === 'running').then(() => j.status !== 'running' && patch((x) => x.id === j.id, { status: 'cancelled' }))}
            onSave={import.meta.env.DEV ? (slug) => saveToChapter(j, slug) : undefined} />
        ))}
        <div ref={listEnd} />
      </div>

      {/* Compositor */}
      <div className="sticky bottom-20 z-20 -mx-1 lg:bottom-4">
        <div className={cx('panel p-3 shadow-2xl shadow-black/60', dragging && 'ring-2 ring-gold-400/70')}
          onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragging(true) } }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles([...e.dataTransfer.files]) }}>
          <AttachmentTray attachments={attachments} uploading={uploading} caps={caps} modelKind={model?.kind}
            denoise={denoise} setDenoise={setDenoise} refWeight={refWeight} setRefWeight={setRefWeight} refMode={refMode} setRefMode={setRefMode}
            onRole={setRole} onRemove={removeAttachment} onClear={() => setAttachments([])} onSaveCollection={saveCollection} />
          <div className="flex items-end gap-2">
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles([...(e.target.files ?? [])]); e.target.value = '' }} />
            <button onClick={() => fileRef.current?.click()} aria-label="Adjuntar imágenes" title="Adjuntar imágenes (también puedes arrastrarlas o pegarlas)"
              className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 text-parch-300 hover:border-gold-500/40 hover:text-gold-300">
              <Paperclip size={18} />
            </button>
            <textarea onPaste={(e) => { const files = [...e.clipboardData.files]; if (files.length) { e.preventDefault(); addFiles(files) } }} ref={textRef} value={text} onChange={(e) => setText(e.target.value)} rows={2}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }}
              placeholder={hasBase ? 'Describe cómo quieres la imagen editada…' : refCount ? 'Describe la escena; las referencias aportan el personaje o el estilo…' : 'a red vintage convertible on a coastal road at sunset…'}
              aria-label="Descripción de la imagen"
              className="scrollbar-thin max-h-48 min-h-[3rem] flex-1 resize-y rounded-lg border border-white/10 bg-ink-950 px-3 py-2.5 text-sm text-parch-100 outline-none placeholder:text-parch-400 focus:border-gold-500/60" />
            <button onClick={onSend} disabled={!text.trim() || !model} aria-label="Generar imagen"
              className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950 hover:brightness-110 disabled:opacity-40">
              <Send size={18} />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-parch-300">
            <select value={preset} onChange={(e) => setPreset(e.target.value)} aria-label="Estilo" className="h-8 rounded-md border border-white/10 bg-ink-900 px-2">
              {STYLE_GROUPS.map((g) => (
                <optgroup key={g} label={g}>
                  {STYLE_PRESETS.filter((s) => s.group === g).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </optgroup>
              ))}
            </select>
            <div className="flex overflow-hidden rounded-md border border-white/10" role="radiogroup" aria-label="Formato">
              {ASPECTS.map((a) => (
                <button key={a.id} role="radio" aria-checked={aspect === a.id} onClick={() => setAspect(a.id)}
                  className={cx('h-8 px-2.5', aspect === a.id ? 'bg-gold-500/15 text-gold-300' : 'hover:bg-white/5')}>{a.label}</button>
              ))}
            </div>
            <label className="flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2">
              <Dice5 size={13} className="text-parch-400" />
              <input value={seedInput} onChange={(e) => setSeedInput(e.target.value.replace(/\D/g, ''))} placeholder="Semilla aleatoria" inputMode="numeric"
                className="w-28 bg-transparent outline-none placeholder:text-parch-400" aria-label="Semilla" />
            </label>
            {models.length > 1 && (
              <select value={modelName} onChange={(e) => setModelName(e.target.value)} aria-label="Modelo" className="h-8 max-w-60 rounded-md border border-white/10 bg-ink-900 px-2">
                <option value="">Automático · {model?.name.replace(/\.safetensors$/, '')}</option>
                {models.map((m) => <option key={m.name} value={m.name}>{m.name.replace(/\.safetensors$/, '')} ({m.kind === 'zimage' ? 'Z-Image' : isPony(m.name) ? 'Pony · anime' : isRealistic(m.name) ? 'SDXL · realista' : 'SDXL'})</option>)}
              </select>
            )}
            {models.length === 1 && model && <span className="text-parch-400">{model.name.replace(/\.safetensors$/, '')}</span>}
            {caps.loras.length > 0 && (
              <label className="flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2" title="LoRA: un mini-modelo entrenado con muchas imágenes de un personaje o estilo">
                <Layers size={13} className="text-parch-400" />
                <select value={lora} onChange={(e) => setLora(e.target.value)} aria-label="LoRA" className="max-w-40 bg-transparent outline-none">
                  <option value="">Sin LoRA</option>
                  {caps.loras.map((l) => <option key={l} value={l}>{l.replace(/\.safetensors$/, '')}</option>)}
                </select>
                {lora && <input type="range" min={0.1} max={1.5} step={0.05} value={loraStrength} onChange={(e) => setLoraStrength(Number(e.target.value))} className="w-16 accent-gold-400" aria-label="Fuerza del LoRA" />}
                {lora && <span className="w-7 tabular-nums">{loraStrength.toFixed(2)}</span>}
              </label>
            )}
            {collections.length > 0 && (
              <label className="flex h-8 items-center gap-1.5 rounded-md border border-white/10 px-2" title="Cargar una colección de imágenes de referencia">
                <Images size={13} className="text-parch-400" />
                <select value="" onChange={(e) => { const v = e.target.value; if (v.startsWith('del:')) { if (confirm('¿Borrar la colección?')) deleteCollection(v.slice(4)) } else loadCollection(v) }}
                  aria-label="Colecciones de referencia" className="max-w-40 bg-transparent outline-none">
                  <option value="">Colecciones…</option>
                  {collections.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.images.length})</option>)}
                  <optgroup label="Borrar">
                    {collections.map((c) => <option key={`d${c.id}`} value={`del:${c.id}`}>✕ {c.name}</option>)}
                  </optgroup>
                </select>
              </label>
            )}
            <span className="ml-auto hidden text-parch-400 xl:inline">Intro para enviar · arrastra o pega imágenes</span>
          </div>
        </div>
      </div>

      {zoom?.images?.[0] && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setZoom(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-parch-100 hover:bg-white/20" aria-label="Cerrar"><X size={18} /></button>
          <img src={viewUrl(zoom.images[0])} alt={zoom.prompt} className="max-h-[88vh] max-w-full rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <p className="mt-3 max-w-3xl text-center text-sm text-parch-300">{zoom.prompt} · semilla {zoom.seed}</p>
        </div>
      )}

      {toast && (
        <div className="rise fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-gold-500/30 bg-ink-900 px-4 py-3 text-sm text-parch-100 shadow-2xl lg:bottom-8">
          {toast.text}{toast.link && <> · <Link to={toast.link} className="text-gold-300 underline">Ver</Link></>}
        </div>
      )}
    </div>
  )
}

function ConnectionPill({ conn, device, queue, onRetry }: { conn: 'checking' | 'ok' | 'down'; device: string; queue: number; onRetry: () => void }) {
  return (
    <button onClick={onRetry} title="Comprobar conexión"
      className="flex h-8 items-center gap-2 rounded-lg border border-white/10 px-2.5 text-xs text-parch-300 hover:border-gold-500/40">
      <span className={cx('size-2 rounded-full', conn === 'ok' ? 'bg-moss-400' : conn === 'down' ? 'bg-blood-500' : 'animate-pulse bg-parch-400')} />
      {conn === 'ok' ? `Conectado${device ? ` · ${device.split(' ')[0]}` : ''}${queue ? ` · ${queue} en cola` : ''}` : conn === 'down' ? 'Sin conexión' : 'Conectando…'}
      <RefreshCw size={12} className="text-parch-400" />
    </button>
  )
}

function JobItem({ job: j, onZoom, onReuse, onVariation, onCancel, onSave, onEdit, onAsRef }: {
  job: Job; onZoom: () => void; onReuse: () => void; onVariation: () => void; onCancel: () => void; onSave?: (slug: string) => void
  onEdit: () => void; onAsRef: () => void
}) {
  const size = ASPECTS.find((a) => a.id === j.aspect) ?? ASPECTS[0]
  const style = STYLE_PRESETS.find((s) => s.id === j.preset)
  const img = j.images?.[0]
  const busy = j.status === 'sending' || j.status === 'queued' || j.status === 'running'
  const chapters = useMemo(() => CHAPTERS.map((c, i) => ({ slug: c.slug, label: `${i + 1}. ${c.title}` })), [])

  return (
    <div className="space-y-2">
      {/* Mensaje del usuario */}
      <div className="flex justify-end">
        <div className="max-w-[min(42rem,90%)] rounded-2xl rounded-br-md bg-gold-500/12 px-4 py-2.5 ring-1 ring-gold-500/25">
          {(j.init || j.refs?.length) && (
            <div className="mb-2 flex flex-wrap justify-end gap-1.5">
              {j.init && <Thumb img={j.init} label={`Editar · ${Math.round((j.denoise ?? 0) * 100)}%`} accent />}
              {j.refs?.map((r) => <Thumb key={`${r.subfolder}/${r.name}`} img={r} />)}
            </div>
          )}
          <p className="whitespace-pre-wrap text-sm text-parch-100">{j.prompt}</p>
          <div className="mt-1 text-right text-[11px] text-parch-400">
            {style?.label} · {size.label} · semilla {j.seed}
            {j.refs?.length ? ` · ${j.refs.length} ref. (${REF_MODES.find((m) => m.id === j.refMode)?.label.toLowerCase()}, ${j.refWeight})` : ''}
            {j.lora ? ` · LoRA ${j.lora.name.replace(/\.safetensors$/, '')} ${j.lora.strength}` : ''}
          </div>
        </div>
      </div>
      {/* Respuesta */}
      <div className="flex">
        <div className="w-full max-w-[min(40rem,95%)]">
          <div className="overflow-hidden rounded-2xl rounded-bl-md border border-white/10 bg-ink-900">
            {img && j.status !== 'error' ? (
              <button onClick={onZoom} className="group relative block w-full" aria-label="Ampliar imagen">
                <img src={viewUrl(img)} alt={j.prompt} className="block w-full" style={{ aspectRatio: `${size.w} / ${size.h}` }} />
                <span className="absolute right-2 top-2 rounded-md bg-black/50 p-1.5 text-white opacity-0 transition group-hover:opacity-100"><Maximize2 size={14} /></span>
              </button>
            ) : (
              <div className="grid place-items-center bg-white/[.02] p-6 text-center" style={{ aspectRatio: `${size.w} / ${size.h}` }}>
                {busy ? (
                  <div className="w-full max-w-xs">
                    <Loader2 className="mx-auto mb-3 animate-spin text-gold-400" size={22} />
                    <div className="text-sm text-parch-200">{j.status === 'running' ? `Generando… ${Math.round((j.progress ?? 0) * 100)}%` : j.status === 'queued' ? 'En cola' : 'Enviando…'}</div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full bg-gradient-to-r from-gold-600 to-gold-300 transition-all" style={{ width: `${(j.progress ?? 0) * 100}%` }} />
                    </div>
                    <div className="mt-2 text-[11px] text-parch-400">La primera imagen tarda más: ComfyUI carga el modelo en memoria.</div>
                  </div>
                ) : j.status === 'cancelled' ? (
                  <div className="text-sm text-parch-400">Cancelada</div>
                ) : (
                  <div className="text-sm text-blood-500">{j.error ?? 'No se pudo generar la imagen'}</div>
                )}
              </div>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-parch-400">
            {busy && j.promptId && <ActionBtn onClick={onCancel} icon={<Square size={12} />}>Cancelar</ActionBtn>}
            {img && <a href={viewUrl(img)} download={`estudio-${j.seed}.png`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/5 hover:text-parch-100"><Download size={12} />Descargar</a>}
            {!busy && <ActionBtn onClick={onVariation} icon={<Dice5 size={12} />}>Variación</ActionBtn>}
            {!busy && <ActionBtn onClick={onReuse} icon={<RotateCcw size={12} />}>Reutilizar</ActionBtn>}
            {img && <ActionBtn onClick={onEdit} icon={<PenLine size={12} />}>Editar</ActionBtn>}
            {img && <ActionBtn onClick={onAsRef} icon={<ImagePlus size={12} />}>Como referencia</ActionBtn>}
            {img && onSave && (
              <label className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/5 hover:text-parch-100">
                <BookImage size={12} />
                <select defaultValue="" onChange={(e) => { if (e.target.value && confirm('¿Usar esta imagen como ilustración del capítulo? Sustituye a la actual.')) onSave(e.target.value); e.target.value = '' }}
                  className="max-w-40 cursor-pointer bg-transparent outline-none" aria-label="Usar como ilustración de capítulo">
                  <option value="">Poner en capítulo…</option>
                  {chapters.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>
              </label>
            )}
            {j.status === 'done' && j.finishedAt && <span className="ml-auto">{fmtSecs(j.finishedAt - j.createdAt)} · <Badge color="#8d806a">{j.model.replace(/\.safetensors$/, '')}</Badge></span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ onClick, icon, children }: { onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/5 hover:text-parch-100">{icon}{children}</button>
}

function Thumb({ img, label, accent }: { img: InputImage; label?: string; accent?: boolean }) {
  return (
    <span className={cx('relative block size-14 overflow-hidden rounded-lg ring-1', accent ? 'ring-gold-400' : 'ring-white/15')}>
      <img src={inputUrl(img)} alt="" className="size-full object-cover" loading="lazy" />
      {label && <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 text-[9px] leading-4 text-gold-200">{label}</span>}
    </span>
  )
}

function AttachmentTray({
  attachments, uploading, caps, modelKind, denoise, setDenoise, refWeight, setRefWeight, refMode, setRefMode, onRole, onRemove, onClear, onSaveCollection,
}: {
  attachments: Attachment[]; uploading: number; caps: Capabilities; modelKind?: ComfyModel['kind']
  denoise: number; setDenoise: (n: number) => void; refWeight: number; setRefWeight: (n: number) => void; refMode: RefMode; setRefMode: (m: RefMode) => void
  onRole: (i: number, role: Attachment['role']) => void; onRemove: (i: number) => void; onClear: () => void; onSaveCollection: () => void
}) {
  if (!attachments.length && !uploading) return null
  const hasBase = attachments.some((a) => a.role === 'base')
  const refs = attachments.filter((a) => a.role === 'ref').length
  const refsBlocked = refs > 0 && (!caps.ipadapterModels || modelKind !== 'sdxl')
  return (
    <div className="mb-3 space-y-2.5 border-b border-white/5 pb-3">
      <div className="flex flex-wrap items-start gap-2">
        {attachments.map((a, i) => (
          <div key={`${a.img.subfolder}/${a.img.name}`} className="group relative">
            <img src={inputUrl(a.img)} alt="" className={cx('size-16 rounded-lg object-cover ring-2', a.role === 'base' ? 'ring-gold-400' : 'ring-white/10', a.role === 'ref' && refsBlocked && 'opacity-40')} />
            <button onClick={() => onRemove(i)} aria-label="Quitar imagen"
              className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink-950 text-parch-300 ring-1 ring-white/20 hover:text-blood-500"><X size={11} /></button>
            <button onClick={() => onRole(i, a.role === 'base' ? 'ref' : 'base')}
              title={a.role === 'base' ? 'Imagen a editar. Pulsa para usarla como referencia' : 'Referencia. Pulsa para editar esta imagen'}
              className={cx('absolute inset-x-0 bottom-0 rounded-b-lg py-0.5 text-[9px] font-semibold uppercase tracking-wide',
                a.role === 'base' ? 'bg-gold-400 text-ink-950' : 'bg-black/70 text-parch-200 hover:bg-black/90')}>
              {a.role === 'base' ? 'Editar' : 'Ref.'}
            </button>
          </div>
        ))}
        {uploading > 0 && <div className="grid size-16 place-items-center rounded-lg border border-dashed border-white/15"><Loader2 size={16} className="animate-spin text-gold-400" /></div>}
        <div className="ml-auto flex gap-1 text-xs">
          {refs > 1 && <button onClick={onSaveCollection} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-parch-300 hover:bg-white/5 hover:text-parch-100"><FolderPlus size={12} />Guardar colección</button>}
          <button onClick={onClear} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-parch-400 hover:bg-white/5 hover:text-blood-500"><Trash2 size={12} />Quitar todas</button>
        </div>
      </div>

      <div className="grid gap-x-6 gap-y-2 text-xs text-parch-300 sm:grid-cols-2">
        {hasBase && (
          <label className="block">
            <span className="flex justify-between"><span>Cuánto cambiar la imagen</span><span className="tabular-nums text-gold-300">{Math.round(denoise * 100)}%</span></span>
            <input type="range" min={0.15} max={1} step={0.05} value={denoise} onChange={(e) => setDenoise(Number(e.target.value))} className="w-full accent-gold-400" />
            <span className="text-[11px] text-parch-400">{denoise < 0.4 ? 'Retoque: conserva casi todo' : denoise < 0.7 ? 'Equilibrado: misma composición, nuevo detalle' : 'Libre: solo conserva la idea general'}</span>
          </label>
        )}
        {refs > 0 && !refsBlocked && (
          <div>
            <span className="flex justify-between"><span>Fuerza de las {refs} referencias</span><span className="tabular-nums text-gold-300">{refWeight.toFixed(2)}</span></span>
            <input type="range" min={0.1} max={1.5} step={0.05} value={refWeight} onChange={(e) => setRefWeight(Number(e.target.value))} className="w-full accent-gold-400" />
            <div className="mt-1 flex overflow-hidden rounded-md border border-white/10" role="radiogroup" aria-label="Qué copiar de las referencias">
              {REF_MODES.map((m) => (
                <button key={m.id} role="radio" aria-checked={refMode === m.id} onClick={() => setRefMode(m.id)} title={m.hint}
                  className={cx('h-7 flex-1 px-2', refMode === m.id ? 'bg-gold-500/15 text-gold-300' : 'hover:bg-white/5')}>{m.label}</button>
              ))}
            </div>
          </div>
        )}
        {refsBlocked && (
          <div className="rounded-lg border border-[#e9a25b]/30 bg-[#e9a25b]/5 p-2.5 text-[11px] leading-relaxed text-parch-200 sm:col-span-2">
            {modelKind !== 'sdxl' && caps.ipadapterModels
              ? 'Las referencias solo funcionan con modelos SDXL. Elige SDXL o RealVisXL en el selector de modelo.'
              : <>Para usar imágenes como <b>referencia</b> hace falta <b>IP-Adapter</b> en ComfyUI (nodo <code>ComfyUI_IPAdapter_plus</code> + modelos <code>ip-adapter-plus_sdxl_vit-h</code> y <code>CLIP-ViT-H-14</code>). Sin él, las referencias se ignoran. Mientras tanto, marca una imagen como <b>Editar</b> para transformarla (img2img), que funciona ya.</>}
          </div>
        )}
      </div>
    </div>
  )
}
