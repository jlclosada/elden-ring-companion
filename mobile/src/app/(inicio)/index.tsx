import { useMemo } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router, Stack } from 'expo-router'
import { ArrowRight, BookOpen, Map as MapIcon, Plus, Skull, Swords, Trash2 } from 'lucide-react-native'
import { useActiveRun, useRuns } from '@/store/runs'
import { bossProgress } from '@shared/data/bosses'
import { BUILDS, BUILD_BY_ID } from '@shared/data/builds'
import { CLASS_BY_ID } from '@shared/data/classes'
import { PHASES } from '@shared/data/regions'
import { buildTasks, currentPhase, progressStats, recommend } from '@shared/lib/plan'
import { buildGuide, currentStep, CHAPTER_BY_ID } from '@shared/lib/guide'
import summary from '@shared/data/generated/summary.json'
import { C, F, alpha } from '@/theme'
import { Button, Eyebrow, H, ICONS, Panel, ProgressBar, ProgressRing, Row, Screen, SectionTitle, Stat, T, tap } from '@/components/ui'
import { TaskRow } from '@/components/TaskRow'

export default function Home() {
  const runs = useRuns((s) => s.runs)
  const activeId = useRuns((s) => s.activeId)
  const setActive = useRuns((s) => s.setActive)
  const deleteRun = useRuns((s) => s.deleteRun)
  const { run, build, tasks } = useActiveRun()
  const recs = useMemo(() => (run ? recommend(run, tasks, 3) : []), [run, tasks])
  const guideSteps = useMemo(() => (run ? buildGuide(run.buildId, run.classId, Boolean(run.dlcEnabled)) : []), [run])
  const guideStep = run ? currentStep(run, guideSteps) : null
  const prog = run ? progressStats(run, tasks) : null
  const phase = run ? PHASES[currentPhase(run, tasks)] : null
  const totalItems = Object.values(summary.counts).reduce((a, b) => a + b, 0)

  const confirmDelete = (id: string, name: string) =>
    Alert.alert('Borrar partida', `¿Borrar «${name}»? No se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => deleteRun(id) },
    ])

  return (
    <>
      <Stack.Screen options={{ title: 'Sendero de Gracia' }} />
      <Screen>
        {/* Portada */}
        <View style={st.hero}>
          {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
          <Image source={require('@/assets/images/hero.webp')} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ left: '60%', top: '45%' }} />
          <LinearGradient colors={[alpha(C.ink950, 0.35), alpha(C.ink950, 0.92)]} style={StyleSheet.absoluteFill} />
          <View style={{ padding: 20, gap: 10 }}>
            <Eyebrow>Asistente para Sinluz</Eyebrow>
            <H size={28} gold>Sigue la guía de la gracia</H>
            <T muted style={{ fontSize: 14 }}>
              Elige una build y el asistente genera tu ruta: qué hacer primero, dónde está cada pieza y el mejor orden para recorrer las Tierras Intermedias. {totalItems.toLocaleString('es')} objetos catalogados.
            </T>
            <Row style={{ marginTop: 6, flexWrap: 'wrap' }}>
              <Button icon={<Plus size={18} color={C.ink950} />} onPress={() => router.push('/nueva')}>Nueva partida</Button>
              {run && <Button variant="outline" icon={<ArrowRight size={18} color={C.gold300} />} onPress={() => router.navigate('/partida')}>Continuar</Button>}
            </Row>
          </View>
        </View>

        {/* Partida activa */}
        {run && build && prog && phase && (
          <>
            <Panel onPress={() => router.navigate('/partida')}>
              <Row gap={16}>
                <ProgressRing value={prog.pct} sub="completado" />
                <View style={{ flex: 1, gap: 2 }}>
                  <Eyebrow color={C.parch400}>Partida activa</Eyebrow>
                  <H size={20} numberOfLines={1}>{run.name}</H>
                  <T dim style={{ fontSize: 13 }}>{build.name} · {CLASS_BY_ID[run.classId].nameEs} · Nivel {run.level}</T>
                </View>
              </Row>
              <Row>
                <Stat label="Fase" value={phase.short} />
                <Stat label="Camino" value={`${prog.mainDone}/${prog.main}`} />
                <Stat label="Build" value={`${prog.buildDone}/${prog.build}`} />
              </Row>
              <T muted style={{ fontSize: 14 }}>{phase.summary}</T>
            </Panel>

            <SectionTitle>Tu siguiente paso</SectionTitle>
            {guideStep ? (
              <Panel onPress={() => router.navigate('/partida')}>
                <Eyebrow>{CHAPTER_BY_ID[guideStep.chapter].name}</Eyebrow>
                <H size={19}>{guideStep.title}</H>
                <T muted numberOfLines={3} style={{ fontSize: 14 }}>{guideStep.how[0]}</T>
                <T dim style={{ fontSize: 12 }}>Paso {guideStep.index + 1} de {guideSteps.length}</T>
              </Panel>
            ) : (
              <View style={{ gap: 8 }}>{recs.map((r, i) => <TaskRow key={r.task.id} task={r.task} reasons={r.reasons.slice(0, 2)} warning={r.warning} index={i} />)}</View>
            )}
          </>
        )}

        {/* Partidas */}
        <SectionTitle right={<Text style={{ color: C.parch400, fontSize: 12 }}>{runs.length}</Text>}>Tus partidas</SectionTitle>
        {runs.length === 0 && <T dim>Aún no tienes partidas. Puedes llevar varias a la vez: el progreso de cada una se guarda en este teléfono.</T>}
        <View style={{ gap: 10 }}>
          {runs.map((r) => {
            const b = BUILD_BY_ID[r.buildId]
            const p = progressStats(r, buildTasks(b, r.setupEnabled, r.dlcEnabled))
            const bp = bossProgress(r.done, r.dlcEnabled)
            const Icon = ICONS[b?.icon ?? 'Sword']
            return (
              <Panel key={r.id} accent={r.id === activeId ? C.gold500 : undefined} onPress={() => { tap(); setActive(r.id); router.navigate('/partida') }}>
                <Row gap={12}>
                  <View style={[st.icon, { backgroundColor: alpha(b?.accent ?? C.gold400, 0.14) }]}><Icon size={20} color={b?.accent} /></View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: C.parch100, fontWeight: '600', fontSize: 15 }} numberOfLines={1}>{r.name}</Text>
                    <T dim style={{ fontSize: 12 }} numberOfLines={1}>{b?.name} · Nv {r.level}</T>
                    <Row gap={4}><Skull size={11} color={C.parch400} /><T dim style={{ fontSize: 11 }}>{bp.killed}/{bp.total} jefes · {Math.round(p.pct * 100)}% tareas</T></Row>
                  </View>
                  <Pressable hitSlop={10} onPress={() => confirmDelete(r.id, r.name)} accessibilityLabel="Borrar partida"><Trash2 size={18} color={C.parch400} /></Pressable>
                </Row>
                <ProgressBar value={p.pct} color={b?.accent} />
              </Panel>
            )
          })}
        </View>

        {/* Accesos */}
        <View style={{ gap: 10 }}>
          {[
            { to: '/mapa', icon: MapIcon, title: 'Mapa interactivo', text: 'Regiones, jefes, mazmorras y la ubicación de cada pieza de build.' },
            { to: '/builds', icon: Swords, title: `${BUILDS.length} builds curadas`, text: 'Estadísticas por nivel, equipo, dónde conseguirlo y ruta de preparación.' },
            { to: '/archivo', icon: BookOpen, title: 'Compendio y crónicas', text: 'Armas, talismanes, hechizos y la historia de las Tierras Intermedias.' },
          ].map(({ to, icon: Icon, title, text }) => (
            <Panel key={to} onPress={() => router.navigate(to as never)}>
              <Row gap={12}>
                <Icon size={22} color={C.gold400} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.display, color: C.parch100, fontSize: 16 }}>{title}</Text>
                  <T muted style={{ fontSize: 13 }}>{text}</T>
                </View>
              </Row>
            </Panel>
          ))}
        </View>
      </Screen>
    </>
  )
}

const st = StyleSheet.create({
  hero: { borderRadius: 22, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong, minHeight: 280, justifyContent: 'flex-end' },
  icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
})
