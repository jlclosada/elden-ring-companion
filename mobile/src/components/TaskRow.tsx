import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { AlertTriangle, ChevronDown, EyeOff, MapPin } from 'lucide-react-native'
import type { Task } from '@shared/data/types'
import { LOCATION_BY_ID } from '@shared/data/locations'
import { REGION_BY_ID } from '@shared/data/regions'
import { useActiveRun, useRuns } from '@/store/runs'
import { C } from '@/theme'
import { Badge, Check, Row, T } from './ui'
import { RefThumb, useItemSheet } from './ItemSheet'

export const KIND_LABEL: Record<Task['kind'], { label: string; color: string }> = {
  main: { label: 'Principal', color: '#e6c56f' },
  boss: { label: 'Jefe', color: '#e0614f' },
  item: { label: 'Objeto', color: '#6fc3a3' },
  upgrade: { label: 'Mejora', color: '#5fd3e0' },
  key: { label: 'Clave', color: '#c0a8ff' },
  npc: { label: 'PNJ', color: '#7fb1e8' },
  shortcut: { label: 'Atajo', color: '#c0c7d1' },
  dungeon: { label: 'Mazmorra', color: '#a38bd6' },
}

export function TaskRow({ task, reasons, warning, index }: { task: Task; reasons?: string[]; warning?: string; index?: number }) {
  const { run } = useActiveRun()
  const toggle = useRuns((s) => s.toggleTask)
  const hide = useRuns((s) => s.hideTask)
  const sheet = useItemSheet()
  const [open, setOpen] = useState(false)
  const done = Boolean(run?.done[task.id])
  const loc = task.location ? LOCATION_BY_ID[task.location] : undefined
  const region = loc ? REGION_BY_ID[loc.region] : undefined
  const kind = KIND_LABEL[task.kind]

  return (
    <View style={{ flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, opacity: done ? 0.55 : 1 }}>
      <View style={{ gap: 8, alignItems: 'center' }}>
        {index !== undefined && (
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(212,169,74,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: C.gold300, fontSize: 11, fontWeight: '700' }}>{index + 1}</Text>
          </View>
        )}
        <Check checked={done} onToggle={() => toggle(task.id)} />
      </View>
      {task.ref && (
        <Pressable onPress={() => sheet.open({ cat: task.ref!.cat, name: task.ref!.name, locationId: task.location, stats: run?.stats })}>
          <RefThumb cat={task.ref.cat} name={task.ref.name} size={44} />
        </Pressable>
      )}
      <Pressable style={{ flex: 1, gap: 4 }} onPress={() => task.detail && setOpen((o) => !o)}>
        <Text style={{ color: C.parch100, fontSize: 15, fontWeight: '600', textDecorationLine: done ? 'line-through' : 'none' }}>{task.title}</Text>
        <Row gap={6} style={{ flexWrap: 'wrap' }}>
          <Badge color={kind.color}>{kind.label}</Badge>
          {task.required && <Badge color="#e6c56f">Obligatorio</Badge>}
        </Row>
        {loc && (
          <Pressable onPress={() => router.push({ pathname: '/mapa', params: { loc: loc.id } })} hitSlop={6}>
            <Row gap={4}><MapPin size={12} color={C.parch400} /><Text style={{ color: C.parch400, fontSize: 12 }}>{loc.name}{region ? ` · ${region.nameEs}` : ''}</Text></Row>
          </Pressable>
        )}
        {reasons?.map((r) => <Text key={r} style={{ color: 'rgba(212,169,74,0.9)', fontSize: 12 }}>• {r}</Text>)}
        {warning && <Row gap={4}><AlertTriangle size={12} color={C.amber} /><Text style={{ color: C.amber, fontSize: 12, flex: 1 }}>{warning}</Text></Row>}
        {open && task.detail && <T muted style={{ fontSize: 14, marginTop: 4 }}>{task.detail}</T>}
      </Pressable>
      <View style={{ gap: 10, alignItems: 'center' }}>
        {task.detail && <ChevronDown size={18} color={C.parch400} style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }} />}
        {reasons && <Pressable onPress={() => hide(task.id)} hitSlop={8} accessibilityLabel="No recomendar más"><EyeOff size={16} color={C.parch400} /></Pressable>}
      </View>
    </View>
  )
}
