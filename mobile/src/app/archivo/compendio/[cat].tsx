import { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import type { CompendiumCat } from '@shared/data/types'
import { CATEGORY_META, useCategory } from '@shared/lib/compendium'
import { useActiveRun } from '@/store/runs'
import { C } from '@/theme'
import { Badge, Chip, ItemThumb, Row, SearchField, T } from '@/components/ui'
import { useItemSheet } from '@/components/ItemSheet'

export default function CompendiumList() {
  const { cat } = useLocalSearchParams<{ cat: CompendiumCat }>()
  const list = useCategory(cat ?? null)
  const { run } = useActiveRun()
  const sheet = useItemSheet()
  const [q, setQ] = useState('')
  const [sub, setSub] = useState<string | null>(null)
  const [dlc, setDlc] = useState<'all' | 'base' | 'dlc'>('all')
  const subs = useMemo(() => Array.from(new Set((list ?? []).map((e) => e.category).filter(Boolean))).sort() as string[], [list])
  const needle = q.trim().toLowerCase()
  const items = useMemo(() => (list ?? []).filter((e) =>
    (!sub || e.category === sub) && (dlc === 'all' || (dlc === 'dlc') === Boolean(e.dlc)) &&
    (!needle || `${e.name} ${e.category ?? ''} ${e.effect ?? ''}`.toLowerCase().includes(needle)),
  ), [list, sub, dlc, needle])

  return (
    <>
      <Stack.Screen options={{ title: cat ? CATEGORY_META[cat].label : 'Compendio', headerLargeTitle: false }} />
      <FlatList
        data={items}
        keyExtractor={(e) => e.id}
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: C.ink950 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 8 }}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={16}
        ListHeaderComponent={
          <View style={{ gap: 10, marginBottom: 6 }}>
            <SearchField value={q} onChange={setQ} placeholder="Buscar por nombre o efecto…" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <Chip label="Todo" active={dlc === 'all'} onPress={() => setDlc('all')} />
              <Chip label="Juego base" active={dlc === 'base'} onPress={() => setDlc('base')} />
              <Chip label="DLC" color={C.dlc} active={dlc === 'dlc'} onPress={() => setDlc('dlc')} />
            </View>
            {subs.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}>
                {subs.map((s) => <Chip key={s} label={s} active={sub === s} onPress={() => setSub(sub === s ? null : s)} />)}
              </ScrollView>
            )}
            <T dim style={{ fontSize: 12 }}>{list ? `${items.length} de ${list.length}` : ''}</T>
          </View>
        }
        ListEmptyComponent={list ? <T muted style={{ textAlign: 'center', marginTop: 24 }}>Nada coincide con la búsqueda.</T> : <ActivityIndicator color={C.gold400} style={{ marginTop: 32 }} />}
        renderItem={({ item: e }) => (
          <Pressable onPress={() => sheet.open({ cat: cat!, name: e.name, stats: run?.stats })}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: pressed ? C.ink800 : C.ink900 })}>
            <ItemThumb src={e.image} alt={e.name} size={52} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ color: C.parch100, fontSize: 15, fontWeight: '600' }} numberOfLines={1}>{e.name}</Text>
              <Row gap={6}>
                {e.category && <Text style={{ color: C.parch400, fontSize: 12 }} numberOfLines={1}>{e.category}</Text>}
                {e.dlc && <Badge color={C.dlc}>DLC</Badge>}
              </Row>
              {(e.effect || e.skill) && <Text style={{ color: C.parch300, fontSize: 12 }} numberOfLines={2}>{e.effect || e.skill}</Text>}
            </View>
          </Pressable>
        )}
      />
    </>
  )
}
