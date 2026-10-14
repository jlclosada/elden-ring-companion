/** Paleta de la web (src/index.css): tinta, pergamino y oro. */
export const C = {
  ink950: '#0b0907',
  ink900: '#12100d',
  ink850: '#17140f',
  ink800: '#1d1913',
  ink700: '#2a241b',
  ink600: '#3a3226',
  ink500: '#574b39',
  parch400: '#8d806a',
  parch300: '#b3a68c',
  parch200: '#d6cbb3',
  parch100: '#efe7d4',
  gold300: '#f4dc9a',
  gold400: '#e6c56f',
  gold500: '#d4a94a',
  gold600: '#a77f2c',
  blood: '#c8413a',
  moss: '#8fbf7a',
  amber: '#e9a25b',
  dlc: '#d98a4a',
  line: 'rgba(255,255,255,0.07)',
  lineStrong: 'rgba(255,255,255,0.14)',
  card: 'rgba(255,255,255,0.03)',
} as const

export const F = {
  display: 'Cinzel_600SemiBold',
  displayRegular: 'Cinzel_400Regular',
  lore: 'EBGaramond_400Regular',
  loreItalic: 'EBGaramond_400Regular_Italic',
  loreBold: 'EBGaramond_600SemiBold',
} as const

/** Color con transparencia a partir de un hex de 6 dígitos */
export const alpha = (hex: string, a: number) => {
  const n = Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0')
  return `${hex}${n}`
}
