import { useRef, useState } from 'react'
import { ActionSheetIOS, Alert, Platform, ScrollView, View } from 'react-native'
import { router, Stack } from 'expo-router'
import { ArrowLeftRight, Compass, Plus, Sun } from 'lucide-react-native'
import { CLASS_BY_ID } from '@shared/data/classes'
import { bossProgress } from '@shared/data/bosses'
import { progressStats } from '@shared/lib/plan'
import { useActiveRun, useRuns } from '@/store/runs'
import { C } from '@/theme'
import { Button, Empty, Eyebrow, ICONS, ProgressBar, Row, Segmented, T } from '@/components/ui'
import { GuideView } from '@/components/GuideView'
import { BossesTab, ChecklistTab, JournalTab, NextTab, RoadmapTab } from '@/components/RunTabs'
import { StatEditor } from '@/components/StatEditor'

type Tab = 'guide' | 'next' | 'roadmap' | 'checklist' | 'bosses' | 'journal' | 'stats'

export default function RunScreen() {
  const { run, build, tasks } = useActiveRun()
  const runs = useRuns((s) => s.runs)
  const setActive = useRuns((s) => s.setActive)
  const updateRun = useRuns((s) => s.updateRun)
  const setStats = useRuns((s) => s.setStats)
  const [tab, setTab] = useState<Tab>('guide')
  const scroll = useRef<ScrollView>(null)

  if (!run || !build) {
    return (
      <>
        <Stack.Screen options={{ title: 'Partida' }} />
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: C.ink950 }}>
          <Empty icon={<Compass size={36} color={C.gold400} />} title="No hay ninguna partida activa"
            action={<Button icon={<Plus size={16} color={C.ink950} />} onPress={() => router.navigate('/nueva')}>Nueva partida</Button>}>
            Crea una partida eligiendo una build y el asistente generará tu ruta y tu checklist.
          </Empty>
        </ScrollView>
      </>
    )
  }

  const prog = progressStats(run, tasks)
  const bosses = bossProgress(run.done, run.dlcEnabled)
  const Icon = ICONS[build.icon]

  const switchRun = () => {
    const others = runs.filter((r) => r.id !== run.id)
    if (!others.length) { router.navigate('/nueva'); return }
    const labels = [...others.map((r) => r.name), 'Nueva partida', 'Cancelar']
    const pick = (i: number) => {
      if (i < others.length) setActive(others[i].id)
      else if (i === others.length) router.navigate('/nueva')
    }
    if (Platform.OS === 'ios') ActionSheetIOS.showActionSheetWithOptions({ options: labels, cancelButtonIndex: labels.length - 1, title: 'Cambiar de partida' }, pick)
    else Alert.alert('Cambiar de partida', undefined, [...others.slice(0, 2).map((r, i) => ({ text: r.name, onPress: () => pick(i) })), { text: 'Nueva', onPress: () => pick(others.length) }, { text: 'Cancelar', style: 'cancel' }])
  }

  return (
    <>
      <Stack.Screen options={{ title: run.name }} />
      <ScrollView ref={scroll} contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: C.ink950 }} contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 14 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 8 }}>
          <Row gap={8}><Icon size={16} color={build.accent} /><Eyebrow color={build.accent}>{build.name} · {CLASS_BY_ID[run.classId].nameEs}</Eyebrow></Row>
          <T dim style={{ fontSize: 13 }}>{prog.done} de {prog.total} tareas · {bosses.killed}/{bosses.total} jefes · Nivel {run.level}</T>
          <ProgressBar value={prog.pct} height={8} />
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            <Button size="sm" variant="outline" icon={<ArrowLeftRight size={14} color={C.gold300} />} onPress={switchRun}>Cambiar</Button>
            <Button size="sm" variant={run.dlcEnabled ? 'outline' : 'ghost'} icon={<Sun size={14} color={run.dlcEnabled ? C.gold400 : C.parch400} />} onPress={() => updateRun({ dlcEnabled: !run.dlcEnabled })}>DLC {run.dlcEnabled ? 'sí' : 'no'}</Button>
            <Button size="sm" variant="ghost" onPress={() => router.navigate({ pathname: '/builds/[id]', params: { id: build.id } })}>Ver build</Button>
          </Row>
        </View>

        <Segmented<Tab> value={tab} onChange={setTab} items={[
          { id: 'guide', label: 'Guía' },
          { id: 'next', label: 'Siguiente' },
          { id: 'checklist', label: 'Checklist', count: prog.total - prog.done },
          { id: 'bosses', label: 'Jefes', count: bosses.total - bosses.killed },
          { id: 'roadmap', label: 'Ruta' },
          { id: 'stats', label: 'Atributos' },
          { id: 'journal', label: 'Diario' },
        ]} />

        {tab === 'guide' && <GuideView onScrollTop={() => scroll.current?.scrollTo({ y: 0, animated: true })} />}
        {tab === 'next' && <NextTab tasks={tasks} />}
        {tab === 'roadmap' && <RoadmapTab tasks={tasks} />}
        {tab === 'checklist' && <ChecklistTab tasks={tasks} />}
        {tab === 'bosses' && <BossesTab />}
        {tab === 'journal' && <JournalTab tasks={tasks} />}
        {tab === 'stats' && (
          <View style={{ gap: 12 }}>
            <T muted style={{ fontSize: 14 }}>Introduce tus atributos actuales del juego. El asistente usa tu nivel para ajustar la fase, avisarte de zonas peligrosas y decirte qué subir a continuación.</T>
            <StatEditor stats={run.stats} base={CLASS_BY_ID[run.classId].stats} onChange={setStats} build={build} classId={run.classId} />
          </View>
        )}
      </ScrollView>
    </>
  )
}
