import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'
import { Check as CheckIcon, Crosshair, Layers, MapPin, Minus, Plus, Search, X } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import type { Layer } from '@shared/data/types'
import { CATS, GROUP_ORDER, LAYER_LABEL, markerIdForLocation, useMapData, type MapMarker } from '@shared/lib/mapData'
import { LOCATION_BY_ID } from '@shared/data/locations'
import { REGION_BY_ID } from '@shared/data/regions'
import { useActiveRun, useFound, useRuns } from '@/store/runs'
import { mapHtml, tilesBase } from '@/lib/mapHtml'
import { C, alpha } from '@/theme'
import { Badge, Button, Chip, Eyebrow, H, Row, SearchField, T, tap } from '@/components/ui'
import { RefThumb, useItemSheet } from '@/components/ItemSheet'

const LAYERS: Layer[] = ['surface', 'underground', 'shadow']
const LAYER_SHORT: Record<Layer, string> = { surface: 'Superficie', underground: 'Subsuelo', shadow: 'Sombras' }
const DEFAULT_ON = Object.keys(CATS).filter((k) => CATS[k].defaultOn)
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function MapScreen() {
  const params = useLocalSearchParams<{ loc?: string }>()
  const insets = useSafeAreaInsets()
  const data = useMapData()
  const { run } = useActiveRun()
  const found = useFound()
  const toggleFound = useRuns((s) => s.toggleFound)
  const toggleTask = useRuns((s) => s.toggleTask)
  const sheet = useItemSheet()
  const web = useRef<WebView>(null)
  const [ready, setReady] = useState(false)
  const [layer, setLayer] = useState<Layer>('surface')
  const [enabled, setEnabled] = useState<string[]>(DEFAULT_ON)
  const [selId, setSelId] = useState<string | null>(null)
  const [filters, setFilters] = useState(false)
  const [q, setQ] = useState('')
  const html = useMemo(() => mapHtml(), [])
  const base = useMemo(() => tilesBase(), [])

  const byId = useMemo(() => new Map((data?.markers ?? []).map((m) => [m.id, m])), [data])
  const sel = selId ? byId.get(selId) : undefined
  const isFound = (m: MapMarker) => Boolean(found[m.id] || (m.bossKey && run?.done[m.bossKey]))

  const visible = useMemo(() => {
    if (!data) return []
    const on = new Set(enabled)
    return data.markers.filter((m) => m.layer === layer && (on.has(m.cat) || m.id === selId) && (run?.dlcEnabled !== false || !m.dlc || layer !== 'shadow'))
  }, [data, layer, enabled, selId, run?.dlcEnabled])

  // Envía el estado al WebView (diff de marcadores dentro)
  useEffect(() => {
    if (!ready || !data) return
    const markers = visible.map((m) => ({ id: m.id, cat: m.cat, x: m.x, y: m.y, a: m.approx ? 1 : 0, f: isFound(m) ? 1 : 0, s: m.id === selId ? 1 : 0 }))
    const cats = Object.fromEntries(Object.entries(CATS).map(([k, c]) => [k, { color: c.color, img: c.img, glyph: c.glyph }]))
    web.current?.injectJavaScript(`window.api&&window.api.render(${JSON.stringify({ layer, meta: data.layers[layer], base, markers, cats })});true;`)
  }, [ready, data, layer, visible, selId, found, run?.done]) // eslint-disable-line react-hooks/exhaustive-deps

  const focusOn = (m: MapMarker) => {
    setLayer(m.layer)
    setSelId(m.id)
    setTimeout(() => web.current?.injectJavaScript(`window.api&&window.api.focus(${m.x},${m.y});true;`), m.layer === layer ? 0 : 450)
  }

  // ?loc=… desde tareas, guía, builds o crónicas
  useEffect(() => {
    if (!ready || !data || !params.loc) return
    const id = markerIdForLocation(params.loc)
    const m = id ? byId.get(id) : undefined
    if (m) {
      if (!enabled.includes(m.cat)) setEnabled((e) => [...e, m.cat])
      focusOn(m)
    }
  }, [ready, data, params.loc]) // eslint-disable-line react-hooks/exhaustive-deps

  const onMessage = (e: WebViewMessageEvent) => {
    const msg = JSON.parse(e.nativeEvent.data) as { type: string; id?: string | null }
    if (msg.type === 'ready') setReady(true)
    if (msg.type === 'select') { if (msg.id) tap(); setSelId(msg.id ?? null) }
  }

  const results = useMemo(() => {
    const n = norm(q.trim())
    if (n.length < 2 || !data) return []
    return data.markers.filter((m) => norm(m.name).includes(n)).slice(0, 30)
  }, [q, data])

  const killed = sel ? isFound(sel) : false
  const loc = sel?.appLocs?.[0] ? LOCATION_BY_ID[sel.appLocs[0]] : undefined
  const region = sel?.region ? REGION_BY_ID[sel.region] : loc ? REGION_BY_ID[loc.region] : undefined

  return (
    <View style={{ flex: 1, backgroundColor: C.ink950 }}>
      <WebView ref={web} source={{ html, baseUrl: base }} originWhitelist={['*']} onMessage={onMessage} style={{ flex: 1, backgroundColor: C.ink950 }}
        javaScriptEnabled domStorageEnabled bounces={false} overScrollMode="never" setSupportMultipleWindows={false} allowsInlineMediaPlayback={false}
        mixedContentMode="always" />
      {!data && <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator color={C.gold400} /></View>}

      {/* Capas y filtros */}
      <View style={[st.top, { top: insets.top + 8 }]} pointerEvents="box-none">
        <View style={st.layers}>
          {LAYERS.map((l) => (
            <Pressable key={l} onPress={() => { tap(); setSelId(null); setLayer(l) }} style={[st.layerBtn, layer === l && { backgroundColor: alpha(C.gold500, 0.22) }]}>
              <Text style={{ color: layer === l ? C.gold300 : C.parch300, fontSize: 13, fontWeight: '600' }}>{LAYER_SHORT[l]}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => { tap(); setFilters(true) }} style={st.round} accessibilityLabel="Capas, filtros y búsqueda"><Search size={18} color={C.parch100} /></Pressable>
      </View>
      <View style={[st.zoom, { top: insets.top + 64 }]}>
        <Pressable onPress={() => web.current?.injectJavaScript('window.api.zoom(0.75);true;')} style={st.zoomBtn}><Plus size={18} color={C.parch200} /></Pressable>
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.lineStrong }} />
        <Pressable onPress={() => web.current?.injectJavaScript('window.api.zoom(-0.75);true;')} style={st.zoomBtn}><Minus size={18} color={C.parch200} /></Pressable>
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.lineStrong }} />
        <Pressable onPress={() => web.current?.injectJavaScript('window.api.fit();true;')} style={st.zoomBtn}><Crosshair size={17} color={C.parch200} /></Pressable>
      </View>

      {/* Ficha del marcador */}
      {sel && (
        <View style={[st.card, { bottom: Math.max(insets.bottom, 12) + 70 }]}>
          <Row gap={12} style={{ alignItems: 'flex-start' }}>
            {sel.ref ? <RefThumb cat={sel.ref.cat} name={sel.ref.name} size={54} /> : (
              <View style={{ width: 12, height: 12, borderRadius: 6, marginTop: 6, backgroundColor: (CATS[sel.cat] ?? CATS.task).color }} />
            )}
            <View style={{ flex: 1, gap: 3 }}>
              <Eyebrow color={(CATS[sel.cat] ?? CATS.task).color}>{(CATS[sel.cat] ?? CATS.task).label}</Eyebrow>
              <H size={18}>{sel.name}</H>
              {(sel.near || region) && <Row gap={4}><MapPin size={12} color={C.parch400} /><T dim style={{ fontSize: 12, flex: 1 }}>{[sel.near, region?.nameEs].filter(Boolean).join(' · ')}</T></Row>}
            </View>
            <Pressable onPress={() => setSelId(null)} hitSlop={10}><X size={20} color={C.parch400} /></Pressable>
          </Row>
          {sel.desc && <T muted numberOfLines={4} style={{ fontSize: 13 }}>{sel.desc}</T>}
          {sel.approx && <T dim style={{ fontSize: 11 }}>Posición aproximada.</T>}
          {sel.loot && sel.loot.length > 0 && <T dim style={{ fontSize: 12 }} numberOfLines={2}>Botín: {sel.loot.join(' · ')}</T>}
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            <Button size="sm" variant={killed ? 'outline' : 'gold'} icon={<CheckIcon size={14} color={killed ? C.gold300 : C.ink950} />}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
                if (sel.bossKey && run) toggleTask(sel.bossKey)
                else toggleFound(sel.id)
              }}>
              {sel.bossKey ? (killed ? 'Derrotado' : 'Marcar como derrotado') : (killed ? 'Encontrado' : 'Marcar como encontrado')}
            </Button>
            {sel.ref && <Button size="sm" variant="outline" onPress={() => sheet.open({ cat: sel.ref!.cat, name: sel.ref!.name, stats: run?.stats })}>Ver ficha</Button>}
          </Row>
          {sel.bossKey && !run && <T dim style={{ fontSize: 11 }}>Crea una partida para llevar la cuenta de los jefes.</T>}
        </View>
      )}

      {/* Filtros y búsqueda */}
      <Modal visible={filters} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFilters(false)}>
        <View style={{ flex: 1, backgroundColor: C.ink900 }}>
          <Row style={{ padding: 16, justifyContent: 'space-between' }}>
            <Row gap={8}><Layers size={20} color={C.gold400} /><H size={20}>Mapa</H></Row>
            <Pressable onPress={() => setFilters(false)} hitSlop={10}><X size={22} color={C.parch200} /></Pressable>
          </Row>
          <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 14, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
            <SearchField value={q} onChange={setQ} placeholder="Buscar jefe, lugar u objeto…" />
            {results.map((m) => (
              <Pressable key={m.id} onPress={() => { setFilters(false); setQ(''); if (!enabled.includes(m.cat)) setEnabled((e) => [...e, m.cat]); focusOn(m) }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, backgroundColor: C.card }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: (CATS[m.cat] ?? CATS.task).color }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.parch100, fontSize: 14 }}>{m.name}</Text>
                  <Text style={{ color: C.parch400, fontSize: 12 }}>{(CATS[m.cat] ?? CATS.task).label} · {LAYER_LABEL[m.layer]}</Text>
                </View>
              </Pressable>
            ))}
            {q.trim().length >= 2 && results.length === 0 && <T dim>Sin resultados.</T>}

            <Eyebrow color={C.parch400}>Capa</Eyebrow>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {LAYERS.map((l) => <Chip key={l} label={LAYER_LABEL[l]} active={layer === l} onPress={() => { setSelId(null); setLayer(l) }} />)}
            </View>
            <Row gap={8}>
              <Button size="sm" variant="outline" onPress={() => setEnabled(Object.keys(CATS))}>Mostrar todo</Button>
              <Button size="sm" variant="ghost" onPress={() => setEnabled(DEFAULT_ON)}>Por defecto</Button>
            </Row>
            {GROUP_ORDER.map((g) => (
              <View key={g} style={{ gap: 4 }}>
                <Eyebrow color={C.parch400}>{g}</Eyebrow>
                {Object.entries(CATS).filter(([, c]) => c.group === g).map(([k, c]) => {
                  const n = (data?.markers ?? []).filter((m) => m.cat === k && m.layer === layer).length
                  return (
                    <Row key={k} style={{ paddingVertical: 6 }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.color }} />
                      <Text style={{ flex: 1, color: C.parch200, fontSize: 15 }}>{c.label}</Text>
                      <Text style={{ color: C.parch400, fontSize: 12, marginRight: 8 }}>{n}</Text>
                      <Switch value={enabled.includes(k)} trackColor={{ true: C.gold500 }}
                        onValueChange={(v) => setEnabled((e) => (v ? [...e, k] : e.filter((x) => x !== k)))} />
                    </Row>
                  )
                })}
              </View>
            ))}
            <Badge color={C.parch400}>{`Teselas: ${base}`}</Badge>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const st = StyleSheet.create({
  top: { position: 'absolute', left: 12, right: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  layers: { flexDirection: 'row', backgroundColor: alpha(C.ink900, 0.94), borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong, padding: 3 },
  layerBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  round: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: alpha(C.ink900, 0.94), borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong },
  zoom: { position: 'absolute', right: 12, width: 42, borderRadius: 12, overflow: 'hidden', backgroundColor: alpha(C.ink900, 0.94), borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong },
  zoomBtn: { height: 42, alignItems: 'center', justifyContent: 'center' },
  card: { position: 'absolute', left: 12, right: 12, gap: 8, padding: 14, borderRadius: 18, backgroundColor: alpha(C.ink900, 0.97), borderWidth: StyleSheet.hairlineWidth, borderColor: alpha(C.gold500, 0.4) },
})


