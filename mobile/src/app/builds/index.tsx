import { Text, View } from 'react-native'
import { router, Stack } from 'expo-router'
import { Calculator } from 'lucide-react-native'
import { BUILDS } from '@shared/data/builds'
import { CLASS_BY_ID, STAT_META } from '@shared/data/classes'
import { C, alpha } from '@/theme'
import { Badge, Eyebrow, H, ICONS, Panel, Row, Screen, T } from '@/components/ui'
import { RefThumb } from '@/components/ItemSheet'

export default function Builds() {
  const archetypes = Array.from(new Set(BUILDS.map((b) => b.archetype)))
  return (
    <>
      <Stack.Screen options={{ title: 'Builds' }} />
      <Screen>
        <T muted style={{ fontSize: 14 }}>Cada build incluye atributos objetivo por nivel, el equipo clave con su ubicación exacta y una ruta de preparación para conseguirlo cuanto antes.</T>
        <Panel onPress={() => router.push('/builds/planificador')}>
          <Row gap={12}>
            <Calculator size={22} color={C.gold400} />
            <View style={{ flex: 1 }}>
              <H size={16}>Planificador de runas</H>
              <T muted style={{ fontSize: 13 }}>Calcula tu nivel, el coste en runas y qué armas puedes empuñar.</T>
            </View>
          </Row>
        </Panel>
        {archetypes.map((a) => (
          <View key={a} style={{ gap: 10 }}>
            <Eyebrow color={C.parch400}>{a}</Eyebrow>
            {BUILDS.filter((b) => b.archetype === a).map((b) => {
              const Icon = ICONS[b.icon]
              const core = b.gear.filter((g) => g.core).slice(0, 5)
              return (
                <Panel key={b.id} onPress={() => router.push({ pathname: '/builds/[id]', params: { id: b.id } })}>
                  <Row gap={12}>
                    <View style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: alpha(b.accent, 0.14), alignItems: 'center', justifyContent: 'center' }}><Icon size={24} color={b.accent} /></View>
                    <View style={{ flex: 1 }}>
                      <H size={20}>{b.name}</H>
                      <Text style={{ color: b.accent, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>{b.subtitle}</Text>
                    </View>
                    {b.dlcOnly && <Badge color={C.dlc}>Solo DLC</Badge>}
                  </Row>
                  <T muted numberOfLines={3} style={{ fontSize: 14 }}>{b.pitch}</T>
                  <Row gap={6} style={{ flexWrap: 'wrap' }}>
                    {b.primary.map((k) => <Badge key={k} color={STAT_META[k].color}>{STAT_META[k].label}</Badge>)}
                    <T dim style={{ fontSize: 12 }}>{b.classes.map((c) => CLASS_BY_ID[c.id].nameEs).join(' / ')}</T>
                  </Row>
                  <Row gap={8}>{core.map((g) => <RefThumb key={g.name} cat={g.cat} name={g.name} size={50} />)}</Row>
                </Panel>
              )
            })}
          </View>
        ))}
      </Screen>
    </>
  )
}
