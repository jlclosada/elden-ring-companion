import { EXTRA_SECTIONS } from './lore-extra'
import type { CompendiumCat } from './types'

/**
 * La historia de Elden Ring contada como novela, en prosa propia.
 * Se apoya en las descripciones de objetos, los diálogos y la interpretación
 * más aceptada por la comunidad; los puntos discutidos se señalan como tales.
 */
type Ref = { cat: CompendiumCat; name: string }
const R = (cat: CompendiumCat, name: string): Ref => ({ cat, name })

export interface LoreSection {
  heading?: string
  text: string[]
}
export interface LoreChapter {
  id: string
  number: number
  part: string
  title: string
  era: string
  epigraph: string
  summary: string
  cover: Ref
  sections: LoreSection[]
  relics: Ref[]
  places: string[]
  characters: string[]
  dlc?: boolean
}

export interface LoreCharacter {
  id: string
  name: string
  title: string
  bio: string
  portrait?: Ref
  dlc?: boolean
}

export const LORE_PARTS = [
  'I. Antes del Anillo',
  'II. La Edad Dorada',
  'III. La Fractura',
  'IV. El regreso de los Sinluz',
  'V. La Tierra de las Sombras',
]

const BASE_CHAPTERS: LoreChapter[] = [
  {
    id: 'dragones',
    number: 1,
    part: 'I. Antes del Anillo',
    era: 'Era de los Dragones',
    title: 'Cuando el mundo era de los dragones',
    epigraph: 'Antes del oro hubo tormenta, y antes de la tormenta, escamas.',
    summary:
      'Los Dragones Antiguos gobiernan desde Farum Azula, la Voluntad Mayor envía a la Bestia de Elden y la vida del Crisol cede ante un árbol que todavía no existe.',
    cover: R('items', 'Remembrance Of The Dragonlord'),
    sections: [
      {
        text: [
          'En el principio, las Tierras Intermedias no conocían orden alguno. La vida brotaba sin forma del Crisol, una fuerza primordial en la que todo estaba mezclado: los guerreros nacían con cuernos y alas, las plumas convivían con las escamas y nadie distinguía entre lo humano y lo bestial. Era una vida desordenada, pero libre.',
          'Sobre esa tierra sin ley reinaban los Dragones Antiguos. Su señor, el Señor Dragón Placidusax, gobernaba desde Farum Azula, una ciudadela suspendida en el ojo de una tormenta eterna, donde el tiempo se doblaba sobre sí mismo. Los dragones eran criaturas de rayo y piedra, casi inmortales, y los hombres bestia de Azula les rendían culto como a dioses.',
          'Pero Placidusax servía a un dios que lo abandonó. Un día, su dios simplemente se marchó, y el Señor Dragón quedó esperando su regreso en el centro de la tormenta, con dos de sus cinco cabezas ya perdidas, en un tiempo que ya no avanzaba. Allí sigue, aguardando a un dios que no vuelve.',
        ],
      },
      {
        heading: 'La Voluntad Mayor',
        text: [
          'Muy lejos, más allá de las estrellas, existía la Voluntad Mayor: una entidad divina que deseaba imponer un orden único sobre el mundo. Para lograrlo envió a las Tierras Intermedias una estrella dorada que llevaba dentro a la Bestia de Elden, un ser hecho de luz y de principio, destinado a convertirse en el propio Anillo de Elden.',
          'Donde cayó la estrella germinó el Árbol Áureo. Su luz desplazó a la tormenta: los dragones lucharon contra el nuevo orden y perdieron. El gran Gransax llegó a arrojar su lanza de rayo contra la capital que crecía a los pies del Árbol, y su cadáver de piedra todavía yace en Leyndell, con la lanza clavada en el suelo, como recuerdo de una guerra que el oro ganó.',
          'Los dragones que sobrevivieron se rindieron o se ocultaron. Algunos, como Lansseax y Fortissax, llegaron a pactar con la nueva era. El Crisol fue arrinconado: lo que antes era la fuente de toda vida pasó a considerarse algo primitivo, impuro, incluso vergonzoso.',
        ],
      },
    ],
    relics: [
      R('items', 'Remembrance Of The Dragonlord'),
      R('incantations', "Placidusax's Ruin"),
      R('weapons', 'Bolt of Gransax'),
      R('incantations', "Ancient Dragons' Lightning Strike"),
      R('talismans', 'Talisman of All Crucibles'),
    ],
    places: ['farum-azula', 'placidusax', 'bolt-of-gransax'],
    characters: ['placidusax', 'greater-will', 'elden-beast'],
  },
  {
    id: 'marika',
    number: 2,
    part: 'I. Antes del Anillo',
    era: 'Era del Crisol',
    title: 'La chamana de los ojos',
    epigraph: 'Nadie recuerda el nombre del pueblo que la vio nacer. Ella se aseguró de ello.',
    summary:
      'El origen de Marika entre las chamanas oprimidas de la Tierra de las Sombras, su ascenso como Empírea y el nacimiento de la Orden Áurea.',
    cover: R('items', 'Elden Remembrance'),
    dlc: true,
    sections: [
      {
        text: [
          'Marika nació en la Tierra de las Sombras, una región que más tarde quedaría escondida del mundo. Allí vivían los Cornamentados, un pueblo orgulloso que veneraba el Crisol y aspiraba a la divinidad a través de él. Bajo su dominio malvivían las aldeas de chamanas, mujeres a las que los Cornamentados sometían y sacrificaban en sus rituales. Marika era una de ellas.',
          'De ese pueblo humillado salió la que llegaría a ser diosa. Marika fue elegida por los Dedos —los mensajeros de la Voluntad Mayor— como recipiente divino: una Empírea capaz de albergar el Anillo de Elden. Lo que la Voluntad Mayor no tuvo en cuenta, quizá, fue lo que una chamana oprimida haría con ese poder.',
        ],
      },
      {
        heading: 'La Orden Áurea',
        text: [
          'Marika se convirtió en la Reina Eterna. Unida a la Bestia de Elden, encarnó el Anillo y proclamó la Orden Áurea: un sistema de leyes que regía la vida y la muerte, la fe y la gracia, y que señalaba a cada ser su lugar bajo el Árbol. Por primera vez el mundo tuvo un centro. Leyndell, la Capital Real, creció dorada alrededor de las raíces.',
          'Con el orden llegó la exclusión. Todo lo que no encajaba —los Augurios con cuernos, el Crisol, los dioses rivales— quedó fuera de la gracia. Muchos estudiosos ven en ello una ironía cruel: la chamana que había sido víctima de un pueblo con cuernos persiguió después a todo lo que tuviera cuernos.',
        ],
      },
      {
        heading: 'La cruzada y el velo',
        text: [
          'Marika no olvidó a los Cornamentados. Envió a su hijo Messmer, nacido con una serpiente en su interior y una llama en los ojos, a purgar la Tierra de las Sombras. Sus Caballeros de Fuego quemaron aldeas, templos y torres. Cuando la cruzada terminó, Marika selló aquella tierra bajo un velo de sombra para que nadie pudiera volver a encontrarla, y con ella encerró a Messmer, a la Puerta Divina y a su propio pasado.',
          'Desde entonces, el Árbol Umbrío creció en la sombra como reflejo oscuro del Árbol Áureo, y la historia oficial de la Orden empezó con una diosa sin infancia.',
        ],
      },
    ],
    relics: [
      R('items', 'Elden Remembrance'),
      R('items', 'Remembrance of the Impaler'),
      R('incantations', "Messmer's Orb"),
      R('weapons', 'Sacred Relic Sword'),
    ],
    places: ['leyndell', 'sote-gravesite', 'sote-shadow-keep'],
    characters: ['marika', 'messmer', 'two-fingers'],
  },
  {
    id: 'gigantes',
    number: 3,
    part: 'II. La Edad Dorada',
    era: 'Guerras de la Orden',
    title: 'La llama que no podía apagarse',
    epigraph: 'Al primer Señor de Elden le bastaba una guerra para sentirse vivo.',
    summary:
      'Godfrey y Serosh conquistan las Tierras Intermedias, Marika derrota a los Gigantes y sella la Llama de la Ruina, y Maliketh guarda la Runa de la Muerte.',
    cover: R('items', 'Remembrance Of Hoarah Loux'),
    sections: [
      {
        text: [
          'La Reina Eterna necesitaba un consorte, y lo encontró en Godfrey, un guerrero de las tierras salvajes cuya fuerza era famosa en todo el continente. Para domar su sed de sangre, Marika colocó sobre sus hombros a Serosh, un león espiritual que contenía su furia. Así nació el primer Señor de Elden.',
          'Godfrey conquistó en nombre del oro. Derrotó a los señores de la tormenta en Necrolimbo, sometió a los dragones rebeldes y se enfrentó a los Gigantes de Fuego en las cumbres heladas del norte. Aquella fue la guerra más dura de todas: los Gigantes custodiaban la Llama de la Ruina, un fuego capaz de quemar el propio Árbol Áureo.',
        ],
      },
      {
        heading: 'La maldición del último Gigante',
        text: [
          'Marika venció a los Gigantes, pero no pudo extinguir su llama. Así que maldijo al último de ellos para que la vigilase eternamente en la Forja de los Gigantes, encadenado a su tarea, lejos del Árbol que esa llama podría consumir. Como precaución, ordenó también levantar la Gran Muralla de Espinas y prohibir que nadie se acercara.',
        ],
      },
      {
        heading: 'La sombra de Marika',
        text: [
          'La Orden Áurea tenía otro enemigo invisible: la Muerte Destinada. Para que los seres del Árbol pudieran renacer en sus raíces, Marika arrancó la Runa de la Muerte del mundo y la entregó a su hermano sombra, Maliketh, una bestia de Farum Azula que juró protegerla. Maliketh selló la runa dentro de su propia espada y persiguió a los Piel de Dios, apóstoles de la Reina de los Ojos Lóbregos, una diosa rival que dominaba la llama negra de la muerte.',
          'Con la muerte encerrada, las almas dejaron de morir de verdad. Se enterraban en las raíces del Árbol para renacer. A esto se le llamó la era de la Orden; muchos lo llamarían después la gran mentira.',
        ],
      },
    ],
    relics: [
      R('items', 'Remembrance Of Hoarah Loux'),
      R('items', 'Remembrance Of The Fire Giant'),
      R('items', 'Remembrance Of The Black Blade'),
      R('incantations', 'Black Flame'),
      R('talismans', 'Godfrey Icon'),
    ],
    places: ['fire-giant', 'forge-giants', 'maliketh', 'stormveil'],
    characters: ['godfrey', 'fire-giant', 'maliketh'],
  },
  {
    id: 'augurios',
    number: 4,
    part: 'II. La Edad Dorada',
    era: 'Edad Dorada',
    title: 'Los hijos que nacieron con cuernos',
    epigraph: 'La Orden tenía un sitio para cada cosa. Para algunas, ese sitio era una cloaca.',
    summary:
      'Nacen Godwyn, Morgott y Mohg. Los Augurios son encerrados bajo la capital y Godfrey pierde la gracia: los primeros Sinluz son desterrados.',
    cover: R('items', 'Remembrance Of The Omen King'),
    sections: [
      {
        text: [
          'De la unión de Marika y Godfrey nacieron tres hijos. El primero, Godwyn el Dorado, fue amado por todos: un príncipe valiente que llegó a hacerse amigo del dragón Fortissax tras vencerlo en combate. Los otros dos nacieron gemelos y con cuernos: Morgott y Mohg. Eran Augurios, el estigma que el Crisol dejaba en la sangre dorada.',
          'La Orden no toleraba a los Augurios. Los gemelos fueron encerrados en las Cloacas de los Repudiados, bajo la propia Leyndell, junto a otros como ellos a los que se les cortaban los cuernos para mantenerlos "puros". Morgott, pese a todo, amó a la Orden que lo despreciaba. Mohg, en cambio, encontró en la oscuridad la voz de una llama ajena: la de un dios exterior de la sangre.',
        ],
      },
      {
        heading: 'El destierro de los Sinluz',
        text: [
          'Llegó un día en que la luz de la gracia abandonó los ojos de Godfrey y de sus guerreros. Marika los desterró de las Tierras Intermedias con una promesa: algún día volverían, tras la muerte, a luchar por el Anillo. Godfrey se marchó sin oponerse, y con él empezó la estirpe de los Sinluz.',
          'La Reina Eterna necesitaba un nuevo consorte. Lo encontraría en un lugar inesperado: al otro lado del lago, entre los magos de la luna.',
        ],
      },
    ],
    relics: [
      R('items', 'Remembrance Of The Omen King'),
      R('items', 'Remembrance Of The Lichdragon'),
      R('weapons', "Morgott's Cursed Sword"),
      R('incantations', "Fortissax's Lightning Spear"),
    ],
    places: ['mohg-omen', 'leyndell-catacombs', 'fortissax', 'deeproot'],
    characters: ['godwyn', 'morgott', 'mohg'],
  },
  {
    id: 'luna',
    number: 5,
    part: 'II. La Edad Dorada',
    era: 'Edad Dorada',
    title: 'La reina de la luna llena',
    epigraph: 'Radagon cruzó el lago para conquistarla. Volvió conquistado.',
    summary:
      'La guerra contra Caria, el amor entre Radagon y Rennala, el nacimiento de Radahn, Rykard y Ranni, y la traición que rompió a la reina.',
    cover: R('items', 'Remembrance Of The Full Moon Queen'),
    sections: [
      {
        text: [
          'En Liurnia de los Lagos gobernaba la familia real de Caria, magos que adoraban a la luna y descendían de las estrellas. Su reina, Rennala, había unido la Academia de Raya Lucaria a la corona gracias a la luna llena que invocaba. Leyndell veía en Caria un rival, y envió a un campeón de pelo rojo a someterla: Radagon.',
          'Radagon conquistó Liurnia, pero no se quedó con la victoria. Se enamoró de Rennala y se casó con ella. Para honrarla se cortó el pelo, intentó aprender sus hechizos y vivió entre los magos como uno más. De su unión nacieron tres hijos: Radahn, un gigante que aprendió a frenar las estrellas con la magia de gravedad; Rykard, ambicioso y sediento de poder; y Ranni, una niña de mirada fría a la que Rennala adoraba.',
        ],
      },
      {
        heading: 'El huevo de ámbar',
        text: [
          'Cuando Godfrey fue desterrado, Radagon abandonó Caria para convertirse en el segundo Señor de Elden y en esposo de Marika. Rennala no se recuperó jamás. Encerrada en la gran biblioteca de la Academia, se aferró a un huevo de ámbar que Radagon le había regalado, con el que podía hacer renacer a otros, y se volvió la madre de alumnos que no eran sus hijos.',
        ],
      },
      {
        heading: 'La hermana gemela',
        text: [
          'Rennala tenía una gemela, Rellana, caballero de las Lunas Gemelas, que acompañó a Messmer a la Tierra de las Sombras cuando Marika lo envió allí. Desde el Castillo Ensis vigiló la frontera de aquel mundo sellado hasta el final.',
        ],
      },
    ],
    relics: [
      R('items', 'Remembrance Of The Full Moon Queen'),
      R('weapons', 'Carian Regal Scepter'),
      R('weapons', "Rellana's Twin Blades"),
      R('talismans', "Rellana's Cameo"),
      R('items', 'Remembrance Of The Starscourge'),
    ],
    places: ['raya-lucaria', 'caria-manor', 'sote-ensis'],
    characters: ['rennala', 'radagon', 'radahn', 'rykard', 'ranni', 'rellana'],
  },
  {
    id: 'radagon',
    number: 6,
    part: 'II. La Edad Dorada',
    era: 'Edad Dorada',
    title: 'Radagon es Marika',
    epigraph: 'Hay un Señor de Elden que nunca fue otra persona.',
    summary:
      'El secreto del segundo Señor de Elden, el nacimiento de Miquella y Malenia, la podredumbre escarlata y el Árbol Hierático.',
    cover: R('items', 'Elden Remembrance'),
    sections: [
      {
        text: [
          'La estatua de Radagon en Leyndell guarda una inscripción que lo explica todo y nada: Radagon y Marika son el mismo ser. El segundo Señor de Elden era la otra mitad de la Reina Eterna, la parte que obedecía a la Orden mientras Marika empezaba a dudar de ella. Cuando Radagon se casó con Marika, la diosa se casó consigo misma.',
          'De esa unión imposible nacieron gemelos: Miquella y Malenia. Ambos eran Empíreos, candidatos a dioses, y ambos nacieron malditos. Miquella no podía crecer: sería un niño para siempre. Malenia llevaba dentro la podredumbre escarlata, la flor de un dios exterior que devoraba su cuerpo desde el nacimiento.',
        ],
      },
      {
        heading: 'El Árbol Hierático',
        text: [
          'Miquella intentó curar a su hermana. Buscó en el oro puro un remedio, forjó agujas capaces de contener a los dioses exteriores y plantó en el norte helado un árbol propio, el Árbol Hierático, para que allí nadie fuera rechazado. Malenia, mientras tanto, se convirtió en la espada más temida de las Tierras Intermedias: una guerrera manca, ciega y coja que jamás había perdido un duelo.',
          'La Orden se estaba resquebrajando por dentro. Radagon empezó a sospechar de sus propios cimientos. Y Marika, en algún lugar, ya había decidido romperla.',
        ],
      },
    ],
    relics: [
      R('items', 'Elden Remembrance'),
      R('items', 'Remembrance Of The Rot Goddess'),
      R('weapons', 'Hand of Malenia'),
      R('talismans', "Marika's Soreseal"),
      R('talismans', "Radagon's Soreseal"),
      R('weapons', 'Golden Order Greatsword'),
    ],
    places: ['haligtree', 'elphael', 'malenia'],
    characters: ['radagon', 'miquella', 'malenia'],
  },
  {
    id: 'cuchillos',
    number: 7,
    part: 'III. La Fractura',
    era: 'La Noche de los Cuchillos Negros',
    title: 'La noche de los cuchillos negros',
    epigraph: 'Ranni no quería ser diosa. Quería no tener dueño.',
    summary:
      'Ranni roba un fragmento de la Runa de la Muerte, Godwyn muere en alma, nace la muerte de los Inmortales y comienza la Fractura.',
    cover: R('spirits', 'Black Knife Tiche'),
    sections: [
      {
        text: [
          'Ranni también había sido elegida Empírea. Su guía era un Dedo menor, y su destino, servir algún día a la Voluntad Mayor. Pero Ranni no quería un destino escrito por otros. Ideó un plan para librarse de su propio cuerpo, el recipiente por el que los Dedos la controlaban.',
          'Una noche, las asesinas del Cuchillo Negro —mujeres Numen al servicio de un aliado secreto— se infiltraron en Leyndell portando un fragmento robado de la Runa de la Muerte. Con él mataron dos veces: a Godwyn el Dorado, cuya alma murió pero cuyo cuerpo siguió vivo; y a la propia Ranni, que abandonó su carne para vivir como espíritu en una muñeca. Fue el primer asesinato de un semidiós.',
          'Se discute quién estaba detrás. Ranni lo hizo; Maliketh no pudo impedirlo; y todo apunta a que Marika lo permitió o incluso lo deseó, porque al morir Godwyn la Reina Eterna enloqueció de dolor o de culpa.',
        ],
      },
      {
        heading: 'El príncipe de la muerte',
        text: [
          'El cuerpo sin alma de Godwyn fue enterrado bajo el Árbol, y desde él se extendió una corrupción nueva: las Raíces de la Muerte. Quienes las tocaban se convertían en muertos vivientes, y en todo el mundo brotaron los Inmortales que nunca debieron existir. Algunos, como Fia, la Compañera del Lecho de Muerte, soñaron con una era en la que la muerte volviera a formar parte de la vida.',
        ],
      },
      {
        heading: 'La Fractura',
        text: [
          'Fue entonces cuando Marika tomó el martillo y destrozó el Anillo de Elden. Radagon intentó repararlo con el mismo martillo y no lo consiguió. La Voluntad Mayor los encerró a ambos dentro del Árbol Áureo, la Bestia de Elden quedó libre y los fragmentos del Anillo —las Grandes Runas— cayeron en manos de los semidioses.',
        ],
      },
    ],
    relics: [
      R('spirits', 'Black Knife Tiche'),
      R('weapons', 'Black Knife'),
      R('items', 'Remembrance Of The Lichdragon'),
      R('talismans', 'Stargazer Heirloom'),
      R('items', 'Deathroot'),
    ],
    places: ['divine-tower-liurnia', 'deeproot', 'fortissax', 'three-sisters'],
    characters: ['ranni', 'godwyn', 'marika', 'fia'],
  },
  {
    id: 'fractura',
    number: 8,
    part: 'III. La Fractura',
    era: 'La Fractura',
    title: 'La guerra de los semidioses',
    epigraph: 'Ninguno ganó. Eso fue lo único que todos consiguieron.',
    summary:
      'Godrick, Rykard, Radahn, Malenia, Morgott y Mohg se enfrentan por las Grandes Runas. Caelid se pudre y las estrellas quedan detenidas.',
    cover: R('items', 'Remembrance Of The Starscourge'),
    sections: [
      {
        text: [
          'Sin dios ni Señor, los hijos de Marika se lanzaron unos contra otros. Cada uno guardaba una Gran Runa, y cada runa era un trozo de poder divino. La guerra que siguió se llamó la Fractura, y arrasó las Tierras Intermedias durante generaciones.',
          'Godrick, el más débil de la estirpe dorada, se encerró en Velo Tormentoso e injertó en su cuerpo los miembros de sus enemigos para parecer más grande. Rykard, en el Monte Gelmir, se dejó devorar por la Serpiente Devoradora de Dioses para convertirse en su señor y planeaba devorar a los propios dioses desde la Mansión del Volcán.',
        ],
      },
      {
        heading: 'La batalla de Aeonia',
        text: [
          'El choque más terrible fue el de Radahn y Malenia. Radahn, el Azote Estelar, había detenido con su gravedad las estrellas del cielo para proteger el destino de Ranni. Malenia marchó contra él desde el norte, y en el Pantano de Aeonia, al borde de la derrota, dejó florecer la podredumbre escarlata. La explosión pudrió todo Caelid. Radahn perdió la razón y vagó durante años devorando cadáveres; Malenia cayó en un sueño profundo y su fiel Finlay la cargó de vuelta al Árbol Hierático.',
        ],
      },
      {
        heading: 'El rey y el señor de la sangre',
        text: [
          'Morgott, el Augurio despreciado, se convirtió en el último defensor de Leyndell y, con el disfraz de Margit, el Augurio Caído, vigiló las puertas de Velo Tormentoso. Mohg, su gemelo, raptó al dormido Miquella de su capullo en el Árbol Hierático y lo llevó a su palacio de sangre en Mohgwyn, con la intención de convertirse en su consorte cuando el niño despertara como dios.',
          'Las Grandes Runas perdieron su brillo. La gracia se apagó en los ojos de casi todos. Y la Voluntad Mayor, desde lejos, llamó de vuelta a los desterrados.',
        ],
      },
    ],
    relics: [
      R('items', 'Remembrance Of The Grafted'),
      R('items', 'Remembrance Of The Blasphemous'),
      R('items', 'Remembrance Of The Starscourge'),
      R('items', 'Remembrance Of The Rot Goddess'),
      R('weapons', "Mohgwyn's Sacred Spear"),
      R('weapons', 'Starscourge Greatsword'),
    ],
    places: ['stormveil', 'volcano-manor', 'radahn', 'aeonia', 'mohgwyn-palace', 'morgott'],
    characters: ['godrick', 'rykard', 'radahn', 'malenia', 'morgott', 'mohg', 'miquella'],
  },
  {
    id: 'sinluz',
    number: 9,
    part: 'IV. El regreso de los Sinluz',
    era: 'El presente',
    title: 'Los muertos que volvieron',
    epigraph: 'La gracia volvió a sus ojos. Y con ella, la orden de seguirla.',
    summary:
      'Los Sinluz regresan guiados por la gracia, Melina ofrece un trato y la Mesa Redonda reúne a quienes aspiran a ser Señor de Elden.',
    cover: R('items', 'Spirit Calling Bell'),
    sections: [
      {
        text: [
          'Los Sinluz despertaron después de muertos. La gracia, la tenue luz dorada que guía a los elegidos, volvió a brillar ante ellos y les indicó un camino: reunir las Grandes Runas, entrar en el Árbol Áureo y convertirse en Señor de Elden. Uno de ellos —tú— llegó sin nombre, sin fama y sin nada, y fue derribado nada más empezar.',
          'En un lugar de gracia apareció Melina, una doncella sin dedos que le ofreció un trato: ella haría de doncella de dedos, convirtiendo las runas en fuerza, a cambio de que la llevara hasta el pie del Árbol. Le regaló a Torrent, un corcel espectral, y desapareció. Su origen es uno de los grandes misterios: muchos creen que es hija de Marika, o un fragmento de ella.',
        ],
      },
      {
        heading: 'La Mesa Redonda',
        text: [
          'En la Mesa Redonda, un refugio fuera del tiempo, los Sinluz se reúnen bajo la mirada de los Dos Dedos y de Sir Gideon Ofnir, el Omnisciente, que coleccionaba información sobre todos los semidioses. Allí, el herrero Hewg forja para ellos atado por una promesa, y una lectora de dedos llamada Enia transforma las remembranzas de los caídos en armas.',
          'Los Dos Dedos, sin embargo, temblaban. Sus mensajes llegaban confusos. La Voluntad Mayor parecía lejana, y algunos se preguntaban si seguía queriendo algo de este mundo.',
        ],
      },
    ],
    relics: [
      R('items', 'Spirit Calling Bell'),
      R('items', 'Flask Of Crimson Tears'),
      R('items', 'Remembrance Of The Grafted'),
      R('items', 'Remembrance Of The Full Moon Queen'),
    ],
    places: ['stranded-graveyard', 'church-of-elleh', 'gatefront', 'castleward-tunnel'],
    characters: ['melina', 'two-fingers', 'gideon'],
  },
  {
    id: 'estrellas',
    number: 10,
    part: 'IV. El regreso de los Sinluz',
    era: 'El presente',
    title: 'La era de las estrellas',
    epigraph: 'Una luna fría, lejos del oro y de los dedos.',
    summary:
      'La misión de Ranni: las ciudades eternas, el Cuchillo Matadedos, Astel y la promesa de una era sin dioses.',
    cover: R('items', 'Remembrance Of The Naturalborn'),
    sections: [
      {
        text: [
          'Ranni, convertida en espíritu, reunió a sus aliados en su torre: Blaidd, el medio lobo; Iji, el gigante consejero; y Seluvis, el preceptor que conspiraba a sus espaldas. Al Sinluz que aceptó servirle le encomendó encontrar el Cuchillo Matadedos, un arma capaz de herir a los mensajeros de la Voluntad Mayor.',
          'El camino pasaba por los ríos subterráneos, donde se escondían las ruinas de las ciudades eternas de Nokron y Nokstella. Sus habitantes, los Nox, habían desafiado a la Voluntad Mayor y fueron castigados con una lluvia de estrellas que los sepultó bajo tierra. Debajo de un cielo falso, siguen guardando secretos que el Árbol quiso enterrar.',
        ],
      },
      {
        heading: 'El Lago de Podredumbre',
        text: [
          'El viaje continuaba por el Lago de Podredumbre hasta la Gran Clausura, donde aguardaba Astel, Nacido del Vacío, una criatura llegada de las estrellas que había destruido una de las ciudades eternas. Más allá, en el Altar de la Luz Lunar, Ranni esperaba. Si el Sinluz completaba su misión, ella le entregaba el Mandoble de la Luna Oscura y se marchaba con él lejos del Árbol, para inaugurar una era en la que los dioses no gobernaran desde arriba.',
        ],
      },
    ],
    relics: [
      R('weapons', 'Dark Moon Greatsword'),
      R('items', 'Remembrance Of The Naturalborn'),
      R('items', 'Remembrance Of The Regal Ancestor'),
      R('talismans', 'Carian Filigreed Crest'),
      R('spirits', 'Mimic Tear Ashes'),
    ],
    places: ['three-sisters', 'nokron', 'nokstella', 'astel', 'moonlight-altar'],
    characters: ['ranni', 'astel'],
  },
  {
    id: 'llama-frenetica',
    number: 11,
    part: 'IV. El regreso de los Sinluz',
    era: 'El presente',
    title: 'La llama que lo quema todo',
    epigraph: 'Si todo sufre, que nada exista.',
    summary:
      'Los Tres Dedos, Shabriri y la Llama Frenética: la tentación de acabar con el mundo para acabar con el dolor.',
    cover: R('items', 'Remembrance of the Lord of Frenzied Flame'),
    sections: [
      {
        text: [
          'Bajo Leyndell, en lo más profundo de las cloacas, esperan los Tres Dedos. Son los rivales de los Dos Dedos: mensajeros de un dios exterior, la Llama del Caos, que predica que todas las cosas deberían volver a ser una sola, sin distinciones, sin dolor y sin vida.',
          'Shabriri, el hombre más odiado de la historia, susurra al Sinluz que la Orden es una mentira y que la única liberación es el fuego. Hyetta, una doncella ciega, se tragó uvas que eran ojos para poder ver esa llama. Quien acepta el abrazo de los Tres Dedos se convierte en Señor de la Llama Frenética y hereda un destino: quemar el mundo entero.',
          'Melina rechaza esa senda y advierte que, si la elige, ella misma lo perseguirá para impartirle su destino. Es uno de los pocos momentos en que su voz suena a amenaza.',
        ],
      },
    ],
    relics: [
      R('items', 'Remembrance of the Lord of Frenzied Flame'),
      R('incantations', "Midra's Flame of Frenzy"),
      R('weapons', 'Greatsword of Damnation'),
    ],
    places: ['mohg-omen', 'leyndell-catacombs', 'sote-midra'],
    characters: ['three-fingers', 'melina'],
  },
  {
    id: 'arder',
    number: 12,
    part: 'IV. El regreso de los Sinluz',
    era: 'El final',
    title: 'Arder el Árbol',
    epigraph: 'Para entrar en el Árbol había que quemarlo. Para quemarlo hacía falta una vida.',
    summary:
      'Morgott cae, el Gigante de Fuego muere, Melina se sacrifica, Maliketh libera la muerte y el Sinluz se enfrenta a Godfrey, Radagon y la Bestia de Elden.',
    cover: R('items', 'Remembrance Of The Black Blade'),
    sections: [
      {
        text: [
          'Morgott, el Rey Augurio, murió defendiendo un Árbol que se negaba a dejar entrar a nadie: un muro de espinas cerraba el paso. La única manera de atravesarlo era la que Marika había temido: llevar la Llama de la Ruina hasta el Árbol.',
          'El Sinluz subió a las Cumbres de los Gigantes, mató al último Gigante de Fuego y llegó a la Forja. Allí, Melina cumplió su verdadero propósito: se convirtió en la llama misma y prendió el Árbol Áureo. El fuego viajó por el mundo y el Sinluz quedó lanzado a Farum Azula, la ciudadela de los dragones.',
        ],
      },
      {
        heading: 'La Hoja Negra',
        text: [
          'En Farum Azula aguardaba Maliketh. Al vencerlo, el Sinluz liberó la Runa de la Muerte que llevaba sellada en su espada, y la Muerte Destinada regresó al mundo. Leyndell amaneció cubierta de ceniza.',
        ],
      },
      {
        heading: 'El primer y el último Señor',
        text: [
          'En la capital en ruinas esperaba Godfrey, que había vuelto como el primero de los Sinluz. Se quitó a Serosh de los hombros y luchó como Hoarah Loux, el guerrero que fue antes del oro. Tras él, dentro del Árbol, se alzó Radagon, y del cuerpo de Radagon salió la Bestia de Elden, la voluntad del Anillo hecha carne.',
        ],
      },
    ],
    relics: [
      R('items', 'Remembrance Of The Fire Giant'),
      R('items', 'Remembrance Of The Black Blade'),
      R('items', 'Remembrance Of Hoarah Loux'),
      R('items', 'Elden Remembrance'),
      R('weapons', 'Sacred Relic Sword'),
    ],
    places: ['morgott', 'fire-giant', 'forge-giants', 'farum-azula', 'maliketh', 'leyndell'],
    characters: ['morgott', 'melina', 'maliketh', 'godfrey', 'radagon', 'elden-beast', 'fia'],
  },
  {
    id: 'sombras',
    number: 13,
    part: 'V. La Tierra de las Sombras',
    era: 'Shadow of the Erdtree',
    title: 'El viaje de Miquella',
    epigraph: 'Para ser un dios bondadoso, primero renunció a todo lo que amaba.',
    summary:
      'Miquella abandona su cuerpo y entra en la Tierra de las Sombras. Messmer, Rellana y los Cornamentados; la verdad sobre Marika.',
    cover: R('items', 'Remembrance of the Impaler'),
    dlc: true,
    sections: [
      {
        text: [
          'Miquella no estaba dormido. En su capullo, mientras Mohg creía poseerlo, había ido despojándose de sí mismo: de su cuerpo, de su carne, de su amor por los suyos. Quería ser un dios sin las cadenas de su madre, y para entrar en la Tierra de las Sombras que Marika había sellado necesitaba atravesar su propio sacrificio. El Sinluz lo siguió tocando la mano que asomaba del capullo.',
          'Al otro lado se extendía un mundo que nadie recordaba. Allí se conocía a Miquella también como Santa Trina, su otra mitad, una figura del sueño y la piedad. Sus seguidores —Ansbach, Thiollier, Leda y otros— lo buscaban sin saber muy bien si lo amaban por voluntad propia o por el encanto con el que Miquella conquistaba los corazones.',
        ],
      },
      {
        heading: 'Messmer el Empalador',
        text: [
          'En el Torreón de la Sombra reinaba Messmer, el hijo que Marika envió a purgar a los Cornamentados. Encerrado allí desde la cruzada, conservaba su llama y su serpiente, y odiaba a su madre tanto como la amaba. En las ruinas que quemó, el Sinluz descubrió la historia oculta: las chamanas sacrificadas, los Cornamentados que aspiraban a la divinidad a través del Crisol, y una chamana llamada Marika que un día se convirtió en diosa.',
        ],
      },
      {
        heading: 'Dragones, dedos y frenesí',
        text: [
          'La Tierra de las Sombras guardaba más secretos. En el Pico Escarpado, Bayle el Pavoroso, un dragón que una vez desafió al propio Placidusax, esperaba una revancha que el cazador Igon ansiaba darle. En la Catedral de Manus Metyr, la Madre de los Dedos, Metyr, había perdido la voz de la Voluntad Mayor. Y en el Bosque Abisal, Midra había aceptado la Llama Frenética.',
        ],
      },
    ],
    relics: [
      R('items', 'Remembrance of the Impaler'),
      R('items', 'Remembrance of the Twin Moon Knight'),
      R('items', 'Remembrance of the Mother of Fingers'),
      R('items', 'Remembrance of the Dancing Lion'),
      R('talismans', "St. Trina's Smile"),
      R('weapons', 'Velvet Sword of St. Trina'),
    ],
    places: [
      'sote-gravesite',
      'sote-belurat',
      'sote-shadow-keep',
      'sote-messmer',
      'sote-bayle',
      'sote-midra',
    ],
    characters: ['miquella', 'messmer', 'rellana', 'st-trina'],
  },
  {
    id: 'consorte',
    number: 14,
    part: 'V. La Tierra de las Sombras',
    era: 'Shadow of the Erdtree',
    title: 'El consorte prometido',
    epigraph: 'El amor que Miquella dejó atrás fue lo único que pudo detenerlo.',
    summary:
      'Romina y el Árbol Sellado, la subida a Enir-Ilim y el combate final contra Radahn, Consorte Prometido.',
    cover: R('items', 'Remembrance of a God and a Lord'),
    dlc: true,
    sections: [
      {
        text: [
          'Para llegar a la Puerta Divina, el Sinluz tuvo que derrotar a Romina, Santa del Brote, y quemar el Árbol Sellado con la llama de Messmer. Más allá se alzaba Enir-Ilim, la ciudad-torre construida por los Cornamentados para alcanzar la divinidad, ahora transformada en el camino de Miquella hacia el trono.',
          'En la cima esperaba Miquella, ya casi dios. A su lado estaba su consorte prometido: Radahn. Miquella había hecho renacer el alma del Azote Estelar en el cuerpo de Mohg, el señor de la sangre que lo había raptado. Juntos, el dios niño y el general que detuvo las estrellas pretendían abrir una nueva era de bondad.',
        ],
      },
      {
        heading: 'El final del viaje',
        text: [
          'Pero esa bondad era impuesta. Quien se acercaba a Miquella acababa amándolo sin poder evitarlo, y muchos de sus fieles descubrieron, al ver caer su encanto, que nunca habían elegido seguirle. Ansbach y otros se rebelaron. El Sinluz se enfrentó a Radahn, Consorte Prometido, en el combate más duro de su viaje.',
          'Cuando Radahn cayó, Miquella también perdió su ascensión. En sus últimas palabras, el dios que había renunciado al amor pareció recordar a su hermana. El trono de la Tierra de las Sombras quedó vacío, y el Sinluz regresó a las Tierras Intermedias con la verdad sobre Marika en las manos.',
        ],
      },
    ],
    relics: [
      R('items', 'Remembrance of a God and a Lord'),
      R('items', 'Remembrance of the Saint of the Bud'),
      R('weapons', 'Greatsword of Radahn (Lord)'),
      R('incantations', 'Light of Miquella'),
      R('weapons', 'Obsidian Lamina'),
    ],
    places: ['sote-romina', 'sote-enir', 'sote-radahn'],
    characters: ['miquella', 'radahn', 'mohg'],
  },
]

export const CHARACTERS: LoreCharacter[] = [
  {
    id: 'greater-will',
    name: 'La Voluntad Mayor',
    title: 'Dios exterior del orden',
    bio: 'Entidad divina lejana que envió la estrella dorada con la Bestia de Elden. Gobierna a través de sus Dedos y de los Empíreos que elige.',
  },
  {
    id: 'elden-beast',
    name: 'La Bestia de Elden',
    title: 'El Anillo de Elden',
    bio: 'Criatura de luz enviada por la Voluntad Mayor. Es el propio Anillo y la última barrera del juego base.',
    portrait: R('items', 'Elden Remembrance'),
  },
  {
    id: 'two-fingers',
    name: 'Los Dos Dedos',
    title: 'Mensajeros de la Voluntad Mayor',
    bio: 'Guían a los Empíreos y a los Sinluz. En la era actual sus mensajes son confusos: parecen haber perdido contacto con su dios.',
  },
  {
    id: 'placidusax',
    name: 'Placidusax',
    title: 'Señor Dragón',
    bio: 'Antiguo Señor de Elden de la era de los dragones. Espera en el ojo de la tormenta de Farum Azula a un dios que lo abandonó.',
    portrait: R('items', 'Remembrance Of The Dragonlord'),
  },
  {
    id: 'marika',
    name: 'Marika',
    title: 'La Reina Eterna',
    bio: 'Chamana de la Tierra de las Sombras convertida en diosa. Creó la Orden Áurea y después la destrozó al romper el Anillo.',
    portrait: R('items', 'Elden Remembrance'),
  },
  {
    id: 'radagon',
    name: 'Radagon',
    title: 'Segundo Señor de Elden',
    bio: 'Campeón de pelo rojo, esposo de Rennala y luego de Marika. Es la otra mitad de la propia Marika.',
    portrait: R('items', 'Elden Remembrance'),
  },
  {
    id: 'godfrey',
    name: 'Godfrey / Hoarah Loux',
    title: 'Primer Señor de Elden',
    bio: 'Guerrero conquistador desterrado al perder la gracia. Vuelve como el primero de los Sinluz y lucha sin Serosh como Hoarah Loux.',
    portrait: R('items', 'Remembrance Of Hoarah Loux'),
  },
  {
    id: 'maliketh',
    name: 'Maliketh',
    title: 'La Hoja Negra',
    bio: 'Bestia sombra de Marika que guardaba la Runa de la Muerte. Vivía oculto como Gurranq, el clérigo bestia del Santuario Bestial; su verdadera forma aguarda en Farum Azula.',
    portrait: R('items', 'Remembrance Of The Black Blade'),
  },
  {
    id: 'fire-giant',
    name: 'El Gigante de Fuego',
    title: 'Guardián de la Llama de la Ruina',
    bio: 'Último de los Gigantes, maldito por Marika a vigilar la llama capaz de quemar el Árbol Áureo.',
    portrait: R('items', 'Remembrance Of The Fire Giant'),
  },
  {
    id: 'godwyn',
    name: 'Godwyn el Dorado',
    title: 'Primer semidiós caído',
    bio: 'Hijo amado de Marika y Godfrey. Su alma murió en la Noche de los Cuchillos Negros y su cuerpo se convirtió en el Príncipe de la Muerte.',
  },
  {
    id: 'lynx',
    name: 'Lynx',
    title: 'Hijo del rayo, general de Caria y del Árbol Hierático',
    bio: 'Hijo secreto de Godwyn y la dragona Lansseax, criado por Rennala como pupilo de la casa de la luna. Fue la Espada de Rennala, maestro de Radahn y amor de Rellana. Destruyó a la Reina de los Ojos Velados, fundó Andrax y fue general absoluto del Árbol Hierático. Se apartó de Miquella en Aeonia y dio su alma a la noche en Nokstella para salvar a sus hijos, Aldren y Nyra. Su alma cayó como una estrella en la Tierra de las Sombras, donde vivió siglos sin memoria protegiendo a los Cornudos. Allí lo reencontraron Edda, que resultó ser su hija Nyra, y la mitad de Rellana que guardaba Castillo Ensis. Recuperó sus recuerdos, luchó contra Radahn en Enir-Ilim y volvió al mundo cuando se apagó la última brasa de Marika.',
  },
  {
    id: 'morgott',
    name: 'Morgott',
    title: 'El Rey Augurio',
    bio: 'Augurio despreciado que defendió Leyndell y el Árbol hasta el final. Vigilaba a los Sinluz disfrazado de Margit.',
    portrait: R('items', 'Remembrance Of The Omen King'),
  },
  {
    id: 'mohg',
    name: 'Mohg',
    title: 'Señor de la Sangre',
    bio: 'Gemelo de Morgott. Adoró a un dios exterior de la sangre, raptó a Miquella y fundó la dinastía de Mohgwyn.',
    portrait: R('weapons', "Mohgwyn's Sacred Spear"),
  },
  {
    id: 'rennala',
    name: 'Rennala',
    title: 'Reina de la Luna Llena',
    bio: 'Reina de Caria. Abandonada por Radagon, vive aferrada al huevo de ámbar en la biblioteca de Raya Lucaria.',
    portrait: R('items', 'Remembrance Of The Full Moon Queen'),
  },
  {
    id: 'rellana',
    name: 'Rellana',
    title: 'Caballero de las Lunas Gemelas',
    bio: 'Gemela de Rennala y amor de toda la vida de Lynx, con quien se casó en la Iglesia de los Votos. Su juramento la partió en dos: una mitad guardó Castillo Ensis para Messmer, que la amó sin ser correspondido, y la otra murió defendiendo el puente del sur después de dar a luz a Aldren y Nyra. En la Tierra de las Sombras, la mitad que quedaba reconoció a Lynx por las manos y recuperó los recuerdos de las dos.',
    portrait: R('items', 'Remembrance of the Twin Moon Knight'),
    dlc: true,
  },
  {
    id: 'radahn',
    name: 'Radahn',
    title: 'El Azote Estelar',
    bio: 'Hijo de Radagon y Rennala. Detuvo las estrellas con su gravedad; enloqueció por la podredumbre en Aeonia y renace como Consorte Prometido.',
    portrait: R('items', 'Remembrance Of The Starscourge'),
  },
  {
    id: 'rykard',
    name: 'Rykard',
    title: 'Señor de la Blasfemia',
    bio: 'Se dejó devorar por la Serpiente Devoradora de Dioses para devorar a su vez a los dioses desde la Mansión del Volcán.',
    portrait: R('items', 'Remembrance Of The Blasphemous'),
  },
  {
    id: 'ranni',
    name: 'Ranni',
    title: 'La Bruja',
    bio: 'Empírea que mató su propio cuerpo para librarse de los Dedos. Busca una Era de las Estrellas lejos del Árbol.',
  },
  {
    id: 'godrick',
    name: 'Godrick',
    title: 'El Injertado',
    bio: 'El más débil de la estirpe dorada. Injerta miembros ajenos en su cuerpo para aparentar grandeza en Velo Tormentoso.',
    portrait: R('items', 'Remembrance Of The Grafted'),
  },
  {
    id: 'miquella',
    name: 'Miquella',
    title: 'El Bondadoso',
    bio: 'Empíreo eternamente niño. Creó el Árbol Hierático para su hermana y abandonó todo lo que amaba para convertirse en dios.',
    portrait: R('items', "Miquella's Great Rune"),
  },
  {
    id: 'st-trina',
    name: 'Santa Trina',
    title: 'La otra mitad de Miquella',
    bio: 'Figura del sueño y la piedad venerada en secreto. Es otro aspecto del propio Miquella.',
    portrait: R('talismans', "St. Trina's Smile"),
    dlc: true,
  },
  {
    id: 'malenia',
    name: 'Malenia',
    title: 'Espada de Miquella',
    bio: 'Gemela de Miquella, portadora de la podredumbre escarlata. Nunca perdió un duelo; su flor arrasó Caelid.',
    portrait: R('items', 'Remembrance Of The Rot Goddess'),
  },
  {
    id: 'messmer',
    name: 'Messmer',
    title: 'El Empalador',
    bio: 'Hijo de Marika con una serpiente en su interior. Dirigió la cruzada contra los Cornamentados y quedó sellado en la Tierra de las Sombras.',
    portrait: R('items', 'Remembrance of the Impaler'),
    dlc: true,
  },
  {
    id: 'melina',
    name: 'Melina',
    title: 'La doncella sin dedos',
    bio: 'Guía del Sinluz. Convierte las runas en fuerza y se sacrifica en la Forja de los Gigantes para quemar el Árbol.',
  },
  {
    id: 'gideon',
    name: 'Gideon Ofnir',
    title: 'El Omnisciente',
    bio: 'Líder de la Mesa Redonda. Reunió todo el saber sobre los semidioses con la ambición de ser Señor de Elden.',
  },
  {
    id: 'fia',
    name: 'Fia',
    title: 'Compañera del Lecho de Muerte',
    bio: 'Busca restaurar la muerte de los Inmortales y abrir la Era de los Nacidos del Ocaso.',
  },
  {
    id: 'three-fingers',
    name: 'Los Tres Dedos',
    title: 'Mensajeros de la Llama Frenética',
    bio: 'Rivales de los Dos Dedos. Ofrecen convertir al Sinluz en Señor de la Llama Frenética.',
    portrait: R('items', 'Remembrance of the Lord of Frenzied Flame'),
  },
  {
    id: 'astel',
    name: 'Astel',
    title: 'Nacido del Vacío',
    bio: 'Criatura llegada de las estrellas que destruyó una ciudad eterna. Guarda el camino hacia el Altar de la Luz Lunar.',
    portrait: R('items', 'Remembrance Of The Naturalborn'),
  },
]

/** Capítulos con sus episodios adicionales (lore-extra.ts) intercalados antes de la última sección. */
export const CHAPTERS: LoreChapter[] = BASE_CHAPTERS.map((c) => {
  const extra = EXTRA_SECTIONS[c.id] ?? []
  if (!extra.length) return c
  const last = c.sections.length > 1 ? c.sections.length - 1 : c.sections.length
  return { ...c, sections: [...c.sections.slice(0, last), ...extra, ...c.sections.slice(last)] }
})

export const CHARACTER_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]))
export const LORE_BY_ID = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]))
