import type { LocationType, MapLocation, Phase, Region, Task } from './types'

/**
 * Shadow of the Erdtree — Reino de las Sombras.
 * Mapa estilizado propio (capa 'shadow', lienzo 1000×1000). Las posiciones son
 * relativas: Llanura de las Tumbas en el centro-sur, Scadu Altus al norte,
 * Pico Escarpado al sureste, Bosque Abisal al este y Enir-Ilim en lo alto.
 */
export const DLC_REGIONS: Region[] = [
  {
    id: 'gravesite', name: 'Gravesite Plain', nameEs: 'Llanura de las Tumbas', layer: 'shadow', phase: 11,
    shape: [[262, 470], [340, 432], [452, 428], [560, 458], [606, 530], [590, 640], [560, 716], [470, 742], [372, 738], [290, 700], [244, 610], [240, 530]],
    label: [420, 600], levels: [120, 140], color: '#8a9a6a',
    blurb: 'Punto de llegada al Reino de las Sombras. Belurat, el Castillo Ensis y los primeros Fragmentos del Árbol Umbrío.',
  },
  {
    id: 'cerulean', name: 'Cerulean Coast', nameEs: 'Costa Cerúlea', layer: 'shadow', phase: 12,
    shape: [[300, 740], [420, 752], [540, 736], [570, 800], [520, 880], [420, 908], [320, 884], [272, 812]],
    label: [420, 830], levels: [130, 150], color: '#6f9fc6',
    blurb: 'Costa de flores azules al sur. Acceso a la Fisura del Sarcófago de Piedra y la Tumba Oculta de Charo.',
  },
  {
    id: 'charo', name: "Charo's Hidden Grave", nameEs: 'Tumba Oculta de Charo', layer: 'shadow', phase: 12,
    shape: [[150, 720], [240, 700], [290, 760], [270, 840], [200, 870], [140, 810]],
    label: [212, 790], levels: [130, 150], color: '#b56b8a',
    blurb: 'Pantano de flores rojas al suroeste. Lamentación y la Fisura del Sarcófago.',
  },
  {
    id: 'jagged', name: 'Jagged Peak', nameEs: 'Pico Escarpado', layer: 'shadow', phase: 12,
    shape: [[606, 560], [690, 520], [800, 540], [858, 610], [840, 720], [760, 780], [660, 772], [600, 700]],
    label: [730, 660], levels: [135, 150], color: '#a06a4a',
    blurb: 'Cumbres volcánicas de dragones. Gran Altar de Comunión Dracónica y Bayle el Pavoroso.',
  },
  {
    id: 'scadu', name: 'Scadu Altus', nameEs: 'Scadu Altus', layer: 'shadow', phase: 12,
    shape: [[300, 300], [380, 236], [500, 214], [624, 236], [672, 312], [650, 410], [560, 456], [452, 428], [340, 432], [290, 376]],
    label: [470, 360], levels: [135, 150], color: '#c4a35a',
    blurb: 'Meseta dorada a los pies del Torreón de la Sombra. Moorth, Aldea Bonny y la base de Rauh.',
  },
  {
    id: 'rauh', name: 'Ancient Ruins of Rauh', nameEs: 'Ruinas Antiguas de Rauh', layer: 'shadow', phase: 12,
    shape: [[150, 150], [250, 110], [330, 150], [350, 240], [300, 300], [230, 320], [160, 270], [130, 200]],
    label: [240, 215], levels: [140, 150], color: '#7f8f9a',
    blurb: 'Ruinas brumosas al noroeste. Iglesia del Brote y Romina, Santa del Brote.',
  },
  {
    id: 'abyssal', name: 'Abyssal Woods', nameEs: 'Bosque Abisal', layer: 'shadow', phase: 12,
    shape: [[672, 312], [760, 290], [870, 330], [900, 430], [858, 510], [760, 520], [690, 500], [650, 410]],
    label: [776, 412], levels: [140, 150], color: '#4f5a4a',
    blurb: 'Bosque oscuro del este con enemigos de la Llama Frenética. Mansión de Midra.',
  },
  {
    id: 'hinterland', name: 'Hinterland', nameEs: 'Interior Remoto', layer: 'shadow', phase: 13,
    shape: [[624, 236], [690, 150], [800, 110], [900, 150], [910, 250], [870, 330], [760, 290], [672, 312]],
    label: [780, 220], levels: [140, 150], color: '#9aa2c4',
    blurb: 'Tierras altas tras el Torreón: Scaduview, las Ruinas del Dedo de Dheo y el meteorito.',
  },
  {
    id: 'enir', name: 'Enir-Ilim', nameEs: 'Enir-Ilim', layer: 'shadow', phase: 13,
    shape: [[420, 50], [520, 36], [580, 80], [560, 140], [470, 160], [410, 120]],
    label: [492, 98], levels: [145, 160], color: '#f0d27a',
    blurb: 'La Torre Divina en la cima. Radahn, Consorte Prometido.',
  },
]

export const DLC_PHASES: Phase[] = [
  { id: 11, name: 'Llanura de las Tumbas', short: 'Sombra I', levels: [120, 140], regions: ['gravesite'], summary: 'Entrar en el Reino de las Sombras, Belurat y el Castillo Ensis. Prioriza Fragmentos del Árbol Umbrío: tu nivel importa menos que la bendición.' },
  { id: 12, name: 'Scadu Altus y el Torreón', short: 'Sombra II', levels: [135, 150], regions: ['scadu', 'rauh', 'cerulean', 'charo', 'jagged', 'abyssal'], summary: 'Torreón de la Sombra y Messmer, Rauh y Romina. Exploración libre: Pico Escarpado, Costa Cerúlea y Bosque Abisal.' },
  { id: 13, name: 'Enir-Ilim', short: 'Sombra III', levels: [145, 160], regions: ['hinterland', 'enir'], summary: 'La subida final. Llega con la Bendición del Árbol Umbrío alta (+16 o más) para Radahn.' },
]

const L = (id: string, name: string, region: string, type: LocationType, x: number, y: number, note?: string): MapLocation =>
  ({ id, name, region, type, x, y, note, layer: 'shadow' })

export const DLC_LOCATIONS: MapLocation[] = [
  // Llanura de las Tumbas
  L('sote-gravesite', 'Gravesite Plain', 'gravesite', 'grace', 392, 652, 'Llegada al Reino de las Sombras.'),
  L('sote-consolation', 'Church of Consolation', 'gravesite', 'church', 450, 610, '2 Fragmentos del Árbol Umbrío.'),
  L('sote-three-path', 'Three-Path Cross', 'gravesite', 'grace', 404, 560, 'Cruz de Miquella con un Fragmento. Garra de león salvaje al NO.'),
  L('sote-scorched', 'Scorched Ruins', 'gravesite', 'item', 330, 620, 'Fragmento (no-muerto con vasija en el cementerio).'),
  L('sote-belurat', 'Belurat, Tower Settlement', 'gravesite', 'legacy', 540, 560, 'Mazmorra legado. 4 Cenizas veneradas.'),
  L('sote-lion', 'Divine Beast Dancing Lion', 'gravesite', 'boss', 560, 520),
  L('sote-ensis', 'Castle Ensis', 'gravesite', 'legacy', 430, 470, 'Moonrithyll, Camafeo de Rellana, Espada de hechicería cariana.'),
  L('sote-rellana', 'Rellana, Twin Moon Knight', 'gravesite', 'boss', 446, 448),
  L('sote-prospect', 'Prospect Town', 'gravesite', 'item', 292, 690, 'Reliquia del Dios Exterior (+Arcano).'),
  L('sote-west-mausoleum', 'Western Nameless Mausoleum', 'gravesite', 'boss', 268, 560, 'Caballero de la Prisión Solitaria: Mandoble de la Soledad.'),
  L('sote-lion-claw', 'Ceniza: Garra de león salvaje', 'gravesite', 'item', 372, 540, 'Campamento al NO de Three-Path Cross.'),
  L('sote-temple-town', 'Temple Town Ruins', 'gravesite', 'item', 500, 690, 'Talismán de espada a dos manos.'),
  L('sote-rhia', 'Finger Ruins of Rhia', 'gravesite', 'landmark', 540, 650),
  L('sote-metyr', 'Cathedral of Manus Metyr', 'gravesite', 'merchant', 318, 730, 'Conde Ymir: Clavos de brillo, Polvo de estrellas amado.'),
  // Scadu Altus / Torreón
  L('sote-moorth', 'Moorth Ruins', 'scadu', 'npc', 372, 372, 'Dane de Hoja Seca: Artes de Hoja Seca. Arcos dorados en el pozo.'),
  L('sote-highroad', 'Highroad Cross', 'scadu', 'grace', 470, 346),
  L('sote-bonny', 'Bonny Village', 'scadu', 'item', 560, 400),
  L('sote-rauh-base', 'Rauh Base', 'scadu', 'item', 300, 330, 'Hexer sanguinario: Lanza sagrada del demonio de sangre.'),
  L('sote-recluses', "Recluses' River", 'scadu', 'item', 340, 412, 'Sello de Hoja Seca.'),
  L('sote-shadow-keep', 'Shadow Keep', 'scadu', 'legacy', 500, 262, 'Torreón de la Sombra. Hipopótamo dorado y Messmer.'),
  L('sote-hippo', 'Golden Hippopotamus', 'scadu', 'boss', 482, 292),
  L('sote-messmer', 'Messmer the Impaler', 'scadu', 'boss', 520, 236, 'Remembranza → Orbe de Messmer / Lanza del Empalador.'),
  L('sote-church-district', 'Church District', 'scadu', 'item', 590, 252, 'Sello del Caballero de Fuego. Queelign.'),
  L('sote-east-mausoleum', 'Eastern Nameless Mausoleum', 'scadu', 'boss', 642, 380, 'Rakshasa: Gran katana de Rakshasa.'),
  // Rauh
  L('sote-romina', 'Romina, Saint of the Bud', 'rauh', 'boss', 212, 170, 'Iglesia del Brote. Necesaria para llegar a Enir-Ilim.'),
  L('sote-rauh-west', 'Ancient Ruins of Rauh (oeste)', 'rauh', 'item', 190, 250, 'Plumas del ave divina, Cenizas veneradas.'),
  // Costa / Charo
  L('sote-cerulean', 'Cerulean Coast', 'cerulean', 'grace', 400, 820),
  L('sote-stone-coffin', 'Stone Coffin Fissure', 'charo', 'dungeon', 196, 830, 'Caballero Putrefacto.'),
  L('sote-charo', "Charo's Hidden Grave", 'charo', 'grace', 220, 760),
  // Pico Escarpado
  L('sote-jagged-foot', 'Foot of the Jagged Peak', 'jagged', 'grace', 640, 712),
  L('sote-dragons-pit', "Dragon's Pit", 'jagged', 'dungeon', 662, 640, 'Hombre-dragón antiguo: Gran katana del cazadragones.'),
  L('sote-dragon-altar', 'Grand Altar of Dragon Communion', 'jagged', 'church', 770, 610, 'Aliento de llama fantasmal (3 corazones). Corazón de Bayle.'),
  L('sote-bayle', 'Bayle the Dread', 'jagged', 'boss', 812, 580),
  // Bosque Abisal
  L('sote-midra', "Midra's Manse", 'abyssal', 'legacy', 810, 390, 'Midra, Señor de la Llama Frenética: Mandoble de la Condena.'),
  // Interior / Enir-Ilim
  L('sote-scaduview', 'Scaduview', 'hinterland', 'grace', 720, 170),
  L('sote-dheo', 'Finger Ruins of Dheo', 'hinterland', 'landmark', 824, 152),
  L('sote-fallingstar', 'Cráter del Fallingstar', 'hinterland', 'boss', 830, 116, 'Misil gravitatorio.'),
  L('sote-enir', 'Enir-Ilim', 'enir', 'legacy', 470, 120),
  L('sote-radahn', 'Promised Consort Radahn', 'enir', 'boss', 500, 70, 'Jefe final del DLC.'),
]

const D = (x: Omit<Task, 'tags' | 'dlc'> & { tags?: Task['tags'] }): Task => ({ tags: ['universal'], dlc: true, ...x })

export const DLC_TASKS: Task[] = [
  D({ id: 'dlc-enter', title: 'Entrar en el Reino de las Sombras', kind: 'main', phase: 11, location: 'mohg', group: 'Shadow of the Erdtree', required: true, after: ['mohg', 'radahn'],
    detail: 'Requiere haber derrotado a Mohg, Señor de la Sangre, y a Radahn. Toca el brazo de Miquella en el capullo tras la arena de Mohg.' }),
  D({ id: 'dlc-lion', title: 'Derrotar a la Bestia Divina León Danzante', kind: 'main', phase: 11, location: 'sote-lion', group: 'Shadow of the Erdtree', required: true }),
  D({ id: 'dlc-rellana', title: 'Derrotar a Rellana, Caballero de las Lunas Gemelas', kind: 'main', phase: 11, location: 'sote-rellana', group: 'Shadow of the Erdtree', required: true }),
  D({ id: 'dlc-messmer', title: 'Derrotar a Messmer el Empalador', kind: 'main', phase: 12, location: 'sote-messmer', group: 'Shadow of the Erdtree', required: true, after: ['dlc-rellana'],
    detail: 'Su remembranza da la Lanza del Empalador o el Orbe de Messmer. Obtienes la Yesca de Messmer para quemar el Árbol Sellado.' }),
  D({ id: 'dlc-romina', title: 'Derrotar a Romina, Santa del Brote', kind: 'main', phase: 12, location: 'sote-romina', group: 'Shadow of the Erdtree', required: true, after: ['dlc-messmer'],
    detail: 'Después quema el Árbol Sellado con la Yesca de Messmer para abrir el camino a Enir-Ilim.' }),
  D({ id: 'dlc-radahn', title: 'Derrotar a Radahn, Consorte Prometido', kind: 'main', phase: 13, location: 'sote-radahn', group: 'Shadow of the Erdtree', required: true, after: ['dlc-romina'],
    detail: 'El jefe más difícil del juego. Recomendado: Bendición del Árbol Umbrío +16-20 y Bendición de cenizas veneradas +10.' }),
  // Opcionales
  D({ id: 'dlc-hippo', title: 'Hipopótamo dorado', kind: 'boss', phase: 12, location: 'sote-hippo', group: 'Jefes opcionales' }),
  D({ id: 'dlc-bayle', title: 'Bayle el Pavoroso', kind: 'boss', phase: 12, location: 'sote-bayle', group: 'Jefes opcionales', tags: ['dragon'], detail: 'Invoca a Igon. Su corazón da Tiranía o Rayo llameante de Bayle.' }),
  D({ id: 'dlc-midra', title: 'Midra, Señor de la Llama Frenética', kind: 'boss', phase: 12, location: 'sote-midra', group: 'Jefes opcionales' }),
  D({ id: 'dlc-putrescent', title: 'Caballero Putrefacto', kind: 'boss', phase: 12, location: 'sote-stone-coffin', group: 'Jefes opcionales' }),
  D({ id: 'dlc-rakshasa', title: 'Rakshasa', kind: 'boss', phase: 12, location: 'sote-east-mausoleum', group: 'Jefes opcionales', tags: ['dex', 'katana'] }),
  D({ id: 'dlc-dane', title: 'Combate amistoso con Dane de Hoja Seca', kind: 'npc', phase: 12, location: 'sote-moorth', group: 'Jefes opcionales', tags: ['melee'] }),
  // Bendición del Árbol Umbrío
  D({ id: 'scadu-consolation', title: 'Fragmentos del Árbol Umbrío ×2 — Iglesia del Consuelo', kind: 'upgrade', phase: 11, location: 'sote-consolation', group: 'Bendición del Árbol Umbrío', tags: ['flask', 'universal'] }),
  D({ id: 'scadu-three-path', title: 'Fragmento del Árbol Umbrío — Cruz de Miquella (Three-Path)', kind: 'upgrade', phase: 11, location: 'sote-three-path', group: 'Bendición del Árbol Umbrío', tags: ['flask', 'universal'] }),
  D({ id: 'scadu-scorched', title: 'Fragmento del Árbol Umbrío — Scorched Ruins', kind: 'upgrade', phase: 11, location: 'sote-scorched', group: 'Bendición del Árbol Umbrío', tags: ['flask', 'universal'] }),
  D({ id: 'scadu-crosses', title: 'Recorre las Cruces de Miquella de Scadu Altus', kind: 'upgrade', phase: 12, location: 'sote-highroad', group: 'Bendición del Árbol Umbrío', tags: ['flask', 'universal'],
    detail: 'Hay 50 Fragmentos: casi todas las Cruces de Miquella e iglesias tienen uno. Objetivo: +6 antes de Rellana, +12 antes de Messmer.' }),
  D({ id: 'revered-belurat', title: 'Cenizas de espíritu veneradas ×4 — Belurat', kind: 'upgrade', phase: 11, location: 'sote-belurat', group: 'Bendición del Árbol Umbrío', tags: ['spirit', 'universal'] }),
  D({ id: 'revered-moorth', title: 'Ceniza venerada — choza al este de Moorth', kind: 'upgrade', phase: 12, location: 'sote-moorth', group: 'Bendición del Árbol Umbrío', tags: ['spirit', 'universal'] }),
  D({ id: 'revered-keep', title: 'Cenizas veneradas ×2 — Torreón de la Sombra', kind: 'upgrade', phase: 12, location: 'sote-shadow-keep', group: 'Bendición del Árbol Umbrío', tags: ['spirit', 'universal'] }),
  D({ id: 'revered-rauh', title: 'Cenizas veneradas ×2 — Ruinas de Rauh (oeste)', kind: 'upgrade', phase: 12, location: 'sote-rauh-west', group: 'Bendición del Árbol Umbrío', tags: ['spirit', 'universal'] }),
  D({ id: 'revered-midra', title: 'Cenizas veneradas ×2 — Mansión de Midra', kind: 'upgrade', phase: 12, location: 'sote-midra', group: 'Bendición del Árbol Umbrío', tags: ['spirit', 'universal'] }),
  D({ id: 'revered-enir', title: 'Cenizas veneradas ×4 — Enir-Ilim', kind: 'upgrade', phase: 13, location: 'sote-enir', group: 'Bendición del Árbol Umbrío', tags: ['spirit', 'universal'] }),
  // Equipo universal útil
  D({ id: 'dlc-two-handed', title: 'Talismán de espada a dos manos', kind: 'item', phase: 11, location: 'sote-temple-town', group: 'Shadow of the Erdtree', tags: ['melee', 'str', 'dex'], ref: { cat: 'talismans', name: 'Two-Handed Sword Talisman' },
    detail: 'Cofre en lo alto de Temple Town Ruins, tras el Guerrero Cornudo.' }),
  D({ id: 'dlc-crimson3', title: 'Medallón de ámbar carmesí +3', kind: 'item', phase: 11, group: 'Shadow of the Erdtree', ref: { cat: 'talismans', name: 'Crimson Amber Medallion +3' },
    detail: 'Recompensa del Caballero de la Muerte de las Catacumbas de la Grieta de Niebla.' }),
  D({ id: 'dlc-bestowal', title: "Talismán del Don del Señor", kind: 'item', phase: 12, location: 'sote-shadow-keep', group: 'Shadow of the Erdtree', ref: { cat: 'talismans', name: "Talisman of Lord's Bestowal" } }),
]

/** Objetivos de Bendición del Árbol Umbrío por jefe principal */
export const SCADU_TARGETS = [
  { boss: 'León Danzante', blessing: 4, spirit: 3 },
  { boss: 'Rellana', blessing: 7, spirit: 5 },
  { boss: 'Messmer', blessing: 12, spirit: 8 },
  { boss: 'Romina', blessing: 14, spirit: 9 },
  { boss: 'Radahn, Consorte', blessing: 18, spirit: 10 },
]
