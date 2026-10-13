/**
 * Dirección de arte de las ilustraciones de «El Anillo Roto» (una por capítulo).
 * Los prompts van en inglés porque los modelos SDXL los siguen mucho mejor.
 * El estilo común se añade a cada escena en scripts/illustrate.mjs.
 *
 * Para retocar una ilustración: cambia su `scene` (o fija `seed`) y vuelve a generarla con
 *   npm run illustrate -- --only 21-margit --force
 */

import artStyle from '../../src/content/novela/art-style.json' with { type: 'json' }

/** Estilo y negativo comunes (compartidos con el Estudio de la app) */
export const STYLE = artStyle.style
export const NEGATIVE = artStyle.negative

/** Descripción fija de la protagonista para que sea reconocible entre capítulos */
const EDDA = 'a lone female warrior with short dark hair in worn, dented tarnished armor and a tattered grey hooded cloak'

/** @type {{ slug: string, scene: string, seed?: number }[]} */
export const PROMPTS = [
  // ───── Libro I · Antes del Árbol ─────
  { slug: '01-la-tormenta', scene: 'a colossal ancient city of white twisting stone columns floating in the sky, wrapped in a perpetual storm of frozen crimson lightning, a five-headed ancient dragon perched on the highest temple, a golden star descending through the clouds' },
  { slug: '01a-el-draco-negro', scene: 'a colossal black dragon with four wings and glowing red eyes battling a gigantic five-headed stone dragon inside an eternal storm of frozen crimson lightning, ancient stone dragons coiled in a living wall, a ruined floating city of white columns' },
  { slug: '01b-el-crisol', scene: 'a lone young woman hunter with black dragon scales on her arms and face and red eyes, wrapped in a bark cloak, standing at the shore of a luminous green lake where a formless translucent creature rises, strange two-headed deer and feathered bears in a primeval misty forest, a faint golden glow on the western horizon' },
  { slug: '02-las-estrellas', scene: 'ancient astrologers in heavy fur robes lying on snow atop frozen mountain peaks at night, gazing up at a vast sky full of stars and nebulae, frost on their faces, tiny campfires, cold blue moonlight' },
  { slug: '03-las-chamanas', scene: 'a village of living wooden houses grown from ancient trees in a high misty valley, shaman women with braided hair and ceremonial paint gathered around a fire, roots rising from the ground like ribs, twilight' },
  { slug: '04-la-puerta-divina', scene: 'a towering ancient city climbing the base of an immense stone tower like a vine, stacked terraces, temples and stairways over abysses, huge ceramic jars on altars, incense smoke, a woman in white robes ascending the steps' },

  // ───── Libro II · La Edad del Oro ─────
  { slug: '04a-el-camino-del-oeste', scene: 'a barefoot young woman with golden hair and a crown of dried flowers sitting at the roots of a small young golden tree glowing on a green plateau beside an inland sea at sunset, a huge warrior with a lion of light on his shoulders beside her, a black wolf-like beast lying in the grass and a kneeling boy with a too-large sword' },
  { slug: '05-los-gigantes', scene: 'an epic battle in snowy mountains, armored warriors charging with axes against towering fire giants with burning eyes, a young golden tree glowing in the distant background, smoke and embers, heroic composition' },
  { slug: '05a-el-rey-barbaro', scene: 'a barefoot young goddess with golden hair in a simple white robe and a crown of golden leaves, and a towering golden-maned warrior kneeling before her in golden armor with a lion of light on his shoulders, at the roots of a colossal golden tree, a half-built city of scaffolds behind them, crowds of workers and soldiers' },
  { slug: '06a-la-caceria-de-dioses', scene: 'a pale young woman with a long black braid, one brown eye and one glowing violet twilight eye, holding a black flame in her palm, standing in a snowy mountain pass, followed by tall thin smiling figures in robes of strange skin and red-robed monks with unlit braziers' },
  { slug: '06-ojos-lobregos', scene: 'a pale queen with sorrowful dark eyes and a crown of thorny gold standing in a dim marble hall, long pale fingers of light writing glowing signs in the air above her, a golden city visible through tall windows' },
  { slug: '06b-la-hoja-negra', scene: 'a huge black wolf-like beast in a dark cloak hammering a black sword on an anvil in an ancient underground forge, white-hot embers, frost spreading over the anvil, a blind young priestess with a braid standing near the doorway in the firelight' },
  { slug: '07-la-abundancia', scene: 'a gigantic radiant golden tree towering over a prosperous white stone capital, golden sap dripping from its branches into great stone basins, pilgrims and priests gathering amber tears, warm idyllic light' },
  { slug: '07a-las-cloacas', scene: 'two young horned boys with grey skin chained in a dark stone sewer cell, one looking up at a thin golden ray of light falling from a high grate, the other holding a red stone among a circle of pebbles, a blind middle-aged woman with a braid reading a book with her fingers by candlelight' },
  { slug: '08-el-dragon-y-el-principe', scene: 'a young golden-haired prince in shining armor facing a massive stormy ancient dragon on a rooftop of a golden city, lightning splitting a darkened sky, birds fleeing, dramatic confrontation' },
  { slug: '09-la-cruzada', scene: 'a grim red-haired warlord with burning eyes and a black serpent coiled around his arm, leading an army of black-armored knights with flaming spears, a burning village in the background, smoke and fire' },
  { slug: '10-las-guerras-de-liurnia', scene: 'a vast misty lake with sunken ruins and crystal towers, sorcerers in blue robes casting glowing glintstone spells against a golden-armored army, blue magical light reflected on the water, full moon' },
  { slug: '11-la-larga-marcha', scene: 'a huge muscular warrior king with a golden mane and a great axe standing alone on a battlefield at autumn sunset, a lion beside him, fallen enemies around, melancholic golden light' },
  { slug: '12-el-segundo-senor', scene: 'a red-haired knight in a fur cloak leaving a moonlit manor at dawn in winter, a blue-robed queen watching from a library window, snow falling, a distant golden tree glowing on the horizon' },
  { slug: '13-el-nino-que-no-crecia', scene: 'a golden-haired child with a gentle face sitting at the edge of a bed in a dim tower room with drawn curtains, holding the bandaged hand of his twin sister who has long red hair, candlelight, tender and sad' },

  // ───── Libro III · La Fractura ─────
  { slug: '14-los-cuchillos-negros', scene: 'shadowy female assassins in black hooded cloaks with knives glowing with dark red runes slipping through a golden palace at night, a fallen golden prince on marble steps, moonlight and long shadows' },
  { slug: '15-el-principe-de-la-muerte', scene: 'a funeral procession carrying a body wrapped in golden shrouds down into the immense roots of a glowing tree, priests with candles, deep underground cavern, eerie stillness' },
  { slug: '16-el-martillo', scene: 'a goddess with long golden hair raising a great hammer to strike a radiant golden ring of light on top of a colossal tree at night, shards of gold exploding outward, a black beast watching from afar' },
  { slug: '17-la-guerra-de-los-fragmentos', scene: 'armies of demigods clashing on a vast plain under a darkened sky, banners of many houses, broken siege towers, glowing great runes held aloft by distant warlords, chaos and ruin' },
  { slug: '18-aeonia', scene: 'a red-haired female warrior with a winged golden helm and a prosthetic arm unleashing a colossal blooming flower of scarlet rot over a battlefield, a crimson explosion against a darkened sky, a giant warrior falling' },

  // ───── Libro IV · El Sinluz ─────
  { slug: '19-la-capilla', scene: `${EDDA} awakening in a ruined stone chapel at dawn, pale ashen skin, broken pews and fallen pillars, a single beam of golden light through a shattered window, dust in the air` },
  { slug: '20-la-doncella-sin-dedos', scene: `${EDDA} resting at a small glowing golden site of grace at night in a ruined field, a mysterious young woman in a dark hooded cloak with one closed eye kneeling beside her, a spectral horse with horns in the mist` },
  { slug: '21-margit', scene: `${EDDA} facing a towering hunched old man with a long white beard, a golden horned crown and a glowing golden hammer, in a windswept stone courtyard before a castle gate, broken shields and bones on the ground` },
  { slug: '22-velo-tormentoso', scene: 'a grim stone castle on a cliff under a raging storm, crumbling walls and wooden scaffolds, a grotesque giant lord grafted with many arms on a high battlement, ravens circling, rain' },
  { slug: '23-la-mesa-redonda', scene: `${EDDA} entering a circular hall of dark stone lit by candles, a great round table of black wood with high-backed empty chairs, faded banners on the walls, a hooded old man reading in the shadows` },
  { slug: '24-liurnia', scene: `${EDDA} on a cliff looking down at a vast shallow blue lake covered in mist, sunken towers and bridges emerging from the water, a lone witch tower and a great academy on the horizon, cold silvery light` },
  { slug: '25-el-festival', scene: 'a gigantic red-haired warrior general on a small horse, wielding two massive curved greatswords, charging across a scarlet wasteland under a blood-red sky, rotting crimson ground, falling meteors' },
  { slug: '26-las-ciudades-eternas', scene: 'a vast underground cavern with a false starry sky, ancient ruined city of pale stone towers, silver glowing figures, a glowing river, deep blue and silver light' },
  { slug: '27-la-mansion-del-volcan', scene: 'a dark manor at the foot of an erupting volcano, rivers of lava, and a colossal serpent with a human face rising from a lake of fire inside a cavern, burning embers, infernal light' },
  { slug: '28-la-capital-dorada', scene: `${EDDA} walking up marble stairways of a magnificent golden capital city, domes and colonnades, golden leaves falling like rain from a colossal glowing tree that fills the sky` },
  { slug: '29-bajo-la-capital', scene: `${EDDA} descending into dark sewers beneath a golden city, mossy stone tunnels, dripping water, chained grotesque horned omen creatures in cells, a blind pilgrim girl in white with a blindfold holding a lantern` },
  { slug: '30-el-senor-de-la-sangre', scene: 'an underground palace beneath a blood-red sky, a lake of blood, a towering horned lord with a trident rising in a crimson flame, a giant pale cocoon with a withered arm behind him' },

  // ───── Libro V · La Tierra de las Sombras ─────
  { slug: '31-la-llanura-de-las-tumbas', scene: `${EDDA} awakening in a vast grey plain filled with hundreds of tall ancient stone crosses, low silver clouds, no sun, distant black mountains and an enormous dark tree on the horizon` },
  { slug: '32-castillo-ensis', scene: 'a grey fortress castle on a cliff guarding a river crossing, sharp towers cutting a pale sky, and a female knight with twin glowing moons of blue and gold above her raised swords in the throne room' },
  { slug: '33-el-jardin-purpura', scene: 'a secret garden of purple flowers in a dark forest at night, a sleeping goddess-like woman in a white dress lying among the flowers, pale moonlight, mist, mysterious and melancholic' },
  { slug: '34-el-pico-escarpado', scene: 'a jagged black volcanic peak like a broken knife rising over a valley of ash, columns of smoke, dozens of grey and red dragons flying around it, a huge scarred dragon roaring at the summit' },
  { slug: '35-el-torreon-de-la-sombra', scene: 'an immense dark fortress keep with towering walls, a red-haired warlord with a flaming spear and serpent wings standing in a burning hall, black knights kneeling, fire and shadow' },
  { slug: '36-los-dedos-rotos', scene: 'a pale narrow cathedral in a white stone valley whose spires are long twisted stone fingers pointing at the sky, stained glass windows glowing, an eerie cosmic light above' },
  { slug: '37-la-santa-del-brote', scene: 'a giant creature with a woman\'s upper body and the body of a moth surrounded by scarlet rot flowers in a ruined church among ancient ruins, red petals in the air, a burning sealed tree in the distance' },
  { slug: '38-enir-ilim', scene: `${EDDA} climbing an endless stairway of roots along the trunk of a colossal grey tree into the clouds, a silver city of temples built into the tree above, an empty silver sky without sun or stars` },

  // ───── Libro VI · La llama de la ruina ─────
  { slug: '39-las-cumbres', scene: `${EDDA} and a hooded maiden walking through snowy mountaintops of giants under a pale sky, frozen lakes, giant skeletons half buried in snow, a distant forge glowing on the highest peak` },
  { slug: '40-el-arbol-halito', scene: 'a colossal pale tree rising from a frozen land, a city built into its enormous branches and roots, golden light filtering through, a red-haired one-armed swordswoman sitting on a wooden platform' },
  { slug: '41-la-forja', scene: `${EDDA} standing small before a colossal fire giant with one burning eye sitting on a glacier at the top of the world, a great forge with an eternal flame behind him, snow and embers` },
  { slug: '42-farum-azula', scene: 'ruined ancient city of crumbling white stone floating in the sky inside the eye of an eternal storm, broken bridges, a black-cloaked beast warrior with a glowing black blade, crimson lightning' },
  { slug: '43-la-capital-de-ceniza', scene: `${EDDA} walking through a golden capital city buried in grey ash, ruined domes, a colossal burned tree in the sky, ash falling like snow, a muscular bare-chested warrior king awaiting on the throne steps` },
  { slug: '44-dentro-del-arbol', scene: 'an infinite golden void inside a divine tree, liquid golden light everywhere, a celestial beast made of golden filaments and constellations rising, a tiny lone warrior facing it' },
  { slug: '45-la-era-de-las-estrellas', scene: 'a pale blue-skinned witch with four arms and a wide witch hat standing under a deep night sky full of cold stars, the golden light fading into indigo, a full moon, serene and cosmic' },
  { slug: '46-epilogo', scene: 'an immense tree whose branches split into many worlds, each branch holding a different scene: a burning frenzied flame, a starry sky, a golden throne, a dusk of death, mystical and contemplative' },
]
