import { useState, type ReactNode } from 'react'
import type React from 'react'
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  type ScrollViewProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle,
} from 'react-native'
import { Image } from 'expo-image'
import Svg, { Circle } from 'react-native-svg'
import * as Haptics from 'expo-haptics'
import {
  Check as CheckIcon, Droplet, Flame, Sparkles, Moon, Hammer, Sun, Shield, Zap, Sword, Shirt, Gem, Ghost, Package, Leaf, Search,
  type LucideIcon,
} from 'lucide-react-native'
import { C, F, alpha } from '@/theme'

export const ICONS: Record<string, LucideIcon> = { Droplet, Flame, Sparkles, Moon, Hammer, Sun, Shield, Zap, Sword, Shirt, Gem, Ghost, Package, Leaf }

export const tap = () => { Haptics.selectionAsync().catch(() => {}) }

// ---- Texto ----------------------------------------------------------------
export function T({ style, muted, dim, ...p }: TextProps & { muted?: boolean; dim?: boolean }) {
  return <Text {...p} style={[s.body, muted && { color: C.parch300 }, dim && { color: C.parch400 }, style]} />
}
export function H({ style, size = 22, gold, ...p }: TextProps & { size?: number; gold?: boolean }) {
  return <Text {...p} style={[s.display, { fontSize: size, lineHeight: Math.round(size * 1.25) }, gold && { color: C.gold300 }, style]} />
}
export function Eyebrow({ children, color = C.gold500, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.eyebrow, { color }, style]}>{children}</Text>
}

// ---- Contenedores --------------------------------------------------------
export function Screen({ children, contentStyle, ref, ...p }: ScrollViewProps & { contentStyle?: StyleProp<ViewStyle>; ref?: React.Ref<ScrollView> }) {
  return (
    <ScrollView ref={ref} contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: C.ink950 }}
      contentContainerStyle={[{ padding: 16, paddingBottom: 48, gap: 16 }, contentStyle]} keyboardShouldPersistTaps="handled" {...p}>
      {children}
    </ScrollView>
  )
}

export function Panel({ children, style, onPress, accent }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accent?: string }) {
  const base = [s.panel, accent && { borderColor: alpha(accent, 0.45) }, style]
  if (!onPress) return <View style={base}>{children}</View>
  return <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.75 }]}>{children}</Pressable>
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={s.sectionTitle}>
      <H size={17} style={{ flex: 1 }}>{children}</H>
      {right}
    </View>
  )
}

export function Row({ children, style, gap = 8 }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>
}

// ---- Controles -----------------------------------------------------------
export function Badge({ children, color = C.gold400, style }: { children: ReactNode; color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[s.badge, { borderColor: alpha(color, 0.35), backgroundColor: alpha(color, 0.08) }, style]}>
      <Text style={[s.badgeText, { color }]} numberOfLines={1}>{children}</Text>
    </View>
  )
}

export function Button({ children, onPress, variant = 'gold', size = 'md', icon, style, disabled }: {
  children: ReactNode; onPress?: () => void; variant?: 'gold' | 'outline' | 'ghost'; size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode; style?: StyleProp<ViewStyle>; disabled?: boolean
}) {
  const h = size === 'sm' ? 34 : size === 'lg' ? 52 : 44
  const color = variant === 'gold' ? C.ink950 : variant === 'outline' ? C.gold300 : C.parch200
  return (
    <Pressable disabled={disabled} onPress={() => { tap(); onPress?.() }}
      style={({ pressed }) => [s.btn, { height: h, paddingHorizontal: size === 'sm' ? 12 : 18 },
        variant === 'gold' && { backgroundColor: C.gold400 },
        variant === 'outline' && { borderWidth: 1, borderColor: alpha(C.gold500, 0.5) },
        pressed && { opacity: 0.7 }, disabled && { opacity: 0.4 }, style]}>
      {icon}
      <Text style={{ color, fontWeight: '700', fontSize: size === 'sm' ? 13 : 15 }}>{children}</Text>
    </Pressable>
  )
}

export function Chip({ label, active, onPress, color = C.gold400, count }: { label: string; active?: boolean; onPress?: () => void; color?: string; count?: number }) {
  return (
    <Pressable onPress={() => { tap(); onPress?.() }} style={({ pressed }) => [s.chip, active && { borderColor: alpha(color, 0.6), backgroundColor: alpha(color, 0.14) }, pressed && { opacity: 0.7 }]}>
      <Text style={[s.chipText, active && { color }]}>{label}{count !== undefined ? `  ${count}` : ''}</Text>
    </Pressable>
  )
}

/** Fila horizontal de chips desplazable (sustituye a las pestañas de la web) */
export function Segmented<K extends string>({ value, onChange, items }: { value: K; onChange: (k: K) => void; items: { id: K; label: string; count?: number }[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 16 }} style={{ marginHorizontal: -16, paddingLeft: 16, flexGrow: 0 }}>
      {items.map((it) => <Chip key={it.id} label={it.label} count={it.count} active={value === it.id} onPress={() => onChange(it.id)} />)}
    </ScrollView>
  )
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={s.search}>
      <Search size={16} color={C.parch400} />
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.parch400}
        style={{ flex: 1, color: C.parch100, fontSize: 15, paddingVertical: 10 }} autoCorrect={false} clearButtonMode="while-editing" />
    </View>
  )
}

export function Check({ checked, onToggle, size = 24 }: { checked: boolean; onToggle: () => void; size?: number }) {
  return (
    <Pressable hitSlop={10} onPress={() => { Haptics.impactAsync(checked ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); onToggle() }}
      accessibilityRole="checkbox" accessibilityState={{ checked }}
      style={[s.check, { width: size, height: size }, checked && { backgroundColor: C.gold500, borderColor: C.gold400 }]}>
      {checked && <CheckIcon size={size * 0.62} color={C.ink950} strokeWidth={3} />}
    </Pressable>
  )
}

export function Toggle({ on, onPress, label }: { on: boolean; onPress: () => void; label: string }) {
  return <Chip label={label} active={on} onPress={onPress} />
}

// ---- Progreso ------------------------------------------------------------
export function ProgressBar({ value, color = C.gold500, height = 6, style }: { value: number; color?: string; height?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ height, borderRadius: height, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }, style]}>
      <View style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, height: '100%', backgroundColor: color, borderRadius: height }} />
    </View>
  )
}

export function ProgressRing({ value, size = 84, label, sub }: { value: number; size?: number; label?: string; sub?: string }) {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={6} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.gold400} strokeWidth={6} fill="none" strokeLinecap="round"
          strokeDasharray={`${c * Math.max(0, Math.min(1, value))} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <Text style={[s.display, { fontSize: size * 0.22, color: C.parch100 }]}>{label ?? `${Math.round(value * 100)}%`}</Text>
      {sub && <Text style={{ fontSize: 9, color: C.parch400, textTransform: 'uppercase', letterSpacing: 1 }}>{sub}</Text>}
    </View>
  )
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.stat}>
      <Text style={{ fontSize: 9, color: C.parch400, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
      <Text style={[s.display, { fontSize: 15, color: C.parch100 }]} numberOfLines={1}>{value}</Text>
    </View>
  )
}

export function Empty({ title, children, action, icon }: { title: string; children?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 10 }}>
      {icon}
      <H size={20} style={{ textAlign: 'center' }}>{title}</H>
      {children && <T muted style={{ textAlign: 'center' }}>{children}</T>}
      {action}
    </View>
  )
}

// ---- Imágenes ------------------------------------------------------------
export function ItemThumb({ src, alt, size = 48 }: { src?: string | null; alt: string; size?: number }) {
  const [err, setErr] = useState(false)
  return (
    <View style={[s.thumb, { width: size, height: size }]}>
      {src && !err
        ? <Image source={{ uri: src }} style={{ width: size - 6, height: size - 6 }} contentFit="contain" transition={150} onError={() => setErr(true)} />
        : <Text style={[s.display, { color: alpha(C.gold500, 0.7), fontSize: size * 0.3 }]}>{alt.replace(/^Ash of War:\s*/i, '').slice(0, 2)}</Text>}
    </View>
  )
}

export const s = StyleSheet.create({
  body: { color: C.parch200, fontSize: 15, lineHeight: 21 },
  display: { fontFamily: F.display, color: C.parch100 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 2.2, textTransform: 'uppercase' },
  panel: { backgroundColor: C.ink900, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: C.lineStrong, padding: 16, gap: 10 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  btn: { borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  chip: { borderWidth: 1, borderColor: C.lineStrong, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: C.ink900 },
  chipText: { color: C.parch300, fontSize: 13, fontWeight: '600' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.ink900, borderRadius: 12, borderWidth: 1, borderColor: C.lineStrong, paddingHorizontal: 12 },
  check: { borderRadius: 7, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center' },
  stat: { flex: 1, backgroundColor: C.card, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  thumb: { borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, backgroundColor: C.ink800, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
})
