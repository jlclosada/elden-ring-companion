import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { AlertTriangle, ArrowLeft, ArrowRight, MapPin } from 'lucide-react-native'
import { CHAPTERS, CHARACTER_BY_ID, LORE_BY_ID } from '@shared/data/lore'
import { LOCATION_BY_ID } from '@shared/data/locations'
import { C, F } from '@/theme'
import { Badge, Button, Empty, Eyebrow, H, Panel, Row, Screen, SectionTitle, T } from '@/components/ui'
import { RefThumb, useItemSheet } from '@/components/ItemSheet'
import { readingMinutes } from '@/lib/lore'

export default function Cronica() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const c = id ? LORE_BY_ID[id] : undefined
  const [spoiler, setSpoiler] = useState(false)
  const sheet = useItemSheet()
  if (!c) return <Screen><Empty title="Capítulo no encontrado" /></Screen>
  const prev = CHAPTERS[c.number - 2], next = CHAPTERS[c.number]
  const hidden = c.dlc && !spoiler
  const go = (target: typeof c) => router.replace({ pathname: '/archivo/cronica/[id]', params: { id: target.id } })

  return (
    <>
      <Stack.Screen options={{ title: `Capítulo ${c.number}`, headerLargeTitle: false }} />
      <Screen contentStyle={{ padding: 22, gap: 18 }}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Eyebrow>{c.part}</Eyebrow>
          <RefThumb cat={c.cover.cat} name={c.cover.name} size={96} />
          <Text style={{ fontFamily: F.displayRegular, letterSpacing: 3, color: C.parch400, fontSize: 12 }}>CAPÍTULO {c.number}</Text>
          <H size={28} gold style={{ textAlign: 'center' }}>{c.title}</H>
          <T dim style={{ fontSize: 13 }}>{c.era} · {readingMinutes(c)} min de lectura</T>
          <Text style={{ fontFamily: F.loreItalic, fontSize: 19, lineHeight: 27, color: C.parch300, textAlign: 'center', marginTop: 8 }}>«{c.epigraph}»</Text>
          <Text style={{ color: C.gold500, fontSize: 18 }}>✦</Text>
        </View>

        {hidden ? (
          <Panel style={{ alignItems: 'center' }}>
            <AlertTriangle size={22} color={C.dlc} />
            <H size={18}>Spoilers de Shadow of the Erdtree</H>
            <T muted style={{ textAlign: 'center' }}>Este capítulo revela la historia del DLC, incluido el origen de Marika.</T>
            <Button variant="outline" onPress={() => setSpoiler(true)}>Leer igualmente</Button>
          </Panel>
        ) : c.sections.map((s, i) => (
          <View key={i} style={{ gap: 14 }}>
            {s.heading && <H size={20} gold style={{ textAlign: 'center', marginTop: 10 }}>{s.heading}</H>}
            {s.text.map((p, j) => <Text key={j} style={{ fontFamily: F.lore, fontSize: 20, lineHeight: 31, color: C.parch200 }}>{p}</Text>)}
          </View>
        ))}

        {!hidden && c.relics.length > 0 && (
          <>
            <SectionTitle>Reliquias</SectionTitle>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {c.relics.map((r) => (
                <Pressable key={r.name} onPress={() => sheet.open({ cat: r.cat, name: r.name })} style={{ alignItems: 'center', gap: 4, width: 76 }}>
                  <RefThumb cat={r.cat} name={r.name} size={58} />
                  <Text style={{ fontSize: 10, color: C.parch300, textAlign: 'center' }} numberOfLines={2}>{r.name}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
        {!hidden && c.characters.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {c.characters.map((cid) => CHARACTER_BY_ID[cid]).filter(Boolean).map((ch) => <Badge key={ch.id} color={C.parch300}>{ch.name}</Badge>)}
          </View>
        )}
        {!hidden && c.places.length > 0 && (
          <View style={{ gap: 6 }}>
            {c.places.map((p) => LOCATION_BY_ID[p]).filter(Boolean).map((l) => (
              <Pressable key={l.id} onPress={() => router.navigate({ pathname: '/mapa', params: { loc: l.id } })}>
                <Row gap={6}><MapPin size={13} color={C.gold400} /><Text style={{ color: C.gold400, fontSize: 14 }}>{l.name}</Text></Row>
              </Pressable>
            ))}
          </View>
        )}

        <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
          {prev ? <Button variant="ghost" size="sm" icon={<ArrowLeft size={15} color={C.parch200} />} onPress={() => go(prev)}>Anterior</Button> : <View />}
          {next ? <Button variant="outline" size="sm" icon={<ArrowRight size={15} color={C.gold300} />} onPress={() => go(next)}>{next.title}</Button> : <View />}
        </Row>
      </Screen>
    </>
  )
}
