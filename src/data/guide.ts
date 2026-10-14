import type { CompendiumCat, Stats } from './types'

/**
 * Guía paso a paso. Cada build tiene un plan (BUILD_PLANS) con:
 *  - pasos propios de preparación (objetos clave sin pelear o con peleas fáciles)
 *  - atributos objetivo por capítulo (el nivel exacto se calcula según la clase)
 *  - equipo por capítulo (arma, afinidad, ceniza, talismanes, hechizos, espíritu)
 * Estos se combinan con la ruta común (SPINE) en lib/guide.ts.
 */

export type ChapterId =
  | 'setup'
  | 'limgrave'
  | 'stormveil'
  | 'liurnia'
  | 'caelid'
  | 'altus'
  | 'leyndell'
  | 'giants'
  | 'endgame'
  | 'dlc'
export type Fight = 'ninguno' | 'fácil' | 'medio' | 'difícil'
export type StepKind = 'route' | 'loot' | 'boss' | 'npc' | 'farm' | 'prep' | 'tip'
export type Ref = { cat: CompendiumCat; name: string }

export interface GuideStep {
  id: string
  chapter: ChapterId
  title: string
  kind: StepKind
  location?: string
  fight?: Fight
  runes?: number
  loot?: Ref[]
  how: string[]
  optional?: boolean
  /** Tareas de la checklist que se completan con este paso */
  taskIds?: string[]
  /** Solo para builds con estas etiquetas */
  onlyFor?: string[]
}

export interface Chapter {
  id: ChapterId
  name: string
  goal: string
  /** Nivel de mejora recomendado al terminar el capítulo */
  upgrade: { regular: number; somber: number }
  stones: string
  farm?: string
  dlc?: boolean
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'setup',
    name: 'Preparación: chetarse sin pelear',
    goal: 'Montura, frascos, equipo clave de tu build, la forja desbloqueada y ~50.000 runas antes de tocar el camino principal.',
    upgrade: { regular: 2, somber: 1 },
    stones:
      'Piedras de forja [1]: vetas de los Túneles de Limgrave (≈8) y una en la Iglesia de Elleh. Sombría [1]: Túneles de Limgrave. Si encuentras más, sube a +3.',
  },
  {
    id: 'limgrave',
    name: 'Necrolimbo y Margit',
    goal: 'Limpiar Necrolimbo y la Península Llorosa (frascos) y derrotar a Margit.',
    upgrade: { regular: 4, somber: 2 },
    stones:
      'Piedras [1]-[2]: Túneles de Limgrave, Túnel de Morne (Península). El Mercader nómada al este de Saintsbridge vende 3 de [1].',
    farm: 'Gasta las Runas doradas que vayas recogiendo (consúmelas solo cuando vayas a subir de nivel).',
  },
  {
    id: 'stormveil',
    name: 'Castillo de Velo Tormentoso',
    goal: 'Atravesar Velo Tormentoso, recoger sus objetos y derrotar a Godrick.',
    upgrade: { regular: 6, somber: 3 },
    stones: 'Velo Tormentoso está lleno de piedras [1] y [2] en cadáveres de las murallas.',
  },
  {
    id: 'liurnia',
    name: 'Liurnia de los Lagos',
    goal: 'Lágrimas sagradas, campana de minero [1], Academia de Raya Lucaria y Rennala.',
    upgrade: { regular: 9, somber: 4 },
    stones:
      'Entrega la Campana de minero [1] (Túnel de Cristal de Raya Lucaria) a las Doncellas gemelas: [1] y [2] ilimitadas. [3]: minas de Liurnia.',
    farm: 'Si juegas online: misión de Varré (Rose Church) → Medalla de Sangre Pura → Mohgwyn, el mejor farmeo del juego, ya ahora.',
  },
  {
    id: 'caelid',
    name: 'Caelid, Radahn y Nokron',
    goal: 'Medallón de Dectus completo, Radahn, y en Nokron la Lágrima Imitadora y la Piedra afiladora negra.',
    upgrade: { regular: 12, somber: 5 },
    stones:
      'Campana de piedras sombrías [1] (Fallingstar del Túnel de Cristal de Sellia): sombrías [1]-[2] a la venta. [3]-[4] en Nokron.',
    farm: 'Escarabajo dorado (Abandoned Cave, Caelid) + Pata de ave dorada en vinagre (Patches): +20% runas mientras exploras.',
  },
  {
    id: 'altus',
    name: 'Meseta de Altus y Monte Gelmir',
    goal: 'Subir a Altus, campana sombría [2], Mansión del Volcán y Rykard.',
    upgrade: { regular: 15, somber: 6 },
    stones:
      'Campana sombría [2] (Altus Tunnel): sombrías [3]-[4]. Piedras [4]-[5] en Old Altus Tunnel.',
  },
  {
    id: 'leyndell',
    name: 'Leyndell, Capital Real',
    goal: 'Campana de minero [2], la capital, la sombra de Godfrey y Morgott.',
    upgrade: { regular: 18, somber: 7 },
    stones:
      'Campana de minero [2] (Sealed Tunnel): [3]-[4] a la venta. Leyndell tiene [5]-[6] y sombrías [5]-[7].',
  },
  {
    id: 'giants',
    name: 'Cumbres de los Gigantes',
    goal: 'Campanas [3], Gigante de Fuego y la llave del Árbol Hierático.',
    upgrade: { regular: 21, somber: 8 },
    stones:
      'Campana de minero [3] (Ruinas de Zamor): [5]-[6]. Campana sombría [3] (Primera Iglesia de Marika): sombrías [5]-[6].',
    farm: 'Mohgwyn por el portal del Campo Nevado Consagrado: Palace Approach Ledge-Road, ~30-50k runas por vuelta.',
  },
  {
    id: 'endgame',
    name: 'Farum Azula, Árbol Hierático y final',
    goal: 'Campana [4], Maliketh, el contenido opcional final y la Bestia de Elden.',
    upgrade: { regular: 25, somber: 10 },
    stones:
      'Campana de minero [4] (Dúo Piel de Dios): [7]-[8]. Piedras de Dragón Antiguo y sombrías [10] en Farum Azula y el Árbol Hierático.',
  },
  {
    id: 'dlc',
    name: 'Reino de las Sombras (DLC)',
    goal: 'Bendición del Árbol Umbrío alta y los jefes del DLC hasta Radahn, Consorte Prometido.',
    upgrade: { regular: 25, somber: 10 },
    stones:
      'Tu arma ya debería estar al máximo: aquí lo que sube tu daño es la Bendición del Árbol Umbrío.',
    dlc: true,
  },
]
export const CHAPTER_BY_ID = Object.fromEntries(CHAPTERS.map((c) => [c.id, c])) as Record<
  ChapterId,
  Chapter
>
export const CHAPTER_ORDER = CHAPTERS.map((c) => c.id)

const R = (cat: CompendiumCat, name: string): Ref => ({ cat, name })

// ───────── Ruta común ─────────
// Los pasos 'prep' (nivel/mejora/equipo) los genera lib/guide.ts antes de cada jefe.
export const SPINE: GuideStep[] = [
  // ── Preparación ──
  {
    id: 'g-start',
    chapter: 'setup',
    kind: 'route',
    title: 'Sal del Cementerio Varado',
    location: 'stranded-graveyard',
    fight: 'ninguno',
    how: [
      'Tras el tutorial apareces en la Capilla de la Anticipación: déjate matar por el Heraldo Injertado (no hay que ganarle).',
      'En el Cementerio Varado coge el Frasco de Lágrimas Carmesí y sal por la puerta hasta The First Step: actívalo.',
    ],
  },
  {
    id: 'g-torrent',
    chapter: 'setup',
    kind: 'route',
    title: 'Consigue a Torrent',
    location: 'gatefront',
    fight: 'ninguno',
    taskIds: ['torrent', 'map-limgrave-w'],
    how: [
      'Activa los lugares de gracia The First Step, Church of Elleh y Gatefront (sigue el camino hacia el norte; evita al Centinela del Árbol que patrulla junto a Elleh).',
      'Descansa en Gatefront: Melina aparece y te da el Silbato del corcel espectral. A partir de aquí todo es a caballo.',
      'Junto al lugar de gracia de Gatefront está el pilar con el Fragmento de mapa de Necrolimbo oeste.',
    ],
  },
  {
    id: 'g-whetstone',
    chapter: 'setup',
    kind: 'loot',
    title: 'Cuchillo de afilar (sótano de Gatefront)',
    location: 'gatefront',
    fight: 'fácil',
    taskIds: ['whetstone'],
    loot: [R('items', 'Whetstone Knife')],
    how: [
      'En Gatefront Ruins hay soldados de Godrick: entra de noche o atrae a uno y vuelve al lugar de gracia.',
      'El sótano está en el centro de las ruinas: cofre con el Cuchillo de afilar y la Ceniza de guerra Pisotón tormentoso.',
      'Con el cuchillo puedes aplicar Cenizas de guerra y cambiar afinidades en cualquier lugar de gracia: es imprescindible para tu build.',
    ],
  },
  {
    id: 'g-stormhill',
    chapter: 'setup',
    kind: 'loot',
    title: 'Semilla dorada y Roderika (Stormhill)',
    location: 'stormhill-shack',
    fight: 'ninguno',
    taskIds: ['seed-stormhill', 'jellyfish'],
    loot: [R('items', 'Golden Seed'), R('spirits', 'Spirit Jellyfish Ashes')],
    how: [
      'Cruza Stormgate por la izquierda del trol (sin pararte). En el camino, antes de la Choza, hay un arbolito dorado brillante: Semilla dorada.',
      'En la Choza de Stormhill habla con Roderika: te da las Cenizas de la Medusa espiritual.',
      'Úsala en un lugar de gracia: Semilla → +1 uso de frasco.',
    ],
  },
  {
    id: 'g-third-church',
    chapter: 'setup',
    kind: 'loot',
    title: 'Frasco de Lágrimas Mixtas (Tercera Iglesia de Marika)',
    location: 'third-church',
    fight: 'ninguno',
    taskIds: ['physick', 'tear-third'],
    loot: [R('items', 'Flask of Wondrous Physick'), R('items', 'Sacred Tear')],
    how: [
      'Cabalga al noreste de Necrolimbo. Dentro de la iglesia: Frasco de Lágrimas Mixtas, Lágrima de cristal carmesí y una Lágrima sagrada.',
      'Usa la Lágrima sagrada en un lugar de gracia: tus frascos curan más.',
    ],
  },
  {
    id: 'g-tunnels',
    chapter: 'setup',
    kind: 'loot',
    title: 'Piedras de forja: Túneles de Limgrave',
    location: 'limgrave-tunnels',
    fight: 'fácil',
    loot: [
      R('items', 'Smithing Stone [1]'),
      R('items', 'Smithing Stone [2]'),
      R('items', 'Somber Smithing Stone [1]'),
    ],
    how: [
      'Túnel al este de Stormgate. Los mineros son débiles. Golpea las vetas brillantes de las paredes: Piedras de forja [1], una [2] y una sombría [1].',
      'El jefe (Trol excavador) es opcional: no hace falta para salir con las piedras.',
    ],
  },
  {
    id: 'g-bell',
    chapter: 'setup',
    kind: 'npc',
    title: 'Campana de invocación (Renna, de noche)',
    location: 'church-of-elleh',
    fight: 'ninguno',
    taskIds: ['spirit-bell'],
    loot: [R('items', 'Spirit Calling Bell'), R('spirits', 'Lone Wolf Ashes')],
    how: [
      'En un lugar de gracia elige «Pasar el tiempo hasta la noche» y ve a la Iglesia de Elleh: Renna está sentada sobre el muro.',
      'Te da la Campana de invocación y las Cenizas del lobo solitario (invocación útil contra Margit).',
    ],
  },
  {
    id: 'g-trap',
    chapter: 'setup',
    kind: 'route',
    title: 'Atajo a Caelid: cofre trampa de Dragon-Burnt Ruins',
    location: 'dragonburnt-ruins',
    fight: 'ninguno',
    taskIds: ['roundtable'],
    loot: [R('items', 'Stonesword Key')],
    how: [
      'Dragon-Burnt Ruins, al este del Lago Agheel. En la torre del lado oeste hay un cadáver con una Llave de espada de piedra.',
      'Baja al sótano del norte (hay ratas: ignóralas) y abre el cofre: es una trampa que te teletransporta al Túnel de Cristal de Sellia, en Caelid.',
      'No luches contra los mineros de cristal: corre hacia la salida y activa el lugar de gracia del túnel.',
      'Descansar en un lugar de gracia de Caelid (o Liurnia) hace que Melina te lleve a la Mesa Redonda: ya tienes herrero (Hewg) y Doncellas gemelas sin haber pasado a Margit.',
    ],
  },
  {
    id: 'g-greyoll',
    chapter: 'setup',
    kind: 'boss',
    title: 'Dragona anciana Greyoll: 50.000 runas',
    location: 'greyoll',
    fight: 'medio',
    runes: 50000,
    taskIds: ['greyoll'],
    loot: [R('items', 'Dragon Heart')],
    how: [
      'Desde Caelid sube al norte, al Túmulo de Greyoll. Greyoll yace al sur de Fort Faroth: es enorme pero casi no se mueve.',
      'Colócate junto a una de sus patas delanteras y golpea sin parar; aléjate cuando ruja o cuando aparezcan sus crías (dragones pequeños).',
      'Tarda 10-15 minutos a nivel bajo, pero vale la pena: 50.000 runas (del nivel 10 al ~28) y 5 Corazones de dragón.',
      'Si mueres, vuelve a por tus runas: no pierdes el progreso del jefe.',
    ],
  },
  {
    id: 'g-dragoncrest',
    chapter: 'setup',
    kind: 'loot',
    title: 'Talismán Escudo de cresta de dragón',
    location: 'bestial-sanctum',
    fight: 'ninguno',
    optional: true,
    loot: [R('talismans', 'Dragoncrest Shield Talisman')],
    how: [
      'Junto al Santuario Bestial, en el norte del Túmulo. Reduce el daño físico recibido: el mejor talismán defensivo temprano.',
      'Hay saltos que hacen daño: baja con cuidado.',
    ],
  },

  // ── Limgrave ──
  {
    id: 'g-patches',
    chapter: 'limgrave',
    kind: 'npc',
    title: 'Grillete de Margit (Patches)',
    location: 'murkwater-cave',
    fight: 'fácil',
    loot: [R('items', "Margit's Shackle")],
    how: [
      'Cueva del Agua Turbia. Patches te tiende una emboscada: bájale la vida y se rinde (no lo mates).',
      'Cómprale el Grillete de Margit: inmoviliza a Margit dos veces durante el combate. Compra también Patas de ave doradas si te sobran runas.',
    ],
  },
  {
    id: 'g-haight',
    chapter: 'limgrave',
    kind: 'loot',
    title: 'Fort Haight: Medallón de Dectus (izq.) y Semilla',
    location: 'fort-haight',
    fight: 'medio',
    taskIds: ['dectus-left', 'seed-haight'],
    loot: [R('items', 'Dectus Medallion (Left)'), R('items', 'Golden Seed')],
    how: [
      'Semilla dorada en el árbol junto a la entrada.',
      'Dentro, un Caballero de Godrick (sangrado) guarda la torre: el medallón está en el cofre de lo alto.',
    ],
  },
  {
    id: 'g-agheel',
    chapter: 'limgrave',
    kind: 'boss',
    title: 'Dragón volador Agheel',
    location: 'agheel-lake',
    fight: 'medio',
    runes: 5000,
    taskIds: ['agheel'],
    optional: true,
    loot: [R('items', 'Dragon Heart')],
    how: [
      'Aparece al acercarte al lago. Lucha a caballo y golpea sus patas traseras; aléjate cuando vaya a escupir fuego.',
    ],
  },
  {
    id: 'g-weeping',
    chapter: 'limgrave',
    kind: 'loot',
    title: 'Península Llorosa: 3 Lágrimas sagradas',
    location: 'church-pilgrimage',
    fight: 'fácil',
    taskIds: ['tear-callu', 'tear-fourth', 'tear-pilgrimage'],
    how: [
      'Cruza el Puente del Sacrificio hacia el sur.',
      'Lágrimas sagradas en la Iglesia Bautismal de Callu, la Cuarta Iglesia de Marika y la Iglesia del Peregrinaje. Ninguna requiere jefe.',
    ],
  },
  {
    id: 'g-margit',
    chapter: 'limgrave',
    kind: 'boss',
    title: 'Derrotar a Margit, el Augurio Caído',
    location: 'castleward-tunnel',
    fight: 'difícil',
    runes: 12000,
    taskIds: ['margit', 'pouch-margit'],
    how: [
      'Invoca al lobo solitario (o la medusa) al empezar. Usa el Grillete de Margit al inicio de cada fase: queda inmóvil unos segundos.',
      'Ataca tras sus combos largos; no intentes golpear durante sus cadenas de bastón.',
      'Recompensa: Bolsa de talismanes (+1 hueco).',
    ],
  },

  // ── Stormveil ──
  {
    id: 'g-stormveil',
    chapter: 'stormveil',
    kind: 'loot',
    title: 'Explorar Velo Tormentoso',
    location: 'stormveil',
    fight: 'medio',
    taskIds: ['iron-whetblade'],
    loot: [R('items', 'Iron Whetblade'), R('items', 'Golden Seed')],
    how: [
      'Entra por la puerta principal (habla con Gostoc para que la abra) o por el lateral.',
      'Piedra afiladora de hierro: armería junto a la sala del Vástago injertado (1 Llave de espada de piedra). Permite afinidades Pesada, Precisa y Afilada.',
      'Habla con Rogier y Nepheli: más tarde te recompensan.',
    ],
  },
  {
    id: 'g-godrick',
    chapter: 'stormveil',
    kind: 'boss',
    title: 'Derrotar a Godrick el Injertado',
    location: 'stormveil',
    fight: 'difícil',
    runes: 20000,
    taskIds: ['godrick'],
    how: [
      'Usa invocación (Nepheli si está disponible). En la segunda fase su dragón escupe fuego: muévete a su espalda.',
      'Su Gran Runa se activa en la Torre Divina de Limgrave.',
    ],
  },

  // ── Liurnia ──
  {
    id: 'g-liurnia-tears',
    chapter: 'liurnia',
    kind: 'loot',
    title: 'Liurnia: 3 Lágrimas sagradas',
    location: 'church-irith',
    fight: 'fácil',
    taskIds: ['tear-irith', 'tear-inhibition', 'tear-bellum'],
    how: [
      'Iglesia de Irith (sur del lago), Iglesia de la Inhibición (oeste) e Iglesia de Bellum (noreste).',
    ],
  },
  {
    id: 'g-bell1',
    chapter: 'liurnia',
    kind: 'boss',
    title: 'Campana de minero [1]: Túnel de Cristal de Raya Lucaria',
    location: 'raya-crystal-tunnel',
    fight: 'medio',
    taskIds: ['bell-smith-1'],
    loot: [R('items', 'Smithing Stone [1]'), R('items', 'Smithing Stone [2]')],
    how: [
      'Detrás del mausoleo andante del noreste del lago. Al final, un Cristaliano (golpes contundentes le hacen mucho daño).',
      'Entrega la campana a las Doncellas gemelas (Mesa Redonda): piedras [1] y [2] ilimitadas. Esto resuelve tus mejoras hasta +6.',
    ],
  },
  {
    id: 'g-academy-key',
    chapter: 'liurnia',
    kind: 'loot',
    title: 'Llave de brillo de la Academia',
    location: 'smarag',
    fight: 'ninguno',
    taskIds: ['academy-key'],
    loot: [R('items', 'Academy Glintstone Key')],
    how: [
      'Al norte de Temple Quarter, sobre el cadáver junto al dragón Smarag dormido. Acércate andando y cógela sin despertarlo.',
    ],
  },
  {
    id: 'g-raya',
    chapter: 'liurnia',
    kind: 'loot',
    title: 'Academia de Raya Lucaria',
    location: 'raya-lucaria',
    fight: 'medio',
    taskIds: ['glint-whetblade'],
    loot: [R('items', 'Glintstone Whetblade'), R('talismans', 'Radagon Icon')],
    how: [
      'Piedra afiladora de brillo (afinidades Mágica y Fría): habitación al oeste de Debate Parlor.',
      'Icono de Radagon: cofre accesible por los tejados desde Debate Parlor.',
    ],
  },
  {
    id: 'g-tiche',
    chapter: 'liurnia',
    kind: 'boss',
    title: 'Cenizas de Tiche (Prisión eterna del Cabecilla)',
    location: 'ringleaders-evergaol',
    fight: 'difícil',
    taskIds: ['tiche'],
    optional: true,
    loot: [R('spirits', 'Black Knife Tiche')],
    how: [
      'Alecto es rápida y causa sangrado. Vale la pena: Tiche es la mejor invocación hasta la Lágrima Imitadora.',
    ],
  },
  {
    id: 'g-rennala',
    chapter: 'liurnia',
    kind: 'boss',
    title: 'Derrotar a Rennala, Reina de la Luna Llena',
    location: 'raya-lucaria',
    fight: 'medio',
    runes: 40000,
    taskIds: ['rennala'],
    how: [
      'Fase 1: golpea a los estudiantes que brillan en amarillo para romper su escudo. Fase 2: invoca y presiona; esquiva sus hechizos hacia los lados.',
      'Tras vencerla puede redistribuir tus atributos (Larval Tears).',
    ],
  },

  // ── Caelid ──
  {
    id: 'g-dectus-right',
    chapter: 'caelid',
    kind: 'loot',
    title: 'Medallón de Dectus (dcha.) — Fort Faroth',
    location: 'fort-faroth',
    fight: 'fácil',
    taskIds: ['dectus-right'],
    loot: [R('items', 'Dectus Medallion (Right)')],
    how: [
      'Fort Faroth, en el Túmulo de Greyoll. Hay murciélagos: corre hasta el cofre en lo alto de la escalera.',
    ],
  },
  {
    id: 'g-somber-bell1',
    chapter: 'caelid',
    kind: 'boss',
    title: 'Campana sombría [1]: Túnel de Cristal de Sellia',
    location: 'sellia-crystal-tunnel',
    fight: 'medio',
    taskIds: ['bell-somber-1'],
    how: [
      'Vuelve al Túnel de Cristal de Sellia y derrota a la Bestia Estelar Caída al fondo. Las sombrías [1]-[2] quedan a la venta.',
    ],
  },
  {
    id: 'g-plague',
    chapter: 'caelid',
    kind: 'loot',
    title: 'Lágrima sagrada — Iglesia de la Plaga',
    location: 'church-plague',
    fight: 'ninguno',
    taskIds: ['tear-plague'],
    how: ['Al oeste de Sellia.'],
  },
  {
    id: 'g-radahn',
    chapter: 'caelid',
    kind: 'boss',
    title: 'Festival de Radahn',
    location: 'radahn',
    fight: 'difícil',
    runes: 70000,
    taskIds: ['radahn'],
    how: [
      'Habla con Jerren en el Castillo Melenarroja para empezar el festival.',
      'Invoca a TODOS los aliados del campo de batalla; cuando mueran, vuelve a invocarlos. Lucha a caballo.',
    ],
  },
  {
    id: 'g-nokron',
    chapter: 'caelid',
    kind: 'loot',
    title: 'Nokron: Lágrima Imitadora y Piedra afiladora negra',
    location: 'nokron',
    fight: 'medio',
    taskIds: ['mimic', 'black-whetblade'],
    loot: [R('spirits', 'Mimic Tear Ashes'), R('items', 'Black Whetblade')],
    how: [
      'Tras Radahn cae una estrella en Necrolimbo (este): baja por el cráter hasta Nokron.',
      'Lágrima Imitadora: cofre tras una estatua de diablillo (1 llave). Es la mejor invocación del juego: copia tu equipo.',
      "Piedra afiladora negra (Sangre, Veneno, Oculto): Night's Sacred Ground, junto a la Lágrima de plata gigante.",
    ],
  },

  // ── Altus ──
  {
    id: 'g-lift',
    chapter: 'altus',
    kind: 'route',
    title: 'Gran Elevador de Dectus',
    location: 'grand-lift-dectus',
    fight: 'ninguno',
    taskIds: ['altus-access'],
    how: [
      'Con las dos mitades del medallón, usa el elevador del noreste de Liurnia para subir a la Meseta de Altus.',
    ],
  },
  {
    id: 'g-somber-bell2',
    chapter: 'altus',
    kind: 'boss',
    title: 'Campana sombría [2]: Altus Tunnel',
    location: 'altus-tunnel',
    fight: 'medio',
    taskIds: ['bell-somber-2'],
    how: ['Dúo de Cristalianos al final del túnel. Sombrías [3]-[4] a la venta.'],
  },
  {
    id: 'g-altus-tears',
    chapter: 'altus',
    kind: 'loot',
    title: 'Altus: 2 Lágrimas sagradas',
    location: 'second-church',
    fight: 'fácil',
    taskIds: ['tear-second', 'tear-stormcaller'],
    how: ['Segunda Iglesia de Marika e Iglesia del Clamatormentas.'],
  },
  {
    id: 'g-rykard',
    chapter: 'altus',
    kind: 'boss',
    title: 'Mansión del Volcán y Rykard',
    location: 'rykard',
    fight: 'medio',
    runes: 130000,
    taskIds: ['rykard'],
    how: [
      'Antes del jefe encontrarás la Espada Serpiente-cazadora: equípala para Rykard (hace muchísimo daño contra él).',
      'Remembranza de Rykard → Enia: Hoja Blasfema (o guárdala).',
    ],
  },

  // ── Leyndell ──
  {
    id: 'g-bell2',
    chapter: 'leyndell',
    kind: 'boss',
    title: 'Campana de minero [2]: Sealed Tunnel',
    location: 'sealed-tunnel',
    fight: 'medio',
    taskIds: ['bell-smith-2'],
    how: ['Al sur del lago de Capital Outskirts. Piedras [3]-[4] a la venta.'],
  },
  {
    id: 'g-godfrey-shade',
    chapter: 'leyndell',
    kind: 'boss',
    title: 'Sombra de Godfrey',
    location: 'godfrey-shade',
    fight: 'medio',
    taskIds: ['pouch-godfrey'],
    how: [
      'Tras el Avatar dorado del árbol, en Erdtree Sanctuary: Bolsa de talismanes (4.º hueco).',
    ],
  },
  {
    id: 'g-morgott',
    chapter: 'leyndell',
    kind: 'boss',
    title: 'Derrotar a Morgott, el Rey Augurio',
    location: 'morgott',
    fight: 'difícil',
    runes: 120000,
    taskIds: ['morgott', 'rold'],
    how: [
      'Invoca a Melina si está disponible. Esquiva hacia sus ataques (no hacia atrás). Tras vencerlo, descansa en la gracia: Melina te da el Medallón de Rold.',
    ],
  },

  // ── Cumbres ──
  {
    id: 'g-bell3',
    chapter: 'giants',
    kind: 'loot',
    title: 'Campanas [3]: Ruinas de Zamor y Primera Iglesia de Marika',
    location: 'zamor-ruins',
    fight: 'fácil',
    taskIds: ['bell-smith-3', 'bell-somber-3'],
    how: [
      'Campana de minero [3] en el sótano de las Ruinas de Zamor.',
      'Campana sombría [3] en un cadáver junto a la Primera Iglesia de Marika.',
    ],
  },
  {
    id: 'g-repose',
    chapter: 'giants',
    kind: 'loot',
    title: 'Lágrima sagrada — Iglesia del Reposo',
    location: 'church-repose',
    fight: 'ninguno',
    taskIds: ['tear-repose'],
    how: ['Al este de las Cumbres.'],
  },
  {
    id: 'g-sol',
    chapter: 'giants',
    kind: 'boss',
    title: 'Castillo Sol: medallón secreto (izq.)',
    location: 'castle-sol',
    fight: 'difícil',
    taskIds: ['haligtree-left'],
    optional: true,
    how: [
      'Comandante Niall. Junto con la mitad del Viejo Albus (Liurnia) abre el camino al Árbol Hierático.',
    ],
  },
  {
    id: 'g-fire-giant',
    chapter: 'giants',
    kind: 'boss',
    title: 'Derrotar al Gigante de Fuego',
    location: 'fire-giant',
    fight: 'difícil',
    runes: 180000,
    taskIds: ['fire-giant'],
    how: [
      'Fase 1: a caballo, golpea su pie izquierdo (el del grillete). Fase 2: aléjate de sus barridos de fuego y castiga sus golpes al suelo.',
    ],
  },

  // ── Final ──
  {
    id: 'g-farum',
    chapter: 'endgame',
    kind: 'boss',
    title: 'Farum Azula: Dúo Piel de Dios y campana [4]',
    location: 'farum-azula',
    fight: 'difícil',
    taskIds: ['farum', 'bell-smith-4'],
    how: [
      'Antes de viajar, termina las misiones pendientes: la Forja de los Gigantes cambia el mundo.',
      'Dúo Piel de Dios: separa a los dos; su vida es compartida.',
    ],
  },
  {
    id: 'g-maliketh',
    chapter: 'endgame',
    kind: 'boss',
    title: 'Derrotar a Maliketh, la Hoja Negra',
    location: 'maliketh',
    fight: 'difícil',
    taskIds: ['maliketh'],
    how: ['Sus heridas reducen tu vida máxima temporalmente: esquiva sus saltos hacia delante.'],
  },
  {
    id: 'g-mohg',
    chapter: 'endgame',
    kind: 'boss',
    title: 'Mohgwyn: farmeo y Mohg',
    location: 'mohgwyn-palace',
    fight: 'difícil',
    taskIds: ['mohg'],
    optional: true,
    how: [
      'Desde Palace Approach Ledge-Road, deslízate por la izquierda: cada vuelta matando albinaúricos da 30-50k runas.',
      'Mohg: usa la Purifying Crystal Tear contra su maldición de sangre.',
    ],
  },
  {
    id: 'g-final',
    chapter: 'endgame',
    kind: 'boss',
    title: 'Hoarah Loux, Radagon y la Bestia de Elden',
    location: 'leyndell',
    fight: 'difícil',
    taskIds: ['elden-beast'],
    how: [
      'Godfrey/Hoarah Loux en la capital ceniza, después Radagon y la Bestia de Elden. La Bestia es inmune al sangrado y resiste lo sagrado.',
    ],
  },

  // ── DLC ──
  {
    id: 'g-dlc-enter',
    chapter: 'dlc',
    kind: 'route',
    title: 'Entrar en el Reino de las Sombras',
    location: 'mohg',
    fight: 'ninguno',
    taskIds: ['dlc-enter'],
    how: [
      'Requiere haber derrotado a Mohg y a Radahn. Toca el brazo de Miquella en el capullo tras la arena de Mohg.',
    ],
  },
  {
    id: 'g-dlc-blessing',
    chapter: 'dlc',
    kind: 'farm',
    title: 'Primera ronda de Fragmentos del Árbol Umbrío',
    location: 'sote-three-path',
    fight: 'fácil',
    taskIds: ['scadu-consolation', 'scadu-three-path', 'scadu-scorched', 'revered-belurat'],
    how: [
      'Cada Cruz de Miquella tiene un fragmento: Iglesia del Consuelo (×2), Three-Path Cross y Scorched Ruins.',
      'Úsalos en un lugar de gracia («Bendición del Árbol Umbrío»). Objetivo antes del León Danzante: +4 y espíritus +3.',
    ],
  },
  {
    id: 'g-dlc-lion',
    chapter: 'dlc',
    kind: 'boss',
    title: 'Bestia Divina León Danzante (Belurat)',
    location: 'sote-lion',
    fight: 'difícil',
    taskIds: ['dlc-lion'],
    how: ['Recoge las 4 Cenizas veneradas de Belurat antes del jefe.'],
  },
  {
    id: 'g-dlc-rellana',
    chapter: 'dlc',
    kind: 'boss',
    title: 'Rellana, Caballero de las Lunas Gemelas',
    location: 'sote-rellana',
    fight: 'difícil',
    taskIds: ['dlc-rellana'],
    how: ['Bendición recomendada +7.'],
  },
  {
    id: 'g-dlc-messmer',
    chapter: 'dlc',
    kind: 'boss',
    title: 'Messmer el Empalador',
    location: 'sote-messmer',
    fight: 'difícil',
    taskIds: ['dlc-messmer', 'scadu-crosses', 'revered-keep'],
    how: ['Bendición recomendada +12. Resiste el fuego: lleva protección contra fuego.'],
  },
  {
    id: 'g-dlc-romina',
    chapter: 'dlc',
    kind: 'boss',
    title: 'Romina, Santa del Brote',
    location: 'sote-romina',
    fight: 'difícil',
    taskIds: ['dlc-romina', 'revered-rauh'],
    how: [
      'Lleva resistencia a la podredumbre escarlata. Después quema el Árbol Sellado con la Yesca de Messmer.',
    ],
  },
  {
    id: 'g-dlc-radahn',
    chapter: 'dlc',
    kind: 'boss',
    title: 'Radahn, Consorte Prometido',
    location: 'sote-radahn',
    fight: 'difícil',
    taskIds: ['dlc-radahn', 'revered-enir'],
    how: ['Bendición +16-20. Talismanes defensivos y la mejor invocación disponible.'],
  },
]

// ───────── Planes por build ─────────
export interface Loadout {
  weapon: Ref
  stone: 'smithing' | 'somber'
  affinity?: string
  ash?: Ref
  twoHand?: boolean
  offhand?: Ref
  catalyst?: Ref
  catalystStone?: 'smithing' | 'somber'
  /** Mejorar el catalizador (no si solo lanza buffs que no escalan) */
  upgradeCatalyst?: boolean
  spells?: Ref[]
  talismans?: Ref[]
  spirit?: Ref
  tear?: Ref[]
  why?: string
}

export interface BuildPlan {
  classId: string
  keepsake: string
  start: string[]
  /** Pasos propios. slot: dónde insertarlos dentro del capítulo. */
  steps: (GuideStep & { slot?: 'start' | 'beforeTrap' | 'afterTrap' | 'beforeBoss' | 'end' })[]
  /** Atributos objetivo al final de cada capítulo (antes del jefe) */
  levels: Partial<Record<ChapterId, Partial<Stats>>>
  /** Equipo: cada entrada sobreescribe al anterior desde ese capítulo */
  loadouts: Partial<Record<ChapterId, Partial<Loadout>>>
}

const W = (n: string) => R('weapons', n)
const T = (n: string) => R('talismans', n)
const I = (n: string) => R('incantations', n)
const S = (n: string) => R('sorceries', n)
const A = (n: string) => R('ashes', n)
const SP = (n: string) => R('spirits', n)
const IT = (n: string) => R('items', n)

export const BUILD_PLANS: Record<string, BuildPlan> = {
  // ─────────────────────────────── PALADÍN ÁUREO ───────────────────────────────
  'golden-paladin': {
    classId: 'confessor',
    keepsake: 'Semilla dorada',
    start: [
      'Clase: Confesor (Fe 14, Fuerza 12, empieza con Sello de dedo). Recuerdo: Semilla dorada (+1 frasco desde el minuto 1).',
      'La idea: espadón con afinidad Sagrada (escala con Fuerza y Fe) + el buff «Llama, dame fuerza». Más adelante, la Hoja Blasfema.',
    ],
    steps: [
      {
        id: 'pal-lordsworn',
        chapter: 'setup',
        slot: 'start',
        kind: 'loot',
        title: "Espadón del Juramentado (Lordsworn's Greatsword)",
        location: 'gatefront',
        fight: 'ninguno',
        loot: [W("Lordsworn's Greatsword")],
        how: [
          'En Gatefront Ruins, en el carruaje negro más cercano al lugar de gracia (lado oeste). Llega por el oeste y ábrelo sin que te vean.',
          'Pide FUE 16: con tu Fuerza 12 ya puedes usarlo a dos manos (cuenta ×1,5 = 18). Lo llevarás todo el juego base hasta la Hoja Blasfema.',
        ],
      },
      {
        id: 'pal-sacred-blade',
        chapter: 'setup',
        slot: 'beforeTrap',
        kind: 'loot',
        title: 'Ceniza de guerra: Hoja Sagrada',
        location: 'sacred-blade-scarab',
        fight: 'fácil',
        loot: [A('Ash of War: Sacred Blade')],
        how: [
          'Colina al noroeste de la Tercera Iglesia de Marika, pasado el estanque: un escarabajo brillante. Mátalo a caballo.',
          'En un lugar de gracia → Cenizas de guerra → aplícala al Espadón del Juramentado: afinidad Sagrada (Fuerza + Fe) y un proyectil sagrado a distancia.',
        ],
      },
      {
        id: 'pal-fgms',
        chapter: 'setup',
        slot: 'afterTrap',
        kind: 'loot',
        title: 'Conjuro «Llama, dame fuerza» (Fort Gael)',
        location: 'fort-gael',
        fight: 'ninguno',
        taskIds: ['golden-paladin:flame-grant-me-strength'],
        loot: [I('Flame, Grant Me Strength')],
        how: [
          'Desde el Túnel de Sellia cabalga al oeste hasta Fort Gael. El cadáver está fuera de la muralla, en el lado este.',
          'Dos Carros de llamas recorren ese pasillo: espera a que pasen, coge el conjuro y sal. No hace falta entrar al fuerte.',
          'Pide Fe 15: lo tendrás tras subir de nivel. +20% de daño físico y de fuego durante 30 s.',
        ],
      },
      {
        id: 'pal-golden-vow',
        chapter: 'limgrave',
        slot: 'start',
        kind: 'boss',
        title: 'Ceniza de guerra: Voto Áureo',
        location: 'golden-vow-knight',
        fight: 'medio',
        optional: true,
        loot: [A('Ashes of War: Golden Vow')],
        how: [
          'Caballero de Godrick a caballo en la colina al noreste de la Choza del Maestro de Guerra (Stormhill).',
          'Más adelante puedes ponérsela a un arma secundaria; el conjuro Voto Áureo (Gelmir) es mejor a largo plazo.',
        ],
      },
      {
        id: 'pal-heirloom',
        chapter: 'liurnia',
        slot: 'start',
        kind: 'loot',
        title: 'Herencia de los Dos Dedos (+5 Fe)',
        location: 'purified-ruins',
        fight: 'ninguno',
        loot: [T('Two Fingers Heirloom')],
        how: [
          'Purified Ruins, nada más entrar en Liurnia. Rueda sobre las tablas de madera del suelo para abrir la escalera al sótano: cofre con el talismán.',
        ],
      },
      {
        id: 'pal-blasphemous',
        chapter: 'leyndell',
        slot: 'start',
        kind: 'npc',
        title: 'Hoja Blasfema (Enia)',
        location: 'rykard',
        fight: 'ninguno',
        taskIds: ['golden-paladin:blasphemous-blade'],
        loot: [W('Blasphemous Blade')],
        how: [
          'En la Mesa Redonda, cambia la Remembranza de Rykard a Enia por la Hoja Blasfema.',
          'Pide FUE 22, DES 15, FE 21. Su habilidad (Llama del Tomador) te cura al matar enemigos y escala con Fe. Se mejora con piedras sombrías.',
        ],
      },
    ],
    levels: {
      setup: { vig: 20, str: 16, fai: 18 },
      limgrave: { vig: 22, end: 12, str: 16, fai: 20 },
      stormveil: { vig: 25, end: 14, str: 18, fai: 20 },
      liurnia: { vig: 30, end: 16, str: 18, fai: 25 },
      caelid: { vig: 35, end: 18, str: 20, dex: 15, fai: 28 },
      altus: { vig: 40, end: 20, str: 22, dex: 15, fai: 32 },
      leyndell: { vig: 45, min: 15, end: 22, str: 25, dex: 15, fai: 40 },
      giants: { vig: 50, min: 18, end: 25, str: 28, dex: 15, fai: 45 },
      endgame: { vig: 55, min: 20, end: 28, str: 30, dex: 15, fai: 55 },
      dlc: { vig: 60, min: 22, end: 30, str: 34, dex: 15, fai: 60 },
    },
    loadouts: {
      setup: {
        weapon: W("Lordsworn's Greatsword"),
        stone: 'smithing',
        affinity: 'Sagrada',
        ash: A('Ash of War: Sacred Blade'),
        twoHand: true,
        catalyst: W('Finger Seal'),
        catalystStone: 'smithing',
        upgradeCatalyst: false,
        spells: [I('Flame, Grant Me Strength')],
        talismans: [T('Dragoncrest Shield Talisman')],
        spirit: SP('Lone Wolf Ashes'),
        why: 'A dos manos hasta tener FUE 16. Lanza «Llama, dame fuerza» con el Sello de dedo antes de cada jefe.',
      },
      stormveil: {
        talismans: [T('Dragoncrest Shield Talisman'), T('Claw Talisman')],
        why: 'Talismán de la garra: +15% a los ataques en salto, el mejor golpe del espadón.',
      },
      liurnia: {
        twoHand: false,
        talismans: [T('Two Fingers Heirloom'), T('Claw Talisman')],
        spirit: SP('Black Knife Tiche'),
        why: 'Con FUE 16 ya puedes llevar escudo en la izquierda si lo prefieres.',
      },
      caelid: {
        spirit: SP('Mimic Tear Ashes'),
        talismans: [
          T('Two Fingers Heirloom'),
          T('Claw Talisman'),
          T('Dragoncrest Shield Talisman'),
        ],
      },
      altus: {
        spells: [I('Flame, Grant Me Strength'), I('Golden Vow')],
        why: 'Voto Áureo (Choza del Hedor a Cadáver, Gelmir): +15% ataque y +10% defensa. Encadénalo con «Llama, dame fuerza».',
      },
      leyndell: {
        weapon: W('Blasphemous Blade'),
        stone: 'somber',
        affinity: undefined,
        ash: undefined,
        twoHand: true,
        why: 'Cambia a la Hoja Blasfema: mantén el Espadón del Juramentado como respaldo contra enemigos que resisten el fuego.',
      },
      endgame: {
        talismans: [
          T('Shard of Alexander'),
          T('Two Fingers Heirloom'),
          T('Claw Talisman'),
          T('Dragoncrest Shield Talisman'),
        ],
      },
      dlc: {
        talismans: [
          T('Shard of Alexander'),
          T('Two Fingers Heirloom'),
          T('Two-Handed Sword Talisman'),
          T('Dragoncrest Shield Talisman'),
        ],
      },
    },
  },

  // ─────────────────────────────── SEÑOR DE LA SANGRE ───────────────────────────────
  'blood-arcane': {
    classId: 'samurai',
    keepsake: 'Semilla dorada',
    start: [
      'Clase: Samurái (Uchigatana y buen Vigor desde el principio). Recuerdo: Semilla dorada.',
      'La idea: armas de sangrado con afinidad de Sangre (escala con Arcano). Cada estallido de sangrado quita un % de la vida máxima del enemigo.',
    ],
    steps: [
      {
        id: 'bl-slash',
        chapter: 'setup',
        slot: 'beforeTrap',
        kind: 'boss',
        title: 'Ceniza de guerra: Tajo Sangriento (Fort Haight)',
        location: 'fort-haight',
        fight: 'medio',
        taskIds: ['dectus-left', 'seed-haight'],
        loot: [A('Ash of War: Bloody Slash'), IT('Dectus Medallion (Left)')],
        how: [
          'En Fort Haight, el Caballero de Godrick que custodia la torre la suelta. Ya que estás: Semilla dorada en la entrada y Medallón de Dectus en el cofre de la torre.',
          'En un lugar de gracia aplícala a la Uchigatana: afinidad Sangre (el Arcano sube daño y sangrado).',
        ],
      },
      {
        id: 'bl-reduvia',
        chapter: 'setup',
        slot: 'beforeTrap',
        kind: 'boss',
        title: 'Reduvia: mata a Nerijus',
        location: 'murkwater-cave',
        fight: 'medio',
        optional: true,
        loot: [W('Reduvia')],
        how: [
          'Junto a la Cueva del Agua Turbia te invade Nerijus, Dedo Sangriento. Desaparece si matas a todos los jefes de Necrolimbo: hazlo ahora.',
          'La Reduvia lanza proyectiles de sangre con su habilidad (Arcano 13).',
        ],
      },
      {
        id: 'bl-insignia',
        chapter: 'liurnia',
        slot: 'start',
        kind: 'boss',
        title: 'Insignia de la espada alada (Cueva Aguaquieta)',
        location: 'stillwater-cave',
        fight: 'medio',
        loot: [T('Winged Sword Insignia')],
        how: [
          'Jefe: Caballero de la Podredumbre Limpia. Lleva bolos de podredumbre o cura. El talismán sube tu ataque al encadenar golpes.',
        ],
      },
      {
        id: 'bl-exultation',
        chapter: 'leyndell',
        slot: 'start',
        kind: 'boss',
        title: 'Exultación del Señor de la Sangre',
        location: 'leyndell-catacombs',
        fight: 'difícil',
        loot: [T("Lord of Blood's Exultation")],
        how: [
          'Esgar, Sacerdote de la Sangre, en las Catacumbas de Leyndell (cloacas). +20% de ataque cuando hay sangrado cerca: con tu build, casi siempre activo.',
        ],
      },
      {
        id: 'bl-rivers',
        chapter: 'giants',
        slot: 'start',
        kind: 'boss',
        title: 'Ríos de Sangre (Okina)',
        location: 'church-repose',
        fight: 'difícil',
        taskIds: ['blood-arcane:rivers-of-blood'],
        loot: [W('Rivers of Blood')],
        how: [
          'De noche, en la Iglesia del Reposo, te invade Okina. Esquiva su habilidad hacia los lados. Pide FUE 12, DES 18, ARC 20.',
        ],
      },
      {
        id: 'bl-seppuku',
        chapter: 'giants',
        slot: 'start',
        kind: 'loot',
        title: 'Ceniza de guerra: Seppuku',
        location: 'frozen-lake',
        fight: 'fácil',
        loot: [A('Ash of War: Seppuku')],
        how: [
          'Escarabajo invisible al norte del Lago Helado. Pónsela a la Uchigatana como arma secundaria: buff de sangrado enorme.',
        ],
      },
    ],
    levels: {
      setup: { vig: 18, end: 13, str: 12, dex: 15, arc: 20 },
      limgrave: { vig: 22, end: 13, dex: 15, arc: 23 },
      stormveil: { vig: 25, end: 14, dex: 15, arc: 28 },
      liurnia: { vig: 30, end: 16, dex: 18, arc: 35 },
      caelid: { vig: 35, end: 18, dex: 18, arc: 42 },
      altus: { vig: 40, end: 20, dex: 18, arc: 50 },
      leyndell: { vig: 45, min: 12, end: 22, dex: 18, arc: 58 },
      giants: { vig: 50, min: 15, end: 25, dex: 20, arc: 65 },
      endgame: { vig: 55, min: 18, end: 28, dex: 25, arc: 75 },
      dlc: { vig: 60, min: 20, end: 30, dex: 30, arc: 80 },
    },
    loadouts: {
      setup: {
        weapon: W('Uchigatana'),
        stone: 'smithing',
        affinity: 'Sangre',
        ash: A('Ash of War: Bloody Slash'),
        offhand: W('Reduvia'),
        talismans: [T('Dragoncrest Shield Talisman')],
        spirit: SP('Lone Wolf Ashes'),
        why: 'Uchigatana de Sangre a una mano, Reduvia en la izquierda para su proyectil.',
      },
      liurnia: {
        talismans: [T('Winged Sword Insignia'), T('Dragoncrest Shield Talisman')],
        spirit: SP('Black Knife Tiche'),
      },
      caelid: {
        spirit: SP('Mimic Tear Ashes'),
        why: 'Con la Piedra afiladora negra puedes dar afinidad Sangre a cualquier arma.',
      },
      leyndell: {
        talismans: [
          T("Lord of Blood's Exultation"),
          T('Winged Sword Insignia'),
          T('Dragoncrest Shield Talisman'),
        ],
      },
      giants: {
        weapon: W('Rivers of Blood'),
        stone: 'somber',
        affinity: undefined,
        ash: undefined,
        twoHand: true,
        offhand: W('Uchigatana'),
        why: 'Ríos de Sangre a dos manos. La Uchigatana con Seppuku de secundaria para el buff.',
      },
      endgame: {
        talismans: [
          T("Lord of Blood's Exultation"),
          T('Shard of Alexander'),
          T('Winged Sword Insignia'),
          T('Dragoncrest Shield Talisman'),
        ],
      },
      dlc: {
        talismans: [
          T("Lord of Blood's Exultation"),
          T('Shard of Alexander'),
          T('Outer God Heirloom'),
          T('Winged Sword Insignia'),
        ],
      },
    },
  },

  // ─────────────────────────────── COMUNIÓN DRACÓNICA ───────────────────────────────
  'dragon-communion': {
    classId: 'confessor',
    keepsake: 'Llave de espada de piedra',
    start: [
      'Clase: Confesor. Recuerdo: Llave de espada de piedra (con la de Dragon-Burnt Ruins tendrás las 2 que abren la Tumba del Héroe Marginado).',
      'La idea: aprender alientos de dragón con Corazones de dragón y lanzarlos con el Sello de Comunión Dracónica (escala con Arcano).',
    ],
    steps: [
      {
        id: 'dr-seal',
        chapter: 'setup',
        slot: 'end',
        kind: 'boss',
        title: 'Sello de Comunión Dracónica (Tumba del Héroe Marginado)',
        location: 'fringefolk-grave',
        fight: 'medio',
        taskIds: ['erdtree-favor'],
        loot: [W('Dragon Communion Seal'), T("Erdtree's Favor")],
        how: [
          'Junto al Cementerio Varado: usa las 2 Llaves de espada de piedra en la estatua de diablillo.',
          'Baja dos rampas y sube por la derecha: un Caballero desterrado espectral suelta el Sello. En el altar del fondo, el Favor del Árbol Áureo.',
        ],
      },
      {
        id: 'dr-fire',
        chapter: 'setup',
        slot: 'end',
        kind: 'loot',
        title: 'Aprende Fuego de dragón y Garra de dragón',
        location: 'church-dragon-communion',
        fight: 'fácil',
        loot: [I('Dragonfire'), I('Dragonclaw')],
        how: [
          'Con los 5 corazones de Greyoll: ve a la Cueva Costera (suroeste de Necrolimbo), atraviésala y llega al islote de la Iglesia de Comunión Dracónica.',
          'Fuego de dragón (1 corazón) y Garra de dragón (1 corazón). Guarda el resto para la Catedral de Caelid.',
        ],
      },
      {
        id: 'dr-cathedral',
        chapter: 'caelid',
        slot: 'start',
        kind: 'loot',
        title: 'Catedral de Comunión Dracónica (Caelid)',
        location: 'cathedral-dragon-communion',
        fight: 'fácil',
        loot: [I("Ekzykes's Decay"), I("Agheel's Flame")],
        how: [
          'Mata a Ekzykes (Caelid) y a Agheel para desbloquear sus alientos. La Podredumbre de Ekzykes (2 corazones) es de lo mejor del juego.',
        ],
      },
      {
        id: 'dr-borealis',
        chapter: 'giants',
        slot: 'start',
        kind: 'boss',
        title: 'Borealis, la Niebla Helada',
        location: 'frozen-lake',
        fight: 'difícil',
        loot: [I("Borealis's Mist")],
        how: ['Dragón del Lago Helado. Su aliento se aprende en la Catedral por 2 corazones.'],
      },
    ],
    levels: {
      setup: { vig: 18, min: 15, fai: 15, arc: 15 },
      limgrave: { vig: 20, min: 16, fai: 17, arc: 16 },
      stormveil: { vig: 24, min: 18, fai: 18, arc: 18 },
      liurnia: { vig: 30, min: 20, end: 12, fai: 23, arc: 22 },
      caelid: { vig: 35, min: 22, end: 14, fai: 23, arc: 30 },
      altus: { vig: 40, min: 25, end: 15, fai: 25, arc: 38 },
      leyndell: { vig: 42, min: 26, end: 15, fai: 27, arc: 44 },
      giants: { vig: 50, min: 28, end: 16, fai: 30, arc: 50 },
      endgame: { vig: 55, min: 30, end: 18, fai: 36, arc: 60 },
      dlc: { vig: 60, min: 32, end: 20, fai: 38, arc: 70 },
    },
    loadouts: {
      setup: {
        weapon: W('Dragon Communion Seal'),
        stone: 'somber',
        offhand: W('Broadsword'),
        spells: [I('Dragonfire'), I('Dragonclaw')],
        talismans: [T("Erdtree's Favor")],
        spirit: SP('Lone Wolf Ashes'),
        why: 'El sello es tu arma principal: súbelo con piedras sombrías. La espada ancha para rematar.',
      },
      liurnia: {
        talismans: [T('Radagon Icon'), T("Erdtree's Favor")],
        spirit: SP('Black Knife Tiche'),
      },
      caelid: {
        spells: [I("Ekzykes's Decay"), I('Dragonfire'), I('Dragonclaw'), I("Agheel's Flame")],
        spirit: SP('Mimic Tear Ashes'),
      },
      altus: { talismans: [T('Radagon Icon'), T("Erdtree's Favor"), T('Godfrey Icon')] },
      giants: {
        spells: [I("Ekzykes's Decay"), I("Borealis's Mist"), I('Dragonclaw'), I("Agheel's Flame")],
      },
      endgame: {
        talismans: [
          T("Flock's Canvas Talisman"),
          T('Radagon Icon'),
          T('Godfrey Icon'),
          T("Erdtree's Favor"),
        ],
      },
      dlc: {
        spells: [
          I("Ekzykes's Decay"),
          I("Bayle's Tyranny"),
          I('Ghostflame Breath'),
          I('Dragonclaw'),
        ],
      },
    },
  },

  // ─────────────────────────────── ASTRÓLOGO DEL COMETA ───────────────────────────────
  'comet-sorcerer': {
    classId: 'astrologer',
    keepsake: 'Semilla dorada',
    start: [
      'Clase: Astrólogo (Int 16, Mente 15). Recuerdo: Semilla dorada.',
      'La idea: el Bastón meteórico (escalado S) te lleva todo el juego temprano; Cometa de Azur para el final.',
    ],
    steps: [
      {
        id: 'int-scroll',
        chapter: 'setup',
        slot: 'beforeTrap',
        kind: 'loot',
        title: 'Pergamino de la Casa Real',
        location: 'royal-house-scroll',
        fight: 'fácil',
        taskIds: ['royal-scroll'],
        loot: [IT('Royal House Scroll')],
        how: [
          'Al este de Agheel Lake South, junto a un Hechicero noble que defiende un campamento. Mátalo con Guijarros de brillo desde lejos.',
        ],
      },
      {
        id: 'int-sellen',
        chapter: 'setup',
        slot: 'beforeTrap',
        kind: 'npc',
        title: 'Hechicera Sellen (Waypoint Ruins)',
        location: 'waypoint-ruins',
        fight: 'medio',
        loot: [S('Glintstone Pebble'), S('Carian Slicer')],
        how: [
          'El sótano de Waypoint Ruins lo guarda la Calabaza Loca: atráela fuera y esquiva hacia los lados. Dentro está Sellen.',
          'Dale el Pergamino de la Casa Real y compra Tajador cariano.',
        ],
      },
      {
        id: 'int-meteor',
        chapter: 'setup',
        slot: 'afterTrap',
        kind: 'loot',
        title: 'Bastón meteórico y Honda de roca',
        location: 'street-of-sages',
        fight: 'ninguno',
        taskIds: ['comet-sorcerer:meteorite-staff', 'comet-sorcerer:rock-sling'],
        loot: [W('Meteorite Staff'), S('Rock Sling')],
        how: [
          'Street of Sages Ruins, en el noroeste del Pantano de Aeonia (Caelid). Cabalga sin bajar del caballo: la podredumbre del pantano hace daño.',
          'Bastón: torre rota del suroeste de las ruinas. Honda de roca: cofre del sótano.',
          'Pide Int 18. Honda de roca rompe posturas y el bastón potencia la gravedad.',
        ],
      },
      {
        id: 'int-azur',
        chapter: 'giants',
        slot: 'start',
        kind: 'loot',
        title: 'Cometa de Azur y Lágrima oculta cerúlea',
        location: 'hermit-village',
        fight: 'medio',
        loot: [S('Comet Azur'), IT('Cerulean Hidden Tear')],
        how: [
          'Cometa de Azur: interactúa con el Hechicero primigenio Azur, al sureste de la Aldea Ermitaña (Monte Gelmir). Pide Int 60.',
          'Lágrima oculta cerúlea: Espíritu de árbol ulcerado del Árbol Menor de Gelmir. Ponla en el frasco mixto: 15 s de PC infinitos.',
        ],
      },
    ],
    levels: {
      setup: { vig: 18, min: 16, int: 28 },
      limgrave: { vig: 20, min: 18, int: 30 },
      stormveil: { vig: 24, min: 20, int: 34 },
      liurnia: { vig: 30, min: 24, end: 11, int: 40 },
      caelid: { vig: 35, min: 28, end: 12, int: 45 },
      altus: { vig: 40, min: 30, end: 14, int: 52 },
      leyndell: { vig: 45, min: 33, end: 15, str: 10, int: 56 },
      giants: { vig: 50, min: 38, end: 16, str: 10, int: 60 },
      endgame: { vig: 55, min: 40, end: 18, str: 10, int: 70 },
      dlc: { vig: 60, min: 42, end: 20, str: 10, int: 80 },
    },
    loadouts: {
      setup: {
        weapon: W('Meteorite Staff'),
        stone: 'somber',
        spells: [S('Rock Sling'), S('Glintstone Pebble'), S('Carian Slicer')],
        talismans: [T('Dragoncrest Shield Talisman')],
        spirit: SP('Lone Wolf Ashes'),
        why: 'Honda de roca para jefes, Guijarro para enemigos comunes.',
      },
      liurnia: {
        spells: [
          S('Rock Sling'),
          S("Loretta's Greatbow"),
          S('Glintstone Pebble'),
          S('Carian Slicer'),
        ],
        talismans: [T('Radagon Icon'), T('Cerulean Amber Medallion')],
        spirit: SP('Black Knife Tiche'),
      },
      caelid: {
        spirit: SP('Mimic Tear Ashes'),
        talismans: [T('Radagon Icon'), T('Cerulean Amber Medallion'), T('Magic Scorpion Charm')],
      },
      altus: { talismans: [T('Radagon Icon'), T('Godfrey Icon'), T('Magic Scorpion Charm')] },
      leyndell: {
        weapon: W("Lusat's Glintstone Staff"),
        stone: 'somber',
        why: 'Bastón de Lusat (Sellia): más daño a cambio de más PC. Pide FUE 10, INT 52.',
      },
      giants: {
        spells: [S('Comet Azur'), S('Rock Sling'), S("Loretta's Greatbow"), S('Terra Magica')],
        tear: [IT('Cerulean Hidden Tear')],
      },
      endgame: {
        talismans: [
          T('Graven-Mass Talisman'),
          T('Godfrey Icon'),
          T('Magic Scorpion Charm'),
          T('Radagon Icon'),
        ],
      },
      dlc: {
        spells: [
          S('Comet Azur'),
          S("Rellana's Twin Moons"),
          S('Glintstone Nails'),
          S('Rock Sling'),
        ],
      },
    },
  },

  // ─────────────────────────────── CABALLERO LUNAR ───────────────────────────────
  'moon-knight': {
    classId: 'prisoner',
    keepsake: 'Semilla dorada',
    start: [
      'Clase: Prisionero (Int 14, Des 14). Recuerdo: Semilla dorada.',
      'La idea: Velo Lunar (katana mágica) desde el inicio y el Mandoble de la Luna Oscura al final.',
    ],
    steps: [
      {
        id: 'mk-scroll',
        chapter: 'setup',
        slot: 'beforeTrap',
        kind: 'loot',
        title: 'Pergamino de la Casa Real → Tajador cariano',
        location: 'royal-house-scroll',
        fight: 'fácil',
        taskIds: ['royal-scroll'],
        loot: [IT('Royal House Scroll'), S('Carian Slicer')],
        how: [
          'Al este de Agheel Lake South (Hechicero noble). Dáselo a Sellen (sótano de Waypoint Ruins, tras la Calabaza Loca) y compra Tajador cariano.',
        ],
      },
      {
        id: 'mk-moonveil',
        chapter: 'limgrave',
        slot: 'start',
        kind: 'boss',
        title: 'Velo Lunar (Túnel de Gael)',
        location: 'gael-tunnel',
        fight: 'medio',
        taskIds: ['moon-knight:moonveil'],
        loot: [W('Moonveil')],
        how: [
          'Entrada del Túnel de Gael en Caelid, cerca de Fort Gael. Al fondo, el Wyrm de magma: es lento, quédate junto a sus patas y aléjate cuando escupa magma.',
          'Ya tienes los atributos tras gastar las runas de Greyoll. Pide FUE 12, DES 18, INT 23.',
        ],
      },
      {
        id: 'mk-ranni',
        chapter: 'liurnia',
        slot: 'start',
        kind: 'npc',
        title: 'Empieza la misión de Ranni',
        location: 'three-sisters',
        fight: 'ninguno',
        how: [
          'Torre de Ranni (Tres Hermanas). Acepta servirle. Su misión acaba dándote el Mandoble de la Luna Oscura.',
        ],
      },
      {
        id: 'mk-darkmoon',
        chapter: 'giants',
        slot: 'start',
        kind: 'npc',
        title: 'Mandoble de la Luna Oscura',
        location: 'moonlight-altar',
        fight: 'difícil',
        taskIds: ['moon-knight:dark-moon-greatsword'],
        loot: [W('Dark Moon Greatsword')],
        how: [
          'Final de la misión de Ranni (Lago de Podredumbre → Astel → Altar de la Luz Lunar). Pide FUE 16, DES 11, INT 38.',
        ],
      },
    ],
    levels: {
      setup: { vig: 16, str: 12, dex: 18, int: 23 },
      limgrave: { vig: 20, str: 12, dex: 18, int: 24 },
      stormveil: { vig: 24, end: 12, str: 12, dex: 18, int: 27 },
      liurnia: { vig: 30, min: 14, end: 14, str: 12, dex: 20, int: 32 },
      caelid: { vig: 35, min: 16, end: 16, str: 12, dex: 22, int: 38 },
      altus: { vig: 40, min: 18, end: 18, str: 14, dex: 24, int: 44 },
      leyndell: { vig: 45, min: 20, end: 20, str: 16, dex: 25, int: 50 },
      giants: { vig: 50, min: 22, end: 22, str: 16, dex: 28, int: 58 },
      endgame: { vig: 55, min: 22, end: 22, str: 16, dex: 30, int: 62 },
      dlc: { vig: 60, min: 24, end: 25, str: 16, dex: 34, int: 70 },
    },
    loadouts: {
      setup: {
        weapon: W('Estoc'),
        stone: 'smithing',
        catalyst: W('Glintstone Staff'),
        catalystStone: 'smithing',
        upgradeCatalyst: false,
        spells: [S('Carian Slicer'), S('Glintstone Pebble')],
        talismans: [T('Dragoncrest Shield Talisman')],
        spirit: SP('Lone Wolf Ashes'),
        why: 'Estoque inicial hasta conseguir el Velo Lunar (primer paso del siguiente capítulo).',
      },
      limgrave: {
        weapon: W('Moonveil'),
        stone: 'somber',
        twoHand: true,
        why: 'Velo Lunar a dos manos; su habilidad (Desenvainar de luz de luna) es tu ataque principal contra jefes.',
      },
      liurnia: {
        talismans: [T('Winged Sword Insignia'), T('Dragoncrest Shield Talisman')],
        spirit: SP('Black Knife Tiche'),
      },
      caelid: {
        spirit: SP('Mimic Tear Ashes'),
        talismans: [
          T('Carian Filigreed Crest'),
          T('Winged Sword Insignia'),
          T('Dragoncrest Shield Talisman'),
        ],
      },
      giants: {
        weapon: W('Dark Moon Greatsword'),
        stone: 'somber',
        why: 'Mandoble de la Luna Oscura; el Velo Lunar queda de secundaria.',
      },
      endgame: {
        talismans: [
          T('Shard of Alexander'),
          T('Carian Filigreed Crest'),
          T('Winged Sword Insignia'),
          T('Godfrey Icon'),
        ],
      },
      dlc: {
        offhand: W('Carian Sorcery Sword'),
        talismans: [
          T('Shard of Alexander'),
          T('Carian Filigreed Crest'),
          T("Rellana's Cameo"),
          T('Two-Handed Sword Talisman'),
        ],
      },
    },
  },

  // ─────────────────────────────── COLOSO ───────────────────────────────
  colossus: {
    classId: 'hero',
    keepsake: 'Semilla dorada',
    start: [
      'Clase: Héroe (Fuerza 16). Recuerdo: Semilla dorada.',
      'La idea: Espadón + Garra de León a dos manos desde el principio; Gigante-machacador al final.',
    ],
    steps: [
      {
        id: 'co-greatsword',
        chapter: 'setup',
        slot: 'afterTrap',
        kind: 'loot',
        title: 'Espadón (carruaje de Caelem)',
        location: 'caelem-ruins',
        fight: 'fácil',
        taskIds: ['colossus:greatsword'],
        loot: [W('Greatsword')],
        how: [
          'Carruaje negro al noroeste de Caelem Ruins. Llega a caballo, ábrelo y vete: hay perros carroñeros cerca.',
          'Pide FUE 31: a dos manos necesitas 21 (21 × 1,5 = 31,5). Será tu objetivo al subir con las runas de Greyoll.',
        ],
      },
      {
        id: 'co-lion',
        chapter: 'setup',
        slot: 'afterTrap',
        kind: 'boss',
        title: 'Ceniza de guerra: Garra de León (Fort Gael)',
        location: 'fort-gael',
        fight: 'medio',
        loot: [A("Ash of War: Lion's Claw")],
        how: [
          'El León anciano de Fort Gael no puede subir de su patio: puedes golpearlo desde arriba o con flechas.',
          'Aplícala al Espadón: afinidad Pesada (escala solo con Fuerza) y una voltereta que rompe posturas.',
        ],
      },
      {
        id: 'co-axe',
        chapter: 'limgrave',
        slot: 'start',
        kind: 'loot',
        title: 'Talismán del hacha (Mistwood)',
        location: 'mistwood',
        fight: 'medio',
        loot: [T('Axe Talisman')],
        how: [
          'Sótano de Mistwood Ruins. Un Osorruna merodea cerca: entra a caballo, baja y cógelo. +10% a los ataques cargados.',
        ],
      },
      {
        id: 'co-crusher',
        chapter: 'altus',
        slot: 'start',
        kind: 'loot',
        title: 'Gigante-machacador',
        location: 'outer-wall-phantom',
        fight: 'medio',
        taskIds: ['colossus:giant-crusher'],
        loot: [W('Giant-Crusher')],
        how: [
          'Carruaje en un campamento al sur de Outer Wall Phantom Tree. Pide FUE 60: lo usarás a dos manos (40 × 1,5 = 60).',
        ],
      },
    ],
    levels: {
      setup: { vig: 22, end: 15, str: 22, dex: 12 },
      limgrave: { vig: 25, end: 16, str: 24, dex: 12 },
      stormveil: { vig: 27, end: 18, str: 27, dex: 12 },
      liurnia: { vig: 32, end: 20, str: 31, dex: 12 },
      caelid: { vig: 36, end: 22, str: 36, dex: 12 },
      altus: { vig: 40, end: 25, str: 42, dex: 12 },
      leyndell: { vig: 45, min: 12, end: 28, str: 48, dex: 12 },
      giants: { vig: 50, min: 14, end: 30, str: 54, dex: 12 },
      endgame: { vig: 55, min: 15, end: 35, str: 60, dex: 14 },
      dlc: { vig: 60, min: 16, end: 40, str: 66, dex: 15 },
    },
    loadouts: {
      setup: {
        weapon: W('Greatsword'),
        stone: 'smithing',
        affinity: 'Pesada',
        ash: A("Ash of War: Lion's Claw"),
        twoHand: true,
        talismans: [T('Dragoncrest Shield Talisman')],
        spirit: SP('Lone Wolf Ashes'),
        why: 'Siempre a dos manos: tu Fuerza efectiva es ×1,5.',
      },
      limgrave: { talismans: [T('Axe Talisman'), T('Dragoncrest Shield Talisman')] },
      stormveil: { talismans: [T('Axe Talisman'), T('Claw Talisman')] },
      liurnia: { spirit: SP('Black Knife Tiche') },
      caelid: {
        spirit: SP('Mimic Tear Ashes'),
        talismans: [T('Axe Talisman'), T('Claw Talisman'), T('Dragoncrest Shield Talisman')],
      },
      altus: {
        weapon: W('Giant-Crusher'),
        why: 'Cambia al Gigante-machacador cuando tengas FUE 40 (60 a dos manos). Mantén la afinidad Pesada.',
      },
      leyndell: {
        talismans: [
          T('Axe Talisman'),
          T('Claw Talisman'),
          T("Radagon's Soreseal"),
          T('Dragoncrest Shield Talisman'),
        ],
      },
      endgame: {
        talismans: [
          T('Shard of Alexander'),
          T('Axe Talisman'),
          T('Claw Talisman'),
          T("Radagon's Soreseal"),
        ],
      },
      dlc: {
        ash: A("Ash of War: Savage Lion's Claw"),
        talismans: [
          T('Shard of Alexander'),
          T('Two-Handed Sword Talisman'),
          T('Claw Talisman'),
          T('Axe Talisman'),
        ],
      },
    },
  },

  // ─────────────────────────────── LLAMA SAGRADA ───────────────────────────────
  'faith-flame': {
    classId: 'prophet',
    keepsake: 'Semilla dorada',
    start: [
      'Clase: Profeta (Fe 16, empieza con Sello de dedo y Curación). Recuerdo: Semilla dorada.',
      'La idea: conjuros de fuego y llama negra potenciados con buffs.',
    ],
    steps: [
      {
        id: 'ff-canvas',
        chapter: 'setup',
        slot: 'afterTrap',
        kind: 'loot',
        title: 'Talismán del lienzo del fiel (Túnel de Sellia)',
        location: 'sellia-crystal-tunnel',
        fight: 'fácil',
        loot: [T("Faithful's Canvas Talisman")],
        how: [
          'Dentro del túnel al que te lleva el cofre trampa: cadáver a la derecha del camino principal, guardado por dos Pestes. +4% a los encantamientos.',
        ],
      },
      {
        id: 'ff-fgms',
        chapter: 'setup',
        slot: 'afterTrap',
        kind: 'loot',
        title: '«Llama, dame fuerza» (Fort Gael)',
        location: 'fort-gael',
        fight: 'ninguno',
        loot: [I('Flame, Grant Me Strength')],
        how: [
          'Cadáver fuera de la muralla este de Fort Gael, entre dos Carros de llamas: espera a que pasen y cógelo.',
        ],
      },
      {
        id: 'ff-blackflame',
        chapter: 'stormveil',
        slot: 'start',
        kind: 'npc',
        title: 'Llama Negra (Libro de los Piel de Dios)',
        location: 'stormveil',
        fight: 'fácil',
        loot: [I('Black Flame')],
        how: [
          'En Velo Tormentoso, sótano a la izquierda del patio de la entrada (1 Llave de espada de piedra): Libro de oraciones de los Piel de Dios.',
          'Dáselo al Hermano Corhyn (Mesa Redonda) y compra Llama Negra (7.500 runas). Quita un % de vida a los jefes.',
        ],
      },
      {
        id: 'ff-seal',
        chapter: 'altus',
        slot: 'start',
        kind: 'loot',
        title: 'Sello del Árbol Áureo y Voto Áureo',
        location: 'volcano-manor',
        fight: 'medio',
        loot: [W('Erdtree Seal'), I('Golden Vow')],
        how: [
          'Sello: celda junto a Prison Town Church (Mansión del Volcán). Pide Fe 40.',
          'Voto Áureo: Choza del Hedor a Cadáver, en el Camino de la Iniquidad.',
        ],
      },
    ],
    levels: {
      setup: { vig: 20, min: 16, end: 10, fai: 23 },
      limgrave: { vig: 22, min: 18, end: 10, fai: 25 },
      stormveil: { vig: 25, min: 20, end: 12, fai: 28 },
      liurnia: { vig: 30, min: 23, end: 14, fai: 34 },
      caelid: { vig: 35, min: 26, end: 15, fai: 40 },
      altus: { vig: 40, min: 28, end: 16, fai: 45 },
      leyndell: { vig: 45, min: 30, end: 18, fai: 52 },
      giants: { vig: 50, min: 33, end: 20, fai: 60 },
      endgame: { vig: 55, min: 36, end: 22, fai: 70 },
      dlc: { vig: 60, min: 38, end: 24, fai: 80 },
    },
    loadouts: {
      setup: {
        weapon: W('Finger Seal'),
        stone: 'smithing',
        spells: [I('Flame, Grant Me Strength'), I('O, Flame!'), I('Heal')],
        talismans: [T("Faithful's Canvas Talisman")],
        spirit: SP('Lone Wolf Ashes'),
        why: 'El Sello de dedo se mejora con piedras normales hasta +25.',
      },
      stormveil: {
        spells: [I('Black Flame'), I('Flame, Grant Me Strength'), I('O, Flame!'), I('Heal')],
      },
      liurnia: {
        talismans: [T("Faithful's Canvas Talisman"), T('Radagon Icon')],
        spirit: SP('Black Knife Tiche'),
      },
      caelid: { spirit: SP('Mimic Tear Ashes') },
      altus: {
        weapon: W('Erdtree Seal'),
        stone: 'somber',
        spells: [I('Black Flame'), I('Flame, Grant Me Strength'), I('Golden Vow'), I('O, Flame!')],
        talismans: [T("Faithful's Canvas Talisman"), T('Radagon Icon'), T('Godfrey Icon')],
        why: 'Cambia al Sello del Árbol Áureo cuando tengas Fe 40.',
      },
      giants: {
        spells: [
          I('Black Flame'),
          I('Black Flame Ritual'),
          I('Flame, Grant Me Strength'),
          I('Golden Vow'),
        ],
      },
      endgame: {
        spells: [I('Black Flame'), I('Black Flame Ritual'), I('Golden Vow'), I('Erdtree Heal')],
      },
      dlc: {
        weapon: W("Fire Knight's Seal"),
        spells: [I("Messmer's Orb"), I('Rain of Fire'), I('Black Flame'), I('Golden Vow')],
      },
    },
  },

  // ─────────────────────────────── SAMURÁI DEL TRUENO ───────────────────────────────
  'lightning-samurai': {
    classId: 'samurai',
    keepsake: 'Semilla dorada',
    start: [
      'Clase: Samurái. Recuerdo: Semilla dorada.',
      'La idea: katanas con afinidad Afilada (Destreza) y la habilidad Desenvainar; Nagakiba a mitad de juego.',
    ],
    steps: [
      {
        id: 'ls-unsheathe',
        chapter: 'setup',
        slot: 'beforeTrap',
        kind: 'loot',
        title: 'Ceniza de guerra: Desenvainar',
        location: 'agheel-lake',
        fight: 'fácil',
        loot: [A('Ash of War: Unsheathe')],
        how: [
          'Escarabajo en el agua de la esquina sureste del Lago Agheel. Aplícala a la Uchigatana: afinidad Afilada (Destreza).',
        ],
      },
      {
        id: 'ls-nagakiba',
        chapter: 'altus',
        slot: 'start',
        kind: 'npc',
        title: 'Nagakiba (misión de Yura)',
        location: 'second-church',
        fight: 'medio',
        taskIds: ['lightning-samurai:nagakiba'],
        loot: [W('Nagakiba')],
        how: [
          'Sigue la misión de Yura hasta la Segunda Iglesia de Marika. Pide FUE 18, DES 22. Cámbiale la ceniza por Desenvainar.',
        ],
      },
      {
        id: 'ls-gransax',
        chapter: 'leyndell',
        slot: 'start',
        kind: 'loot',
        title: 'Rayo de Gransax',
        location: 'bolt-of-gransax',
        fight: 'ninguno',
        taskIds: ['lightning-samurai:bolt-of-gransax'],
        loot: [W('Bolt of Gransax')],
        how: [
          'Sal de Erdtree Sanctuary, baja en el ascensor y salta sobre el edificio: la lanza está encima de la lanza gigante. ¡Desaparece en Leyndell Ceniza!',
        ],
      },
    ],
    levels: {
      setup: { vig: 20, end: 15, dex: 23 },
      limgrave: { vig: 22, end: 16, dex: 25 },
      stormveil: { vig: 25, end: 17, dex: 28 },
      liurnia: { vig: 30, end: 19, str: 14, dex: 33 },
      caelid: { vig: 35, end: 20, str: 16, dex: 38 },
      altus: { vig: 40, end: 22, str: 18, dex: 43 },
      leyndell: { vig: 45, end: 24, str: 20, dex: 48 },
      giants: { vig: 50, min: 12, end: 26, str: 20, dex: 55 },
      endgame: { vig: 55, min: 14, end: 28, str: 20, dex: 65 },
      dlc: { vig: 60, min: 15, end: 30, str: 20, dex: 75 },
    },
    loadouts: {
      setup: {
        weapon: W('Uchigatana'),
        stone: 'smithing',
        affinity: 'Afilada',
        ash: A('Ash of War: Unsheathe'),
        talismans: [T('Dragoncrest Shield Talisman')],
        spirit: SP('Lone Wolf Ashes'),
      },
      liurnia: {
        talismans: [T('Winged Sword Insignia'), T('Dragoncrest Shield Talisman')],
        spirit: SP('Black Knife Tiche'),
      },
      caelid: { spirit: SP('Mimic Tear Ashes') },
      altus: {
        weapon: W('Nagakiba'),
        stone: 'smithing',
        affinity: 'Afilada',
        ash: A('Ash of War: Unsheathe'),
        talismans: [
          T("Millicent's Prosthesis"),
          T('Winged Sword Insignia'),
          T('Dragoncrest Shield Talisman'),
        ],
      },
      leyndell: {
        offhand: W('Bolt of Gransax'),
        why: 'Rayo de Gransax como arma secundaria para su lanzamiento a distancia.',
      },
      endgame: {
        talismans: [
          T('Shard of Alexander'),
          T("Millicent's Prosthesis"),
          T('Winged Sword Insignia'),
          T('Dragoncrest Shield Talisman'),
        ],
      },
      dlc: {
        weapon: W("Rakshasa's Great Katana"),
        stone: 'somber',
        affinity: undefined,
        ash: undefined,
        twoHand: true,
        talismans: [
          T('Shard of Alexander'),
          T("Millicent's Prosthesis"),
          T('Two-Handed Sword Talisman'),
          T('Winged Sword Insignia'),
        ],
      },
    },
  },

  // ─────────────────────────────── PUÑO DE HOJA SECA ───────────────────────────────
  'dryleaf-monk': {
    classId: 'confessor',
    keepsake: 'Semilla dorada',
    start: [
      'Clase: Confesor (Des y Fe equilibradas). Recuerdo: Semilla dorada.',
      'Durante el juego base usarás una katana Sagrada; las artes de Hoja Seca llegan en el DLC.',
    ],
    steps: [
      {
        id: 'dm-uchi',
        chapter: 'setup',
        slot: 'beforeTrap',
        kind: 'loot',
        title: 'Uchigatana (Catacumbas Tocadas por la Muerte)',
        location: 'deathtouched-catacombs',
        fight: 'fácil',
        loot: [W('Uchigatana')],
        how: [
          'Catacumbas de Stormhill. La Uchigatana está en un cadáver antes del jefe: no hace falta enfrentarlo.',
        ],
      },
      {
        id: 'dm-sacred',
        chapter: 'setup',
        slot: 'beforeTrap',
        kind: 'loot',
        title: 'Ceniza de guerra: Hoja Sagrada',
        location: 'sacred-blade-scarab',
        fight: 'fácil',
        loot: [A('Ash of War: Sacred Blade')],
        how: [
          'Escarabajo al noroeste de la Tercera Iglesia de Marika. Aplícala a la Uchigatana: afinidad Sagrada.',
        ],
      },
      {
        id: 'dm-dane',
        chapter: 'dlc',
        slot: 'start',
        kind: 'npc',
        title: 'Artes de Hoja Seca y Sello de Hoja Seca',
        location: 'sote-moorth',
        fight: 'medio',
        loot: [W('Dryleaf Arts'), W('Dryleaf Seal')],
        how: [
          'Gana el combate amistoso contra Dane en Moorth Ruins: Artes de Hoja Seca.',
          "Sello: cadáver bajo el mensaje de Dane, cerca de Recluses' River Downstream.",
        ],
      },
    ],
    levels: {
      setup: { vig: 20, str: 12, dex: 18, fai: 15 },
      limgrave: { vig: 22, dex: 20, fai: 16 },
      stormveil: { vig: 25, end: 12, dex: 22, fai: 18 },
      liurnia: { vig: 30, end: 14, dex: 25, fai: 20 },
      caelid: { vig: 35, end: 15, dex: 28, fai: 22 },
      altus: { vig: 40, end: 16, dex: 32, fai: 24 },
      leyndell: { vig: 45, end: 18, dex: 36, fai: 26 },
      giants: { vig: 50, end: 20, dex: 40, fai: 27 },
      endgame: { vig: 55, min: 15, end: 22, dex: 45, fai: 30 },
      dlc: { vig: 60, min: 18, end: 25, dex: 55, fai: 40 },
    },
    loadouts: {
      setup: {
        weapon: W('Uchigatana'),
        stone: 'smithing',
        affinity: 'Sagrada',
        ash: A('Ash of War: Sacred Blade'),
        talismans: [T('Dragoncrest Shield Talisman')],
        spirit: SP('Lone Wolf Ashes'),
      },
      liurnia: {
        talismans: [T('Winged Sword Insignia'), T('Dragoncrest Shield Talisman')],
        spirit: SP('Black Knife Tiche'),
      },
      caelid: { spirit: SP('Mimic Tear Ashes') },
      altus: {
        talismans: [
          T("Millicent's Prosthesis"),
          T('Winged Sword Insignia'),
          T('Dragoncrest Shield Talisman'),
        ],
      },
      dlc: {
        weapon: W('Dryleaf Arts'),
        stone: 'somber',
        affinity: undefined,
        ash: undefined,
        catalyst: W('Dryleaf Seal'),
        catalystStone: 'somber',
        spells: [I('Golden Arcs'), I('Divine Bird Feathers')],
        talismans: [
          T('Two-Handed Sword Talisman'),
          T("Millicent's Prosthesis"),
          T('Winged Sword Insignia'),
          T('Shard of Alexander'),
        ],
      },
    },
  },
}
