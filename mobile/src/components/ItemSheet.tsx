import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { MapPin, X } from 'lucide-react-native'
import type { CompendiumCat, CompendiumEntry, Stats } from '@shared/data/types'
import { CATEGORY_META, useEntry } from '@shared/lib/compendium'
import { meetsRequirements } from '@shared/lib/stats'
import { C, F, alpha } from '@/theme'
import { Badge, Eyebrow, H, ItemThumb, Row, T } from './ui'

/** Miniatura que resuelve la imagen desde el compendio por nombre */
export function RefThumb({ cat, name, size = 44 }: { cat?: CompendiumCat; name?: string; size?: number }) {
  const e = useEntry(cat, name)
  return <ItemThumb src={e?.image} alt={name ?? '?'} size={size} />
}

const ATTR_ES: Record<string, string> = { Phy: 'Físico', Mag: 'Mágico', Fire: 'Fuego', Ligt: 'Rayo', Holy: 'Sagrado', Crit: 'Crítico', Boost: 'Bloqueo' }

/** Contenido completo de una ficha del compendio */
export function EntryView({ entry, cat, stats, locationId, onMap }: { entry: CompendiumEntry; cat: CompendiumCat; stats?: Stats; locationId?: string; onMap?: () => void }) {
  const req = entry.requires
  const check = stats && req ? meetsRequirements(req, stats) : null
  return (
    <View style={{ gap: 16 }}>
      <Row gap={14} style={{ alignItems: 'flex-start' }}>
        <ItemThumb src={entry.image} alt={entry.name} size={88} />
        <View style={{ flex: 1, gap: 4 }}>
          <Eyebrow>{CATEGORY_META[cat].label}{entry.category ? ` · ${entry.category}` : ''}</Eyebrow>
          <H size={21}>{entry.name}</H>
          {entry.weight != null && <T dim style={{ fontSize: 13 }}>Peso {entry.weight}</T>}
          {entry.dlc && <Badge color={C.dlc}>Shadow of the Erdtree</Badge>}
        </View>
      </Row>

      {(entry.effect || entry.skill) && (
        <View style={{ backgroundColor: alpha(C.gold500, 0.07), borderRadius: 12, padding: 12 }}>
          <T style={{ color: C.gold300 }}>{entry.effect || entry.skill}</T>
        </View>
      )}

      {req && Object.values(req).some(Boolean) && (
        <View style={{ gap: 8 }}>
          <Eyebrow color={C.parch400}>Requisitos{entry.scaling ? ' · Escalado' : ''}</Eyebrow>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(req).filter(([, v]) => v).map(([k, v]) => {
              const miss = check?.missing.find((m) => m.stat.slice(0, 3) === k.toLowerCase().slice(0, 3))
              const sc = entry.scaling?.[k] ?? entry.scaling?.[k.slice(0, 3)]
              return <Badge key={k} color={miss ? '#e36b5b' : C.moss}>{`${k.slice(0, 3).toUpperCase()} ${v}${sc ? ` · ${sc}` : ''}${miss ? ` (tienes ${miss.have})` : ''}`}</Badge>
            })}
          </View>
        </View>
      )}

      {entry.attack && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {Object.entries(entry.attack).filter(([, v]) => v).map(([k, v]) => (
            <View key={k} style={{ width: '31%', backgroundColor: C.card, borderRadius: 10, paddingVertical: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: C.parch400, textTransform: 'uppercase' }}>{ATTR_ES[k] ?? k}</Text>
              <Text style={{ fontFamily: F.display, fontSize: 17, color: C.parch100 }}>{v}</Text>
            </View>
          ))}
        </View>
      )}

      {entry.obtain && (
        <View style={{ gap: 6 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Eyebrow color={C.parch400}>Cómo conseguirlo</Eyebrow>
            {locationId && onMap && (
              <Pressable onPress={onMap} hitSlop={8}><Row gap={4}><MapPin size={13} color={C.gold400} /><Text style={{ color: C.gold400, fontSize: 13 }}>Ver en el mapa</Text></Row></Pressable>
            )}
          </Row>
          <T>{entry.obtain}</T>
        </View>
      )}

      <View style={{ gap: 10, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 14 }}>
        {(entry.lore?.length ? entry.lore : [entry.description]).filter(Boolean).map((p, i) => (
          <Text key={i} style={{ fontFamily: i === 0 ? F.lore : F.loreItalic, fontSize: 18, lineHeight: 27, color: i === 0 ? C.parch200 : C.parch400 }}>{p}</Text>
        ))}
      </View>
    </View>
  )
}

// ---- Hoja global ---------------------------------------------------------
type Req = { cat: CompendiumCat; name: string; locationId?: string; stats?: Stats }
const Ctx = createContext<{ open: (r: Req) => void }>({ open: () => {} })
export const useItemSheet = () => useContext(Ctx)

export function ItemSheetProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<Req | null>(null)
  const open = useCallback((r: Req) => setReq(r), [])
  const value = useMemo(() => ({ open }), [open])
  return (
    <Ctx.Provider value={value}>
      {children}
      <Modal visible={!!req} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setReq(null)}>
        {req && <SheetBody req={req} onClose={() => setReq(null)} />}
      </Modal>
    </Ctx.Provider>
  )
}

function SheetBody({ req, onClose }: { req: Req; onClose: () => void }) {
  const e = useEntry(req.cat, req.name)
  return (
    <View style={{ flex: 1, backgroundColor: C.ink900 }}>
      <Row style={{ justifyContent: 'flex-end', padding: 12 }}>
        <Pressable onPress={onClose} hitSlop={12} style={{ padding: 6, borderRadius: 99, backgroundColor: C.card }} accessibilityLabel="Cerrar"><X size={20} color={C.parch200} /></Pressable>
      </Row>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 48 }}>
        {e ? (
          <EntryView entry={e} cat={req.cat} stats={req.stats} locationId={req.locationId}
            onMap={req.locationId ? () => { onClose(); router.push({ pathname: '/mapa', params: { loc: req.locationId } }) } : undefined} />
        ) : (
          <View style={{ gap: 8 }}>
            <H size={20}>{req.name.replace(/^Ash of War: /i, '')}</H>
            <T dim>Buscando en el compendio…</T>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
