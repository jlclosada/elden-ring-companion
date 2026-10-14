import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { MapPin, Play, Star } from 'lucide-react-native'
import { BUILD_BY_ID } from '@shared/data/builds'
import { CLASSES, CLASS_BY_ID, STAT_KEYS, STAT_META } from '@shared/data/classes'
import { LOCATION_BY_ID } from '@shared/data/locations'
import { PHASES, REGION_BY_ID } from '@shared/data/regions'
import type { BuildGear } from '@shared/data/types'
import { checkpointStats, levelFromStats } from '@shared/lib/stats'
import { C, F, alpha } from '@/theme'
import { Badge, Button, Chip, Empty, Eyebrow, H, ICONS, Panel, Row, Screen, SectionTitle, T } from '@/components/ui'
import { RefThumb, useItemSheet } from '@/components/ItemSheet'

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

export default function BuildDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const b = id ? BUILD_BY_ID[id] : undefined
  const [classId, setClassId] = useState(b?.classes[0].id ?? 'wretch')
  const sheet = useItemSheet()
  if (!b) return <Screen><Empty title="Build no encontrada" /></Screen>
  const Icon = ICONS[b.icon]
  const finalStats = checkpointStats(classId, b.checkpoints[b.checkpoints.length - 1].stats)

  return (
    <>
      <Stack.Screen options={{ title: b.name, headerLargeTitle: false }} />
      <Screen>
        <Panel accent={b.accent} style={{ backgroundColor: alpha(b.accent, 0.08) }}>
          <Row gap={10}>
            <View style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: alpha(b.accent, 0.18), alignItems: 'center', justifyContent: 'center' }}><Icon size={24} color={b.accent} /></View>
            <Eyebrow color={b.accent} style={{ flex: 1 }}>{b.subtitle}</Eyebrow>
          </Row>
          <H size={30} gold>{b.name}</H>
          <T style={{ fontSize: 15 }}>{b.pitch}</T>
          <Row gap={2}>
            <T dim style={{ fontSize: 12, marginRight: 4 }}>Facilidad</T>
            {Array.from({ length: 3 }, (_, i) => <Star key={i} size={13} color={i < 4 - b.difficulty ? C.gold400 : 'rgba(255,255,255,0.15)'} fill={i < 4 - b.difficulty ? C.gold400 : 'transparent'} />)}
          </Row>
          <Button size="lg" icon={<Play size={16} color={C.ink950} />} onPress={() => router.navigate({ pathname: '/nueva', params: { build: b.id } })}>Empezar partida</Button>
        </Panel>

        <SectionTitle>Atributos por nivel</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {CLASSES.map((c) => <Chip key={c.id} label={c.nameEs} active={c.id === classId} onPress={() => setClassId(c.id)} />)}
        </View>
        <Panel style={{ gap: 0 }}>
          <Row style={{ paddingBottom: 6 }}>
            <Text style={{ flex: 1, color: C.parch400, fontSize: 10, textTransform: 'uppercase' }}>Atributo</Text>
            {b.checkpoints.map((cp) => <Text key={cp.level} style={{ width: 52, textAlign: 'right', color: C.parch400, fontSize: 10 }}>Nv {levelFromStats(checkpointStats(classId, cp.stats))}</Text>)}
          </Row>
          {STAT_KEYS.map((k) => (
            <Row key={k} style={{ borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 7 }}>
              <Text style={{ flex: 1, color: STAT_META[k].color, fontWeight: b.primary.includes(k) ? '700' : '400', fontSize: 14 }}>{STAT_META[k].label}</Text>
              {b.checkpoints.map((cp) => <Text key={cp.level} style={{ width: 52, textAlign: 'right', color: C.parch100, fontSize: 14 }}>{checkpointStats(classId, cp.stats)[k]}</Text>)}
            </Row>
          ))}
          <T dim style={{ fontSize: 11, marginTop: 8 }}>Clases recomendadas: {b.classes.map((c) => `${CLASS_BY_ID[c.id].nameEs} (${c.why})`).join(' · ')}</T>
        </Panel>

        {STAGES.map((st) => {
          const items = b.gear.filter((g) => g.stage === st.id)
          if (!items.length) return null
          return (
            <View key={st.id} style={{ gap: 8 }}>
              <SectionTitle>{st.label}</SectionTitle>
              {items.map((g) => {
                const loc = g.location ? LOCATION_BY_ID[g.location] : undefined
                return (
                  <Pressable key={g.name} onPress={() => sheet.open({ cat: g.cat, name: g.name, locationId: g.location, stats: finalStats })}
                    style={{ flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: g.core ? alpha(C.gold500, 0.3) : C.line, backgroundColor: C.card }}>
                    <RefThumb cat={g.cat} name={g.name} size={56} />
                    <View style={{ flex: 1, gap: 3 }}>
                      <Row gap={6} style={{ flexWrap: 'wrap' }}>
                        <Text style={{ color: C.parch100, fontSize: 15, fontWeight: '600' }}>{g.name.replace(/^Ash of War: /, '')}</Text>
                        {g.core && <Badge>Clave</Badge>}
                      </Row>
                      <Text style={{ color: C.parch400, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{SLOT_ES[g.slot]} · {PHASES[g.phase].short}</Text>
                      <T muted style={{ fontSize: 13 }}>{g.how}</T>
                      {loc && (
                        <Pressable onPress={() => router.navigate({ pathname: '/mapa', params: { loc: loc.id } })} hitSlop={6}>
                          <Row gap={4}><MapPin size={12} color={C.gold400} /><Text style={{ color: C.gold400, fontSize: 12 }}>{loc.name} · {REGION_BY_ID[loc.region].nameEs}</Text></Row>
                        </Pressable>
                      )}
                    </View>
                  </Pressable>
                )
              })}
            </View>
          )
        })}

        <SectionTitle>Cómo se juega</SectionTitle>
        <Panel>
          {b.playstyle.map((p) => <T key={p} muted style={{ fontSize: 14 }}>— {p}</T>)}
          {b.affinity && <T style={{ fontSize: 14 }}>Afinidad: {b.affinity}</T>}
          {b.tips.map((p) => <T key={p} style={{ color: alpha(C.gold300, 0.9), fontSize: 14 }}>✦ {p}</T>)}
        </Panel>

        <SectionTitle>Ruta de preparación</SectionTitle>
        <Panel>
          {b.setup.map((s, i) => (
            <Row key={s.id} gap={10} style={{ alignItems: 'flex-start' }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: alpha(C.gold500, 0.15), alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: F.display, color: C.gold300, fontSize: 11 }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.parch100, fontSize: 14 }}>{s.title}</Text>
                {s.detail && <T dim style={{ fontSize: 12 }}>{s.detail}</T>}
              </View>
            </Row>
          ))}
        </Panel>
      </Screen>
    </>
  )
}
