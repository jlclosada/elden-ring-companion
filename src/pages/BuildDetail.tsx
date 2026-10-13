import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Play, Star } from 'lucide-react'
import { BUILD_BY_ID } from '../data/builds'
import { CLASS_BY_ID, STAT_KEYS, STAT_META } from '../data/classes'
import { LOCATION_BY_ID } from '../data/locations'
import { PHASES, REGION_BY_ID } from '../data/regions'
import type { BuildGear } from '../data/types'
import { checkpointStats, levelFromStats } from '../lib/stats'
import { Badge, Button, Empty, ICONS, Panel, SectionTitle, cx } from '../components/ui'
import { RefDetail, RefThumb } from '../components/ItemCard'
import { MiniMap } from '../components/MiniMap'

const STAGES: { id: BuildGear['stage']; label: string }[] = [
  { id: 'early', label: 'Inicio de partida' },
  { id: 'mid', label: 'Mitad de partida' },
  { id: 'late', label: 'Final de partida' },
  { id: 'dlc', label: 'Shadow of the Erdtree' },
]
const SLOT_ES: Record<BuildGear['slot'], string> = {
  weapon: 'Arma', offhand: 'Secundaria', catalyst: 'Catalizador', spell: 'Hechizo', ash: 'Ceniza de guerra',
  talisman: 'Talismán', armor: 'Armadura', spirit: 'Espíritu', tear: 'Lágrima', consumable: 'Consumible',
}

export default function BuildDetailPage() {
  const { id } = useParams()
  const b = id ? BUILD_BY_ID[id] : undefined
  const [classId, setClassId] = useState(b?.classes[0].id ?? 'wretch')
  const [detail, setDetail] = useState<BuildGear | null>(null)
  const [focus, setFocus] = useState<string | null>(null)
  const focusOn = (id: string) => setFocus(id)
  if (!b) return <Empty title="Build no encontrada" action={<Button to="/builds">Volver</Button>} />

  const Icon = ICONS[b.icon]
  const gearLocs = Array.from(new Set(b.gear.map((g) => g.location).filter(Boolean))) as string[]
  const maxStat = 99

  return (
    <div>
      <Link to="/builds" className="mb-4 inline-flex items-center gap-1 text-sm text-parch-400 hover:text-gold-300"><ArrowLeft size={14} />Builds</Link>

      <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/5 p-6 sm:p-10" style={{ background: `radial-gradient(800px 300px at 90% 0%, ${b.accent}30, transparent 70%), var(--color-ink-900)` }}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl" style={{ background: `${b.accent}25`, color: b.accent }}><Icon size={26} /></div>
              <div className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: b.accent }}>{b.subtitle}</div>
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold text-gold-gradient sm:text-5xl">{b.name}</h1>
            <p className="mt-4 text-parch-200">{b.pitch}</p>
            <div className="mt-4 flex items-center gap-1 text-xs text-parch-400">
              Facilidad {Array.from({ length: 3 }, (_, i) => <Star key={i} size={13} className={i < 4 - b.difficulty ? 'fill-gold-400 text-gold-400' : 'text-white/15'} />)}
            </div>
          </div>
          <Button size="lg" to={`/nueva?build=${b.id}`}><Play size={16} />Empezar partida</Button>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          {/* Equipo por etapa */}
          {STAGES.map((st) => {
            const items = b.gear.filter((g) => g.stage === st.id)
            if (!items.length) return null
            return (
              <section key={st.id}>
                <SectionTitle>{st.label}</SectionTitle>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((g) => {
                    const loc = g.location ? LOCATION_BY_ID[g.location] : undefined
                    return (
                      <div key={g.name} className={cx('flex gap-3 rounded-xl border bg-white/[.02] p-3 transition hover:border-white/15', g.core ? 'border-gold-500/25' : 'border-white/5')}>
                        <button onClick={() => setDetail(g)} aria-label={`Detalles de ${g.name}`}><RefThumb cat={g.cat} name={g.name} size={56} /></button>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button onClick={() => setDetail(g)} className="text-left text-sm font-medium text-parch-100 hover:text-gold-300">{g.name.replace(/^Ash of War: /, '')}</button>
                            {g.core && <Badge color="#e6c56f">Clave</Badge>}
                          </div>
                          <div className="text-[11px] uppercase tracking-wider text-parch-400">{SLOT_ES[g.slot]} · {PHASES[g.phase].short}</div>
                          <p className="mt-1 text-xs leading-relaxed text-parch-300">{g.how}</p>
                          {loc && (
                            <button onClick={() => focusOn(loc.id)} className="mt-1 inline-flex items-center gap-1 text-xs text-gold-400 hover:underline">
                              <MapPin size={11} />{loc.name} · {REGION_BY_ID[loc.region].nameEs}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}

          <section>
            <SectionTitle>Cómo se juega</SectionTitle>
            <Panel className="space-y-2 p-5 text-sm text-parch-300">
              {b.playstyle.map((p) => <p key={p}>— {p}</p>)}
              {b.affinity && <p className="text-parch-200">Afinidad: {b.affinity}</p>}
              <div className="divider-ornament !my-4" />
              {b.tips.map((p) => <p key={p} className="text-gold-300/90">✦ {p}</p>)}
            </Panel>
          </section>
        </div>

        <div className="space-y-8">
          {/* Estadísticas */}
          <section>
            <SectionTitle right={
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className="h-8 rounded-md border border-white/10 bg-ink-900 px-2 text-xs text-parch-200" aria-label="Clase">
                {Object.values(CLASS_BY_ID).map((c) => <option key={c.id} value={c.id}>{c.nameEs}</option>)}
              </select>
            }>Estadísticas por nivel</SectionTitle>
            <Panel className="overflow-x-auto p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-parch-400">
                    <th className="pb-2 text-left font-medium">Atributo</th>
                    {b.checkpoints.map((cp) => <th key={cp.level} className="pb-2 text-right font-medium">Nv {levelFromStats(checkpointStats(classId, cp.stats))}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {STAT_KEYS.map((k) => (
                    <tr key={k} className="border-t border-white/5">
                      <td className="py-1.5"><span style={{ color: STAT_META[k].color }} className={cx(b.primary.includes(k) && 'font-semibold')}>{STAT_META[k].label}</span></td>
                      {b.checkpoints.map((cp) => {
                        const v = checkpointStats(classId, cp.stats)[k]
                        return (
                          <td key={cp.level} className="py-1.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="hidden h-1 w-10 overflow-hidden rounded bg-white/5 sm:block"><div className="h-full" style={{ width: `${(v / maxStat) * 100}%`, background: STAT_META[k].color }} /></div>
                              <span className="w-6 text-parch-100">{v}</span>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-[11px] text-parch-400">Clases recomendadas: {b.classes.map((c) => `${CLASS_BY_ID[c.id].nameEs} (${c.why})`).join(' · ')}</div>
            </Panel>
          </section>

          {/* Mapa del equipo */}
          <section>
            <SectionTitle>Dónde está todo</SectionTitle>
            <MiniMap locations={gearLocs} focus={focus} className="aspect-square" />
            <p className="mt-2 text-xs text-parch-400">Mapa real del juego. Pulsa una ubicación de la lista para centrarla o un marcador para abrir el mapa completo.</p>
          </section>

          {/* Preparación */}
          <section>
            <SectionTitle>Ruta de preparación</SectionTitle>
            <Panel className="p-5">
              <ol className="space-y-3">
                {b.setup.map((s, i) => (
                  <li key={s.id} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gold-500/15 font-display text-xs text-gold-300">{i + 1}</span>
                    <div>
                      <div className="text-sm text-parch-100">{s.title}</div>
                      {s.detail && <div className="text-xs text-parch-400">{s.detail}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>
          </section>
        </div>
      </div>

      {detail && <RefDetail cat={detail.cat} name={detail.name} onClose={() => setDetail(null)} stats={checkpointStats(classId, b.checkpoints[b.checkpoints.length - 1].stats)} locationId={detail.location} />}
    </div>
  )
}
