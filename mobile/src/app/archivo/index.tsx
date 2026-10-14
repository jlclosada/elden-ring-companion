import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router, Stack } from 'expo-router'
import { ChevronRight, Clock } from 'lucide-react-native'
import { CHAPTERS, CHARACTERS, LORE_PARTS, type LoreCharacter } from '@shared/data/lore'
import { CATEGORY_META } from '@shared/lib/compendium'
import type { CompendiumCat } from '@shared/data/types'
import summary from '@shared/data/generated/summary.json'
import { C, F } from '@/theme'
import { Badge, Eyebrow, H, ICONS, Panel, Row, Screen, Segmented, T } from '@/components/ui'
import { RefThumb } from '@/components/ItemSheet'
import { readingMinutes } from '@/lib/lore'

type Tab = 'compendio' | 'cronicas' | 'personajes'

export default function Archivo() {
  const [tab, setTab] = useState<Tab>('compendio')
  const [who, setWho] = useState<LoreCharacter | null>(null)
  const counts = summary.counts as Record<string, number>

  return (
    <>
      <Stack.Screen options={{ title: 'Archivo' }} />
      <Screen>
        <Segmented<Tab> value={tab} onChange={setTab} items={[
          { id: 'compendio', label: 'Compendio' },
          { id: 'cronicas', label: 'Crónicas' },
          { id: 'personajes', label: 'Personajes' },
        ]} />

        {tab === 'compendio' && (Object.keys(CATEGORY_META) as CompendiumCat[]).map((cat) => {
          const Icon = ICONS[CATEGORY_META[cat].icon] ?? ICONS.Package
          return (
            <Panel key={cat} onPress={() => router.push({ pathname: '/archivo/compendio/[cat]', params: { cat } })}>
              <Row gap={12}>
                <Icon size={22} color={C.gold400} />
                <Text style={{ flex: 1, fontFamily: F.display, fontSize: 16, color: C.parch100 }}>{CATEGORY_META[cat].label}</Text>
                <T dim style={{ fontSize: 13 }}>{counts[cat] ?? ''}</T>
                <ChevronRight size={18} color={C.parch400} />
              </Row>
            </Panel>
          )
        })}

        {tab === 'cronicas' && LORE_PARTS.map((part) => (
          <View key={part} style={{ gap: 10 }}>
            <Eyebrow>{part}</Eyebrow>
            {CHAPTERS.filter((c) => c.part === part).map((c) => (
              <Panel key={c.id} onPress={() => router.push({ pathname: '/archivo/cronica/[id]', params: { id: c.id } })}>
                <Row gap={12} style={{ alignItems: 'flex-start' }}>
                  <RefThumb cat={c.cover.cat} name={c.cover.name} size={64} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ fontSize: 11, color: C.parch400, letterSpacing: 1, textTransform: 'uppercase' }}><Text style={{ color: C.gold400 }}>Capítulo {c.number}</Text> · {c.era}</Text>
                    <H size={17}>{c.title}</H>
                    <Text numberOfLines={3} style={{ fontFamily: F.lore, fontSize: 16, lineHeight: 22, color: C.parch300 }}>{c.summary}</Text>
                    <Row gap={6}><Clock size={11} color={C.parch400} /><T dim style={{ fontSize: 11 }}>{readingMinutes(c)} min</T>{c.dlc && <Badge color={C.dlc}>Contiene DLC</Badge>}</Row>
                  </View>
                </Row>
              </Panel>
            ))}
          </View>
        ))}

        {tab === 'personajes' && (
          <>
            {who && (
              <Panel accent={C.gold500}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <H size={22} gold>{who.name}</H>
                    <T dim style={{ fontSize: 13 }}>{who.title}{who.dlc ? ' · Shadow of the Erdtree' : ''}</T>
                  </View>
                  <Pressable onPress={() => setWho(null)} hitSlop={8}><Text style={{ color: C.parch400 }}>Cerrar</Text></Pressable>
                </Row>
                <Text style={{ fontFamily: F.lore, fontSize: 18, lineHeight: 26, color: C.parch200 }}>{who.bio}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {CHAPTERS.filter((c) => c.characters.includes(who.id)).map((c) => (
                    <Pressable key={c.id} onPress={() => router.push({ pathname: '/archivo/cronica/[id]', params: { id: c.id } })}><Badge>{`Cap. ${c.number} · ${c.title}`}</Badge></Pressable>
                  ))}
                </View>
              </Panel>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {CHARACTERS.map((ch) => (
                <Pressable key={ch.id} onPress={() => setWho(ch)} style={({ pressed }) => ({ width: '31%', alignItems: 'center', gap: 6, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: who?.id === ch.id ? C.gold500 : C.line, backgroundColor: C.ink900, opacity: pressed ? 0.7 : 1 })}>
                  {ch.portrait ? <RefThumb cat={ch.portrait.cat} name={ch.portrait.name} size={58} /> : <View style={{ width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: C.ink800 }}><Text style={{ fontFamily: F.display, fontSize: 22, color: C.gold400 }}>{ch.name[0]}</Text></View>}
                  <Text style={{ fontFamily: F.display, fontSize: 12, color: C.parch100, textAlign: 'center' }} numberOfLines={2}>{ch.name}</Text>
                  <Text style={{ fontSize: 10, color: C.parch400, textAlign: 'center' }} numberOfLines={2}>{ch.title}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </Screen>
    </>
  )
}
