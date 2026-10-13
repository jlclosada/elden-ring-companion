import { useMemo, useState } from 'react'
import { BUILDS, BUILD_BY_ID } from '../data/builds'
import { CLASSES, CLASS_BY_ID } from '../data/classes'
import type { Stats } from '../data/types'
import { useActiveRun, useRuns } from '../store/runs'
import { StatEditor } from '../components/StatEditor'
import { PageHeader, Panel, SectionTitle, Badge } from '../components/ui'
import { useCategory } from '../lib/compendium'
import { meetsRequirements } from '../lib/stats'
import { ItemThumb } from '../components/ItemCard'

export default function PlannerPage() {
  const { run } = useActiveRun()
  const setRunStats = useRuns((s) => s.setStats)
  const [classId, setClassId] = useState(run?.classId ?? 'samurai')
  const [buildId, setBuildId] = useState(run?.buildId ?? BUILDS[0].id)
  const [local, setLocal] = useState<Stats>(run?.stats ?? CLASS_BY_ID[classId].stats)
  const usingRun = Boolean(run && run.classId === classId && run.buildId === buildId)
  const stats = usingRun ? run!.stats : local
  const setStats = usingRun ? setRunStats : setLocal

  const changeClass = (id: string) => { setClassId(id); setLocal({ ...CLASS_BY_ID[id].stats }) }

  return (
    <div>
      <PageHeader eyebrow="Planificador" title="Reparte tus runas">
        Calcula tu nivel, el coste en runas y qué atributo subir para seguir tu build. {usingRun && 'Los cambios se guardan en tu partida activa.'}
      </PageHeader>
      <div className="mb-6 flex flex-wrap gap-3">
        <select value={classId} onChange={(e) => changeClass(e.target.value)} className="h-10 rounded-lg border border-white/10 bg-ink-900 px-3 text-sm text-parch-200" aria-label="Clase">
          {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.nameEs} (Nv {c.level})</option>)}
        </select>
        <select value={buildId} onChange={(e) => setBuildId(e.target.value)} className="h-10 rounded-lg border border-white/10 bg-ink-900 px-3 text-sm text-parch-200" aria-label="Build">
          {BUILDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        {usingRun && <Badge color="#8fbf7a" className="self-center">Sincronizado con «{run!.name}»</Badge>}
      </div>
      <StatEditor stats={stats} base={CLASS_BY_ID[classId].stats} onChange={setStats} build={BUILD_BY_ID[buildId]} classId={classId} />
      <WieldChecker stats={stats} />
    </div>
  )
}

function WieldChecker({ stats }: { stats: Stats }) {
  const weapons = useCategory('weapons')
  const [twoHand, setTwoHand] = useState(false)
  const [q, setQ] = useState('')
  const usable = useMemo(() => (weapons ?? [])
    .map((w) => ({ w, r: meetsRequirements(w.requires, stats, twoHand) }))
    .filter(({ w }) => !q || w.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.r.ok) - Number(a.r.ok) || a.r.missing.length - b.r.missing.length), [weapons, stats, twoHand, q])
  const okCount = usable.filter((u) => u.r.ok).length

  return (
    <section className="mt-10">
      <SectionTitle right={<span className="text-xs text-parch-400">{okCount} armas utilizables</span>}>¿Qué puedo empuñar?</SectionTitle>
      <div className="mb-3 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar armas…" className="h-9 min-w-48 flex-1 rounded-lg border border-white/10 bg-ink-900 px-3 text-sm text-parch-100 outline-none focus:border-gold-500/60" />
        <button onClick={() => setTwoHand((t) => !t)} className={`h-9 rounded-lg border px-3 text-sm ${twoHand ? 'border-gold-500/40 bg-gold-500/10 text-gold-300' : 'border-white/10 text-parch-300'}`}>A dos manos (Fue ×1,5)</button>
      </div>
      <Panel className="scrollbar-thin max-h-[420px] overflow-y-auto p-2">
        {usable.slice(0, 120).map(({ w, r }) => (
          <div key={w.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/[.03]">
            <ItemThumb src={w.image} alt={w.name} size={34} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-parch-100">{w.name}</div>
              <div className="text-[11px] text-parch-400">{w.category}</div>
            </div>
            {r.ok ? <Badge color="#8fbf7a">Puedes usarla</Badge> : (
              <div className="flex flex-wrap justify-end gap-1">{r.missing.map((m) => <Badge key={m.stat} color="#e36b5b">{m.stat.toUpperCase()} {m.have}/{m.need}</Badge>)}</div>
            )}
          </div>
        ))}
      </Panel>
    </section>
  )
}
