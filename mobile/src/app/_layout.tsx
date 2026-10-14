import { useEffect } from 'react'
import { DynamicColorIOS, Platform } from 'react-native'
import { DarkTheme, ThemeProvider } from 'expo-router'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useFonts, Cinzel_400Regular, Cinzel_600SemiBold } from '@expo-google-fonts/cinzel'
import { EBGaramond_400Regular, EBGaramond_400Regular_Italic, EBGaramond_600SemiBold } from '@expo-google-fonts/eb-garamond'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ItemSheetProvider } from '@/components/ItemSheet'
import { C } from '@/theme'

SplashScreen.preventAutoHideAsync()

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.ink950, card: C.ink950, primary: C.gold400, text: C.parch100, border: C.line } }
const tint = Platform.OS === 'ios' ? DynamicColorIOS({ dark: C.gold400, light: C.gold600 }) : C.gold400

export default function RootLayout() {
  const [loaded] = useFonts({ Cinzel_400Regular, Cinzel_600SemiBold, EBGaramond_400Regular, EBGaramond_400Regular_Italic, EBGaramond_600SemiBold })
  useEffect(() => { if (loaded) SplashScreen.hideAsync() }, [loaded])
  if (!loaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.ink950 }}>
      <ThemeProvider value={theme}>
        <ItemSheetProvider>
          <StatusBar style="light" />
          <NativeTabs tintColor={tint} backgroundColor={C.ink950} labelStyle={{ color: C.parch300 }}>
            <NativeTabs.Trigger name="(inicio)">
              <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon sf={{ default: 'flame', selected: 'flame.fill' }} md="local_fire_department" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="partida">
              <NativeTabs.Trigger.Label>Partida</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon sf={{ default: 'checklist', selected: 'checklist.checked' }} md="checklist" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="mapa">
              <NativeTabs.Trigger.Label>Mapa</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon sf={{ default: 'map', selected: 'map.fill' }} md="map" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="builds">
              <NativeTabs.Trigger.Label>Builds</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon sf={{ default: 'shield', selected: 'shield.fill' }} md="shield" />
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="archivo">
              <NativeTabs.Trigger.Label>Archivo</NativeTabs.Trigger.Label>
              <NativeTabs.Trigger.Icon sf={{ default: 'books.vertical', selected: 'books.vertical.fill' }} md="menu_book" />
            </NativeTabs.Trigger>
          </NativeTabs>
        </ItemSheetProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
