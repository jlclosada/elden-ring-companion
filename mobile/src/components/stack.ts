import type { NativeStackNavigationOptions } from 'expo-router'
import { C, F } from '@/theme'

/** Cabecera nativa con título grande, en la paleta de la app */
export const stackOptions: NativeStackNavigationOptions = {
  headerLargeTitle: true,
  headerTransparent: false,
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerStyle: { backgroundColor: C.ink950 },
  headerLargeStyle: { backgroundColor: C.ink950 },
  headerTintColor: C.gold400,
  headerTitleStyle: { fontFamily: F.display, color: C.parch100 },
  headerLargeTitleStyle: { fontFamily: F.display, color: C.gold300 },
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: C.ink950 },
}
export const smallTitle: NativeStackNavigationOptions = { headerLargeTitle: false }
