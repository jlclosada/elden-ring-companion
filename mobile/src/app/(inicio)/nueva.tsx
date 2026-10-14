import { useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, ArrowRight, Check as CheckIcon, Wand2 } from 'lucide-react-native'
import { BUILDS, BUILD_BY_ID } from '@shared/data/builds'
import { CLASSES, CLASS_BY_ID, STAT_KEYS, STAT_META } from '@shared/data/classes'
import { checkpointStats, levelFromStats } from '@shared/lib/stats'
import { useRuns } from '@/store/runs'
import { C, F, alpha } from '@/theme'
import { Badge, Button, Eyebrow, H, ICONS, Panel, Row, Screen, T, tap } from '@/components/ui'

const STEPS = ['Build', 'Clase', 'Preparación'] as const

export default function NewRun() {
  const params = useLocalSearchParams<{ build?: string }>()
  const [step, setStep] = useState(0)
  const [buildId, setBuildId] = useState(params.build && BUILD_BY_ID[params.build] ? params.build : BUILDS[0].id)
  const build = BUILD_BY_ID[buildId]
  const [classId, setClassId] = useState(build.classes[0].id)
  const [setup, setSetup] = useState(true)
  const [dlc, setDlc] = useState(true)
  const [name, setName] = useState('')
  const create = useRuns((s) => s.createRun)
  const scroll = useRef<ScrollView>(null)
  const insets = useSafeAreaInsets()
  const goStep = (n: number) => { setStep(n); scroll.current?.scrollTo({ y: 0, animated: false }) }

  // Clase más eficiente: la que menos niveles "desperdicia" para el segundo punto de control
  const ranked = useMemo(() => CLASSES.map((c) => {
    const target = checkpointStats(c.id, build.checkpoints[1]?.stats ?? build.checkpoints[0].stats)
    return { c, lvl: levelFromStats(target) }
  }).sort((a, b) => a.lvl - b.lvl), [build])
  const best = ranked[0].lvl

  const pickBuild = (id: string) => { setBuildId(id); setClassId(BUILD_BY_ID[id].classes[0].id) }
  const finish = () => {
    create({ name: name.trim() || `${build.name} · ${CLASS_BY_ID[classId].nameEs}`, buildId, classId, setupEnabled: setup, dlcEnabled: dlc })
    router.back()
    router.navigate('/partida')
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Nueva partida', headerLargeTitle: false }} />
      <View style={{ flex: 1, backgroundColor: C.ink950 }}>
      <Screen ref={scroll}>
        {/* Pasos */}
        <Row gap={6} style={{ justifyContent: 'center' }}>
          {STEPS.map((s, i) => (
            <Pressable key={s} onPress={() => i < step && goStep(i)}>
              <Row gap={6}>
                <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
                  borderColor: i <= step ? C.gold400 : C.lineStrong, backgroundColor: i < step ? C.gold500 : 'transparent' }}>
                  {i < step ? <CheckIcon size={14} color={C.ink950} /> : <Text style={{ color: i === step ? C.gold300 : C.parch400, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>}
                </View>
                <Text style={{ color: i === step ? C.gold300 : C.parch400, fontSize: 13 }}>{s}</Text>
                {i < STEPS.length - 1 && <View style={{ width: 16, height: 1, backgroundColor: C.lineStrong }} />}
              </Row>
            </Pressable>
          ))}
        </Row>

        {step === 0 && BUILDS.map((b) => {
          const Icon = ICONS[b.icon]
          const sel = b.id === buildId
          return (
            <Panel key={b.id} onPress={() => { tap(); pickBuild(b.id) }} accent={sel ? b.accent : undefined} style={sel ? { borderWidth: 2 } : undefined}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Icon size={24} color={b.accent} />
                <Badge color={b.accent}>{`${'★'.repeat(4 - b.difficulty)} facilidad`}</Badge>
              </Row>
              <H size={19}>{b.name}</H>
              <Eyebrow color={C.parch400}>{b.subtitle}</Eyebrow>
              <T muted numberOfLines={3} style={{ fontSize: 14 }}>{b.pitch}</T>
              {b.dlcOnly && <Badge color={C.dlc}>Solo DLC</Badge>}
            </Panel>
          )
        })}

        {step === 1 && (
          <>
            <Panel>
              <Row gap={8} style={{ alignItems: 'flex-start' }}>
                <Wand2 size={16} color={C.gold400} />
                <T muted style={{ flex: 1, fontSize: 14 }}>
                  Recomendadas para <Text style={{ color: C.parch100, fontWeight: '700' }}>{build.name}</Text>: {build.classes.map((c) => CLASS_BY_ID[c.id].nameEs).join(' o ')}. La eficiencia indica cuántos niveles necesitas para el segundo punto de control.
                </T>
              </Row>
            </Panel>
            {ranked.map(({ c, lvl }) => {
              const rec = build.classes.find((x) => x.id === c.id)
              const sel = c.id === classId
              return (
                <Panel key={c.id} onPress={() => { tap(); setClassId(c.id) }} accent={sel ? C.gold400 : undefined} style={sel ? { borderWidth: 2 } : undefined}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <H size={18}>{c.nameEs}</H>
                    <T dim style={{ fontSize: 12 }}>Nv {c.level}</T>
                  </Row>
                  {rec && <Badge>Recomendada</Badge>}
                  <T muted style={{ fontSize: 13 }}>{rec?.why ?? c.blurb}</T>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                    {STAT_KEYS.map((k) => (
                      <View key={k} style={{ width: '23.5%', alignItems: 'center', paddingVertical: 4, borderRadius: 6, backgroundColor: build.primary.includes(k) ? alpha(C.gold500, 0.12) : C.card }}>
                        <Text style={{ fontSize: 9, color: C.parch400 }}>{STAT_META[k].short}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: C.parch100 }}>{c.stats[k]}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={{ fontSize: 12, color: lvl === best ? C.moss : C.parch400 }}>{lvl === best ? 'Más eficiente' : `+${lvl - best} niveles frente a la mejor`}</Text>
                </Panel>
              )
            })}
          </>
        )}

        {step === 2 && (
          <>
            <Panel>
              <Eyebrow color={C.parch400}>Nombre de la partida</Eyebrow>
              <TextInput value={name} onChangeText={setName} placeholder={`${build.name} · ${CLASS_BY_ID[classId].nameEs}`} placeholderTextColor={C.parch400}
                style={{ color: C.parch100, fontSize: 16, borderWidth: 1, borderColor: C.lineStrong, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: C.ink950 }} />
              <T muted style={{ fontSize: 14 }}>Recuerdo inicial recomendado: <Text style={{ color: C.parch100, fontWeight: '700' }}>{build.keepsake}</Text></T>
            </Panel>
            <Panel>
              <Row style={{ alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: C.parch100, fontWeight: '600', fontSize: 15 }}>Ruta de preparación</Text>
                  <T muted style={{ fontSize: 13 }}>Antes del camino principal se priorizan atajos y equipo temprano: Torrente, campana, frasco y {build.setup.length} pasos de la build.</T>
                </View>
                <Switch value={setup} onValueChange={setSetup} trackColor={{ true: C.gold500 }} />
              </Row>
              <Row style={{ alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: C.parch100, fontWeight: '600', fontSize: 15 }}>Incluir Shadow of the Erdtree</Text>
                  <T muted style={{ fontSize: 13 }}>Añade el Reino de las Sombras a la ruta, la checklist y el mapa ({build.gear.filter((g) => g.stage === 'dlc').length} piezas del DLC para esta build).</T>
                </View>
                <Switch value={dlc} onValueChange={setDlc} trackColor={{ true: C.gold500 }} />
              </Row>
            </Panel>
            <Panel>
              <Eyebrow color={C.parch400}>Tu ruta de preparación</Eyebrow>
              {build.setup.map((s, i) => (
                <Row key={s.id} gap={10} style={{ alignItems: 'flex-start', opacity: setup ? 1 : 0.4 }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: alpha(C.gold500, 0.15), alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: F.display, fontSize: 11, color: C.gold300 }}>{i + 1}</Text>
                  </View>
                  <T style={{ flex: 1, fontSize: 14 }}>{s.title}</T>
                </Row>
              ))}
            </Panel>
          </>
        )}

      </Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: insets.bottom + 58, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.ink950 }}>
        <Button variant="ghost" icon={<ArrowLeft size={16} color={C.parch200} />} onPress={() => (step === 0 ? router.back() : goStep(step - 1))}>Atrás</Button>
        {step < STEPS.length - 1
          ? <Button icon={<ArrowRight size={16} color={C.ink950} />} onPress={() => goStep(step + 1)}>Siguiente</Button>
          : <Button icon={<ArrowRight size={16} color={C.ink950} />} onPress={finish}>Comenzar partida</Button>}
      </View>
      </View>
    </>
  )
}
