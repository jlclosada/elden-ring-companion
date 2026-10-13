import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, ScrollText, Swords, Weight, Sparkles } from 'lucide-react'
import type { CompendiumCat, CompendiumEntry } from '../data/types'
import { CATEGORY_META, normName, useCategory } from '../lib/compendium'
import { useMapData } from '../lib/mapData'
import { meetsRequirements } from '../lib/stats'
import { BUILDS } from '../data/builds'
import { CHAPTERS } from '../data/lore'
import { STAT_META } from '../data/classes'
import { useActiveRun } from '../store/runs'
import { Badge, Empty, ICONS, Panel, cx } from '../components/ui'
import { ItemThumb } from '../components/ItemCard'

const ATTR: Record<string, { label: string; color: string }> = {
  Phy: { label: 'Físico', color: '#d6cbb3' }, Mag: { label: 'Mágico', color: '#7aa7ff' }, Fire: { label: 'Fuego', color: '#e0873a' },
  Ligt: { label: 'Rayo', color: '#f2e15e' }, Holy: { label: 'Sagrado', color: '#f4dc9a' }, Crit: { label: 'Crítico', color: '#c26be3' }, Boost: { label: 'Estabilidad', color: '#8fbf7a' },
}
const NEG: Record<string, string> = { Phy: 'Físico', Strike: 'Contundente', Slash: 'Cortante', Pierce: 'Perforante', Magic: 'Mágico', Fire: 'Fuego', Ligt: 'Rayo', Holy: 'Sagrado' }
const RES: Record<string, string> = { Immunity: 'Inmunidad', Robustness: 'Robustez', Focus: 'Concentración', Vitality: 'Vitalidad', Poise: 'Equilibrio' }
const SCALE_COLOR: Record<string, string> = { S: '#f4dc9a', A: '#e6c56f', B: '#c9d65a', C: '#8fbf7a', D: '#7aa7ff', E: '#8d806a' }
const statKey = (k: string) => (({ Str: 'str', Dex: 'dex', Int: 'int', Fai: 'fai', Arc: 'arc', Intelligence: 'int', Faith: 'fai', Arcane: 'arc' }) as Record<string, keyof typeof STAT_META>)[k]

export default function ItemPage() {
  const { cat, id } = useParams() as { cat: CompendiumCat; id: string }
  const list = useCategory(cat in CATEGORY_META ? cat : null)
  const map = useMapData()
  const { run } = useActiveRun()
  const idx = list?.findIndex((e) => e.id === id) ?? -1
  const e = idx >= 0 ? list![idx] : undefined

  const related = useMemo(() => {
    if (!e || !list) return []
    const key = e.category || e.type
    return list.filter((x) => x.id !== e.id && (x.category || x.type) === key).slice(0, 8)
  }, [e, list])
  const markerId = e ? `item:${cat}:${e.id}` : ''
  const marker = map?.markers.find((m) => m.id === markerId)
  const builds = e ? BUILDS.filter((b) => b.gear.some((g) => normName(g.name) === normName(e.name))) : []
  const chapters = e ? CHAPTERS.filter((c) => c.relics.some((r) => normName(r.name) === normName(e.name))) : []

  if (!list) return <div className="grid h-64 place-items-center text-sm text-parch-400">Abriendo el compendio…</div>
  if (!e) return <Empty title="Objeto no encontrado" action={<Link to="/compendio" className="text-gold-400 hover:underline">Volver al compendio</Link>} />

  const Icon = ICONS[CATEGORY_META[cat].icon]
  const lore = e.lore?.length ? e.lore : e.description ? [e.description] : []
  const req = e.requires && Object.entries(e.requires).filter(([, v]) => v)
  const check = run && e.requires ? meetsRequirements(e.requires, run.stats) : null
  const prev = list[idx - 1], next = list[idx + 1]

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link to={`/compendio?cat=${cat}`} className="inline-flex items-center gap-1 text-sm text-parch-400 hover:text-gold-300"><ArrowLeft size={14} />{CATEGORY_META[cat].label}</Link>
        <div className="flex gap-1">
          {prev && <Link to={`/compendio/${cat}/${prev.id}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-parch-400 hover:bg-white/5 hover:text-parch-100"><ChevronLeft size={14} /><span className="hidden max-w-40 truncate sm:inline">{prev.name}</span></Link>}
          {next && <Link to={`/compendio/${cat}/${next.id}`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-parch-400 hover:bg-white/5 hover:text-parch-100"><span className="hidden max-w-40 truncate sm:inline">{next.name}</span><ChevronRight size={14} /></Link>}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* Imagen y datos rápidos */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="relic-frame relative grid aspect-square place-items-center overflow-hidden rounded-3xl p-10">
            {e.image ? <img src={e.image} alt={e.name} className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,.8)]" />
              : <Icon size={96} className="text-gold-500/40" />}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge color="#e6c56f"><Icon size={11} />{CATEGORY_META[cat].label}</Badge>
            {(e.category || e.type) && <Badge color="#b3a68c">{e.category || e.type}</Badge>}
            {e.dlc && <Badge color="#d98a4a">Shadow of the Erdtree</Badge>}
            {e.weight != null && <Badge color="#8d806a"><Weight size={11} />{e.weight}</Badge>}
            {e.cost != null && <Badge color="#7aa7ff">{e.cost} PC</Badge>}
            {e.slots != null && <Badge color="#9aa2c4">{e.slots} ranura{e.slots === 1 ? '' : 's'}</Badge>}
          </div>
          {marker ? (
            <Link to={`/mapa?m=${encodeURIComponent(markerId)}`} className="panel panel-hover flex items-center gap-3 p-3">
              <MapPin className="text-gold-400" size={20} />
              <span className="flex-1 text-sm"><span className="block text-parch-100">Ver en el mapa</span><span className="text-xs text-parch-400">{marker.near ? `Junto a ${marker.near}` : 'Ubicación'}</span></span>
              <ChevronRight size={16} className="text-parch-400" />
            </Link>
          ) : null}
        </div>

        {/* Contenido */}
        <div className="min-w-0 space-y-8">
          <header>
            <h1 className="font-display text-4xl font-semibold leading-tight text-gold-gradient md:text-5xl">{e.name}</h1>
            {(e.effect || e.skill) && <p className="mt-3 text-lg text-gold-300">{e.effect || e.skill}</p>}
          </header>

          {lore.length > 0 && (
            <section>
              <div className="ornament mb-4 text-[11px] font-semibold uppercase tracking-[0.3em]">Descripción</div>
              <div className="space-y-4">
                {lore.map((p, i) => (
                  <p key={i} className={cx('font-lore whitespace-pre-line text-[1.2rem] leading-relaxed', i === 0 ? 'text-parch-100' : 'italic text-parch-300')}>{p}</p>
                ))}
              </div>
              {e.loreNotes?.length ? (
                <div className="mt-5 rounded-xl border border-white/5 bg-white/[.02] p-4">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-parch-400"><ScrollText size={13} />Notas de la comunidad</div>
                  <ul className="space-y-1.5 text-sm text-parch-300">{e.loreNotes.map((n, i) => <li key={i}>— {n}</li>)}</ul>
                </div>
              ) : null}
            </section>
          )}

          {e.attack && Object.values(e.attack).some(Boolean) && (
            <section>
              <div className="ornament mb-4 text-[11px] font-semibold uppercase tracking-[0.3em]">Ataque</div>
              <div className="space-y-2.5">
                {Object.entries(e.attack).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[90px_1fr_44px] items-center gap-3 text-sm">
                    <span className="text-parch-300">{ATTR[k]?.label ?? k}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (v / (k === 'Crit' ? 130 : 200)) * 100)}%`, background: ATTR[k]?.color ?? '#d6cbb3' }} /></div>
                    <span className="text-right font-display text-parch-100">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(req?.length || (e.scaling && Object.keys(e.scaling).length)) ? (
            <section className="grid gap-4 sm:grid-cols-2">
              {req && req.length > 0 && (
                <Panel className="p-4">
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-parch-400">Requisitos {run && '· tus atributos'}</div>
                  <div className="flex flex-wrap gap-2">
                    {req.map(([k, v]) => {
                      const sk = statKey(k)
                      const miss = check?.missing.find((m) => m.stat === sk)
                      return (
                        <div key={k} className={cx('rounded-lg border px-3 py-2 text-center', miss ? 'border-[#e36b5b]/40 bg-[#e36b5b]/5' : 'border-white/5 bg-white/[.03]')}>
                          <div className="text-[10px] uppercase tracking-wider" style={{ color: sk ? STAT_META[sk].color : undefined }}>{sk ? STAT_META[sk].short : k}</div>
                          <div className="font-display text-xl text-parch-100">{v}</div>
                          {run && sk && <div className={cx('text-[10px]', miss ? 'text-[#e36b5b]' : 'text-moss-400')}>tienes {run.stats[sk]}</div>}
                        </div>
                      )
                    })}
                  </div>
                </Panel>
              )}
              {e.scaling && Object.keys(e.scaling).length > 0 && (
                <Panel className="p-4">
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-parch-400">Escalado</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(e.scaling).map(([k, v]) => {
                      const sk = statKey(k)
                      return (
                        <div key={k} className="rounded-lg border border-white/5 bg-white/[.03] px-3 py-2 text-center">
                          <div className="text-[10px] uppercase tracking-wider text-parch-400">{sk ? STAT_META[sk].short : k}</div>
                          <div className="font-display text-2xl" style={{ color: SCALE_COLOR[v] ?? '#d6cbb3' }}>{v}</div>
                        </div>
                      )
                    })}
                  </div>
                </Panel>
              )}
            </section>
          ) : null}

          {(e.negation || e.resistance) && (
            <section className="grid gap-4 sm:grid-cols-2">
              {e.negation && <StatTable title="Absorción" rows={Object.entries(e.negation).map(([k, v]) => [NEG[k] ?? k, v])} />}
              {e.resistance && <StatTable title="Resistencias" rows={Object.entries(e.resistance).map(([k, v]) => [RES[k] ?? k, v])} />}
            </section>
          )}

          {e.obtain && (
            <section>
              <div className="ornament mb-4 text-[11px] font-semibold uppercase tracking-[0.3em]">Cómo conseguirlo</div>
              <div className="space-y-2">
                {e.obtain.split('\n').map((l, i) => <p key={i} className="text-[15px] leading-relaxed text-parch-200">{l}</p>)}
              </div>
            </section>
          )}

          {(builds.length > 0 || chapters.length > 0) && (
            <section className="grid gap-4 sm:grid-cols-2">
              {builds.length > 0 && (
                <Panel className="p-4">
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-parch-400"><Swords size={13} />En estas builds</div>
                  <div className="space-y-1.5">{builds.map((b) => <Link key={b.id} to={`/builds/${b.id}`} className="block rounded-lg px-2 py-1.5 text-sm text-parch-100 hover:bg-white/5" style={{ borderLeft: `2px solid ${b.accent}` }}>{b.name}</Link>)}</div>
                </Panel>
              )}
              {chapters.length > 0 && (
                <Panel className="p-4">
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-parch-400"><Sparkles size={13} />Aparece en el lore</div>
                  <div className="space-y-1.5">{chapters.map((c) => <Link key={c.id} to={`/lore/${c.id}`} className="block rounded-lg px-2 py-1.5 text-sm text-parch-100 hover:bg-white/5"><span className="text-parch-400">{c.number}.</span> {c.title}</Link>)}</div>
                </Panel>
              )}
            </section>
          )}

          {related.length > 0 && (
            <section>
              <div className="ornament mb-4 text-[11px] font-semibold uppercase tracking-[0.3em]">Del mismo tipo</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {related.map((r) => <MiniCard key={r.id} e={r} cat={cat} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function StatTable({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <Panel className="p-4">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-parch-400">{title}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-parch-400">{k}</span><span className="tabular-nums text-parch-100">{v}</span></div>)}
      </div>
    </Panel>
  )
}

export function MiniCard({ e, cat }: { e: CompendiumEntry; cat: CompendiumCat }) {
  return (
    <Link to={`/compendio/${cat}/${e.id}`} className="item-card panel flex items-center gap-2 p-2">
      <ItemThumb src={e.image} alt={e.name} size={44} />
      <span className="line-clamp-2 text-xs text-parch-100">{e.name}</span>
    </Link>
  )
}
