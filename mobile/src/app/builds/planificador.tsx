import { useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { BUILDS, BUILD_BY_ID } from '@shared/data/builds'
import { CLASSES, CLASS_BY_ID } from '@shared/data/classes'
import type { Stats } from '@shared/data/types'
import { useCategory } from '@shared/lib/compendium'
import { meetsRequirements } from '@shared/lib/stats'
import { useActiveRun, useRuns } from '@/store/runs'
import { C } from '@/theme'
import { Badge, Chip, Eyebrow, ItemThumb, Panel, Row, Screen, SearchField, SectionTitle, T } from '@/components/ui'
import { StatEditor } from '@/components/StatEditor'

export default function Planner() {
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
    <>
      <Stack.Screen options={{ title: 'Planificador', headerLargeTitle: false }} />
      <Screen>
        <T muted style={{ fontSize: 14 }}>Calcula tu nivel, el coste en runas y qué atributo subir para seguir tu build.{usingRun ? ' Los cambios se guardan en tu partida activa.' : ''}</T>
        <Eyebrow color={C.parch400}>Clase</Eyebrow>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{CLASSES.map((c) => <Chip key={c.id} label={c.nameEs} active={c.id === classId} onPress={() => changeClass(c.id)} />)}</View>
        <Eyebrow color={C.parch400}>Build</Eyebrow>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{BUILDS.map((b) => <Chip key={b.id} label={b.name} color={b.accent} active={b.id === buildId} onPress={() => setBuildId(b.id)} />)}</View>
        {usingRun && <Badge color={C.moss}>{`Sincronizado con «${run!.name}»`}</Badge>}
        <StatEditor stats={stats} base={CLASS_BY_ID[classId].stats} onChange={setStats} build={BUILD_BY_ID[buildId]} classId={classId} />
        <WieldChecker stats={stats} />
      </Screen>
    </>
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
    <View style={{ gap: 10 }}>
      <SectionTitle right={<Text style={{ color: C.parch400, fontSize: 12 }}>{okCount} utilizables</Text>}>¿Qué puedo empuñar?</SectionTitle>
      <SearchField value={q} onChange={setQ} placeholder="Filtrar armas…" />
      <Row><Chip label="A dos manos (Fue ×1,5)" active={twoHand} onPress={() => setTwoHand((t) => !t)} /></Row>
      <Panel style={{ padding: 6, gap: 2 }}>
        {usable.slice(0, 60).map(({ w, r }) => (
          <Row key={w.id} gap={10} style={{ paddingHorizontal: 6, paddingVertical: 6 }}>
            <ItemThumb src={w.image} alt={w.name} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.parch100, fontSize: 14 }} numberOfLines={1}>{w.name}</Text>
              <Text style={{ color: C.parch400, fontSize: 11 }}>{w.category}</Text>
            </View>
            {r.ok ? <Badge color={C.moss}>Puedes</Badge> : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 3, maxWidth: 130 }}>
                {r.missing.map((m) => <Badge key={m.stat} color="#e36b5b">{`${m.stat.toUpperCase()} ${m.have}/${m.need}`}</Badge>)}
              </View>
            )}
          </Row>
        ))}
      </Panel>
    </View>
  )
}
