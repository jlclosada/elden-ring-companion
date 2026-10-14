import { Pressable, Text, View } from 'react-native'
import { Minus, Plus } from 'lucide-react-native'
import { STAT_KEYS, STAT_META } from '@shared/data/classes'
import type { Build, StatKey, Stats } from '@shared/data/types'
import { checkpointStats, levelFromStats, nextAllocation, runeCost, runesBetween, softCapStatus } from '@shared/lib/stats'
import { C, F, alpha } from '@/theme'
import { Badge, Eyebrow, H, Panel, Row, T, tap } from './ui'

function Stepper({ onPress, children, label }: { onPress: () => void; children: React.ReactNode; label: string }) {
  return (
    <Pressable onPress={() => { tap(); onPress() }} onLongPress={onPress} delayLongPress={250} hitSlop={6} accessibilityLabel={label}
      style={({ pressed }) => ({ width: 34, height: 34, borderRadius: 9, backgroundColor: pressed ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' })}>
      {children}
    </Pressable>
  )
}

export function StatEditor({ stats, base, onChange, build, classId }: { stats: Stats; base: Stats; onChange: (s: Stats) => void; build?: Build; classId: string }) {
  const level = levelFromStats(stats)
  const next = build ? nextAllocation(build, classId, stats) : null
  const set = (k: StatKey, v: number) => onChange({ ...stats, [k]: Math.max(base[k], Math.min(99, v)) })

  return (
    <View style={{ gap: 16 }}>
      <Panel>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Eyebrow color={C.parch400}>Nivel</Eyebrow>
            <Text style={{ fontFamily: F.display, fontSize: 40, color: C.gold300 }}>{level}</Text>
          </View>
          <T dim style={{ fontSize: 12, textAlign: 'right' }}>Siguiente nivel:{'\n'}<Text style={{ color: C.parch200, fontWeight: '700' }}>{runeCost(level).toLocaleString('es')}</Text> runas</T>
        </Row>
        {STAT_KEYS.map((k) => {
          const m = STAT_META[k]
          const v = stats[k]
          const cap = softCapStatus(k, v)
          const target = next?.target[k]
          const first = next?.missing[0] === k
          const pct = (v - base[k]) / (99 - base[k])
          return (
            <View key={k} style={{ gap: 6 }}>
              <Row gap={10}>
                <View style={{ width: 82 }}>
                  <Text style={{ color: m.color, fontWeight: '700', fontSize: 13 }}>{m.short}</Text>
                  <Text style={{ color: C.parch400, fontSize: 11 }}>{m.label}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: alpha(m.color, 0.85) }} />
                  </View>
                  <View style={{ height: 8 }}>
                    {m.caps.map((c) => <View key={c} style={{ position: 'absolute', left: `${((c - base[k]) / (99 - base[k])) * 100}%`, width: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.3)' }} />)}
                    {target && target > v && <View style={{ position: 'absolute', left: `${((target - base[k]) / (99 - base[k])) * 100}%`, top: 1, width: 6, height: 6, borderRadius: 3, marginLeft: -3, backgroundColor: C.gold400 }} />}
                  </View>
                </View>
                <Stepper onPress={() => set(k, v - 1)} label={`Bajar ${m.label}`}><Minus size={14} color={C.parch300} /></Stepper>
                <Text style={{ width: 30, textAlign: 'center', fontFamily: F.display, fontSize: 18, color: first ? C.gold300 : C.parch100 }}>{v}</Text>
                <Stepper onPress={() => set(k, v + 1)} label={`Subir ${m.label}`}><Plus size={14} color={C.parch300} /></Stepper>
              </Row>
              {cap.next && v >= cap.next - 3 && v < cap.next && <T dim style={{ fontSize: 11, marginLeft: 92 }}>Umbral de rendimiento en {cap.next}</T>}
            </View>
          )
        })}
      </Panel>

      {build && (
        <>
          <Panel>
            <Eyebrow color={C.parch400}>Siguiente punto</Eyebrow>
            {next ? (
              <>
                <H size={19}>Objetivo ≈ nivel {next.levelTarget}</H>
                {next.checkpoint.note && <T style={{ color: C.gold300, fontSize: 14 }}>{next.checkpoint.note}</T>}
                <T dim style={{ fontSize: 12 }}>{runesBetween(level, next.levelTarget).toLocaleString('es')} runas para llegar</T>
                <Eyebrow color={C.parch400} style={{ marginTop: 6 }}>Sube en este orden</Eyebrow>
                {next.missing.map((k, i) => (
                  <Row key={k} style={{ justifyContent: 'space-between', backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}>
                    <Row gap={8}><Text style={{ color: C.parch400 }}>{i + 1}.</Text><Text style={{ color: STAT_META[k].color, fontSize: 14 }}>{STAT_META[k].label}</Text></Row>
                    <Text style={{ color: C.parch200 }}>{stats[k]} → <Text style={{ fontWeight: '700', color: C.parch100 }}>{next.target[k]}</Text></Text>
                  </Row>
                ))}
              </>
            ) : <T style={{ color: C.moss }}>Has completado todos los puntos de control. ¡Build terminada!</T>}
          </Panel>
          <Panel>
            <Eyebrow color={C.parch400}>Puntos de control de {build.name}</Eyebrow>
            {build.checkpoints.map((cp) => {
              const t = checkpointStats(classId, cp.stats)
              const reached = STAT_KEYS.every((k) => stats[k] >= t[k])
              return (
                <View key={cp.level} style={{ borderRadius: 10, borderWidth: 1, borderColor: reached ? alpha(C.moss, 0.35) : C.line, backgroundColor: reached ? alpha(C.moss, 0.06) : 'transparent', padding: 10, gap: 4 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Text style={{ color: C.parch100, fontWeight: '600' }}>Nivel ≈ {levelFromStats(t)}</Text>
                    {reached && <Badge color={C.moss}>Alcanzado</Badge>}
                  </Row>
                  <Text style={{ color: C.parch400, fontSize: 12 }}>{STAT_KEYS.filter((k) => cp.stats[k]).map((k) => `${STAT_META[k].short} ${t[k]}`).join(' · ')}</Text>
                  {cp.note && <Text style={{ color: C.gold300, fontSize: 12 }}>{cp.note}</Text>}
                </View>
              )
            })}
          </Panel>
        </>
      )}
    </View>
  )
}
