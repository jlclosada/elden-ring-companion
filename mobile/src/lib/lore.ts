import type { LoreChapter } from '@shared/data/lore'

export const readingMinutes = (c: LoreChapter) =>
  Math.max(2, Math.round(c.sections.flatMap((s) => s.text).join(' ').split(/\s+/).length / 220))
