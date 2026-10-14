import { Stack } from 'expo-router'
import { stackOptions } from '@/components/stack'

export default function Layout() {
  return <Stack screenOptions={stackOptions} />
}
