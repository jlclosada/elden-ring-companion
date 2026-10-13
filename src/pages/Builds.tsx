import { Link } from 'react-router-dom'
import { BUILDS } from '../data/builds'
import { CLASS_BY_ID, STAT_META } from '../data/classes'
import { Badge, ICONS, PageHeader } from '../components/ui'
import { RefThumb } from '../components/ItemCard'

export default function BuildsPage() {
  const archetypes = Array.from(new Set(BUILDS.map((b) => b.archetype)))
  return (
    <div>
      <PageHeader eyebrow="Builds" title="Arquetipos de Sinluz">
        Cada build incluye estadísticas objetivo por nivel, el equipo clave con su ubicación exacta y una ruta de preparación
        para conseguirlo lo antes posible.
      </PageHeader>
      <div className="space-y-10">
        {archetypes.map((a) => (
          <section key={a}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-parch-400">{a}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {BUILDS.filter((b) => b.archetype === a).map((b) => {
                const Icon = ICONS[b.icon]
                const core = b.gear.filter((g) => g.core).slice(0, 5)
                return (
                  <Link key={b.id} to={`/builds/${b.id}`} className="panel panel-hover group relative block overflow-hidden p-6">
                    <div className="absolute -right-10 -top-10 size-44 rounded-full opacity-20 blur-3xl transition group-hover:opacity-35" style={{ background: b.accent }} />
                    <div className="relative flex items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl" style={{ background: `${b.accent}20`, color: b.accent }}><Icon size={24} /></div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-display text-2xl text-parch-100">{b.name}{b.dlcOnly && <Badge color="#d98a4a">Solo DLC</Badge>}</div>
                        <div className="text-xs uppercase tracking-wider" style={{ color: b.accent }}>{b.subtitle}</div>
                      </div>
                    </div>
                    <p className="relative mt-4 text-sm text-parch-300">{b.pitch}</p>
                    <div className="relative mt-4 flex flex-wrap gap-1.5">
                      {b.primary.map((k) => <Badge key={k} color={STAT_META[k].color}>{STAT_META[k].label}</Badge>)}
                      <span className="ml-auto text-xs text-parch-400">{b.classes.map((c) => CLASS_BY_ID[c.id].nameEs).join(' / ')}</span>
                    </div>
                    <div className="relative mt-5 flex gap-2">
                      {core.map((g) => <RefThumb key={g.name} cat={g.cat} name={g.name} size={52} />)}
                      {b.gear.some((g) => g.stage === 'dlc') && !b.dlcOnly && (
                        <span className="ml-auto self-end text-[11px] text-[#d98a4a]">+{b.gear.filter((g) => g.stage === 'dlc').length} piezas del DLC</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
