import { CHAPTERS } from './index'

/**
 * Contenido editorial de «El Anillo Roto»: páginas preliminares, epígrafes de cada libro y apéndices.
 * Todos los textos son originales (los epígrafes se atribuyen a voces ficticias del mundo de la novela).
 */

export const EDICION = {
  /** Nombre del autor en la portada y los créditos (vacío = no se muestra) */
  autor: '',
  sello: 'Ediciones Sendero de Gracia',
  coleccion: 'Crónicas de las Tierras Intermedias',
  edicion: 'Primera edición',
  dedicatoria: 'A quienes murieron cien veces ante el mismo enemigo\ny se levantaron una vez más.',
  epigrafe: {
    texto:
      'Levántate, Sinluz. Aunque nadie te espere, aunque la gracia te haya olvidado, aunque el camino que te queda sea más largo que el que dejaste atrás: levántate.',
    fuente: 'Inscripción anónima de la Capilla de la Anticipación',
  },
}

/** Epígrafe de la portadilla de cada libro (índice = número de libro) */
export const EPIGRAFES_LIBRO: Record<number, { texto: string; fuente: string }> = {
  1: {
    texto:
      'Antes del oro hubo piedra, y antes de la piedra, tormenta. Nadie recuerda la tormenta, porque nadie sobrevivió a ella para cantarla.',
    fuente: 'Letanía de los clérigos bestia de Azula',
  },
  2: {
    texto: 'Toda edad dorada se levanta sobre algo que se prefiere no mirar.',
    fuente: 'Nota al margen de un archivista de Leyndell',
  },
  3: {
    texto: 'Un anillo no se rompe de una vez. Se rompe primero en el corazón de quien lo lleva.',
    fuente: 'Proverbio de las Tierras Intermedias',
  },
  4: {
    texto:
      'Los muertos que vuelven no traen respuestas. Traen las preguntas que nadie se atrevió a hacer en vida.',
    fuente: 'Atribuido a una doncella de dedos sin nombre',
  },
  5: {
    texto: 'Lo que se borra de los mapas no deja de existir. Solo deja de ser perdonado.',
    fuente: 'Dicho de los Cornamentados de la Tierra de las Sombras',
  },
  6: {
    texto:
      'Para que crezca un árbol nuevo, alguien tiene que quemar el viejo, y quedarse a mirar cómo arde.',
    fuente: 'Palabras atribuidas a Melina',
  },
}

export interface GlossaryEntry {
  termino: string
  definicion: string
}

export const GLOSARIO: GlossaryEntry[] = [
  {
    termino: 'Anillo de Elden',
    definicion:
      'Constelación de runas que contiene las leyes del mundo según la Voluntad Mayor. Su rotura a manos de Marika desencadena la Fractura.',
  },
  {
    termino: 'Árbol Áureo',
    definicion:
      'Árbol inmenso y dorado que brotó con la ascensión de Marika en la Meseta de Altus. Símbolo y sostén de la Orden; a sus raíces regresan las almas de los muertos.',
  },
  {
    termino: 'Árbol Hierático',
    definicion:
      'Árbol que Miquella hizo crecer en el norte helado como alternativa al Árbol Áureo, para acoger a los despreciados por la Orden.',
  },
  {
    termino: 'Árbol Umbrío',
    definicion:
      'Árbol de la Tierra de las Sombras, hermano oscuro del Áureo, del que brotaron los primeros dones de Marika.',
  },
  {
    termino: 'Augurio',
    definicion:
      'Niño nacido con cuernos en el linaje dorado. La Orden los consideraba malditos y los encerraba en las cloacas de Leyndell desde su nacimiento.',
  },
  {
    termino: 'Brillo',
    definicion:
      'Piedra azul que conserva la luz de las estrellas. Los hechiceros de Liurnia la usan como fuente de su magia.',
  },
  {
    termino: 'Ciudades eternas',
    definicion:
      'Nokron y Nokstella, ciudades subterráneas de un pueblo que desafió a la Voluntad Mayor y fue castigado bajo un cielo de estrellas falsas.',
  },
  {
    termino: 'Cornamentados',
    definicion:
      'Pueblo de la Tierra de las Sombras, cuyos miembros nacen con cuernos. Víctimas de la cruzada de Messmer.',
  },
  {
    termino: 'Dedos',
    definicion:
      'Seres pálidos y alargados que transmiten la voluntad de los dioses exteriores. Los Dos Dedos sirven a la Voluntad Mayor; los Tres Dedos, a la Llama Frenética.',
  },
  {
    termino: 'Doncella de dedos',
    definicion:
      'Guía que acompaña a un Sinluz, convierte sus runas en fuerza y lo conduce hacia el Árbol.',
  },
  {
    termino: 'Empíreo',
    definicion:
      'Ser elegido por los Dedos como candidato a la divinidad. Marika, Ranni y Miquella lo fueron.',
  },
  {
    termino: 'Era de las Estrellas',
    definicion: 'Nueva era sin el Árbol ni la Voluntad Mayor, guiada por la luna fría de Ranni.',
  },
  {
    termino: 'Fractura',
    definicion:
      'Guerra entre los semidioses que sigue a la rotura del Anillo, librada por la posesión de las Grandes Runas.',
  },
  {
    termino: 'Gracia',
    definicion:
      'Luz dorada que guía a los Sinluz. Se manifiesta como un resplandor tenue que señala el camino y como lugares de descanso donde reponer fuerzas.',
  },
  {
    termino: 'Gran Runa',
    definicion:
      'Cada uno de los fragmentos mayores del Anillo de Elden, que eligieron a los semidioses tras la rotura y les otorgaron un poder inmenso.',
  },
  {
    termino: 'Llama de la Ruina',
    definicion:
      'Fuego capaz de quemar el Árbol Áureo, custodiado durante eras por el último de los gigantes en lo alto de su forja.',
  },
  {
    termino: 'Llama Frenética',
    definicion:
      'Fuego amarillo de la locura que promete disolver todas las cosas en una sola, sin sufrimiento ni distinción.',
  },
  {
    termino: 'Los que viven en la muerte',
    definicion:
      'Muertos que se levantan donde brota la Raíz de la Muerte. Ni vivos ni muertos, la Orden los persigue como aberraciones.',
  },
  {
    termino: 'Mausoleo Errante',
    definicion:
      'Campanario de piedra sobre patas gigantescas que recorre el mundo tañendo sus campanas para llamar al alma perdida de Godwyn.',
  },
  {
    termino: 'Mesa Redonda',
    definicion:
      'Refugio de los Sinluz, fuera del tiempo y del espacio, donde se reúnen los aspirantes a Señor de Elden.',
  },
  {
    termino: 'Orden Áurea',
    definicion: 'Fe y ley fundadas por Marika en torno al Árbol Áureo y el Anillo de Elden.',
  },
  {
    termino: 'Podredumbre escarlata',
    definicion:
      'Plaga carmesí que corrompe la carne y la tierra. Malenia la lleva dentro desde su nacimiento.',
  },
  {
    termino: 'Raíz de la Muerte',
    definicion:
      'Raíz negra que brota allí donde las raíces del Árbol tocan la muerte del Príncipe Godwyn.',
  },
  {
    termino: 'Runa de la Muerte',
    definicion:
      'Ley de la muerte arrancada del Anillo por Marika y custodiada por Maliketh en su hoja negra. Su robo hizo posible la Noche de los Cuchillos Negros.',
  },
  {
    termino: 'Señor de Elden',
    definicion:
      'Consorte de la Reina Eterna y portador del Anillo. Godfrey fue el primero; Radagon, el segundo.',
  },
  {
    termino: 'Sinluz',
    definicion:
      'Guerreros a quienes la gracia abandonó y desterró, y que, muertos, son llamados de nuevo por ella para regresar a las Tierras Intermedias.',
  },
  {
    termino: 'Tierra de las Sombras',
    definicion:
      'Región sellada y borrada de los mapas por Marika, donde nació su divinidad y donde Messmer quedó prisionero.',
  },
  {
    termino: 'Voluntad Mayor',
    definicion:
      'Dios exterior y lejano que envió la estrella dorada con la Bestia de Elden y gobierna a través de sus Dedos.',
  },
]

/** Cada era abarca de un capítulo a otro (por slug): los números se calculan, así no se desfasan al insertar capítulos */
export interface ChronologyEntry {
  era: string
  hechos: string
  desde: string
  hasta: string
}

export const CRONOLOGIA: ChronologyEntry[] = [
  {
    era: 'Era de los Dragones',
    hechos:
      'Placidusax reina desde Farum Azula. Cae la estrella dorada con la Bestia de Elden, que entra en su consorte y se marcha al oeste. Rebelión de Bayle y nacimiento de la Comunión Dracónica.',
    desde: '01-la-tormenta',
    hasta: '01a-el-draco-negro',
  },
  {
    era: 'Era del Crisol',
    hechos:
      'La vida brota sin forma en el crisol mientras la luz del oeste espera. Caída de las ciudades de los Nox. En la Tierra de las Sombras, una chamana llamada Marika es elegida por los Dedos.',
    desde: '01b-el-crisol',
    hasta: '04-la-puerta-divina',
  },
  {
    era: 'Albor del Árbol',
    hechos:
      'Ascensión de Marika. Guerra contra los gigantes y sellado de la Llama de la Ruina. Cacería de dioses de la Reina de los Ojos Lóbregos.',
    desde: '05-los-gigantes',
    hasta: '06-ojos-lobregos',
  },
  {
    era: 'Nacimiento de la Orden',
    hechos:
      'Marika arranca la Runa de la Muerte del Anillo; Maliketh la sella en la Hoja Negra. Primer Entierro en el Árbol.',
    desde: '06b-la-hoja-negra',
    hasta: '06b-la-hoja-negra',
  },
  {
    era: 'Edad Dorada',
    hechos:
      'La Abundancia. Godwyn hace las paces con los dragones. Cruzada de Messmer y sellado de la Tierra de las Sombras. Guerras de Liurnia.',
    desde: '07-la-abundancia',
    hasta: '10-las-guerras-de-liurnia',
  },
  {
    era: 'Destierro de Godfrey',
    hechos:
      'Los primeros Sinluz son expulsados. Radagon abandona a Rennala y se convierte en el segundo Señor de Elden. Nacen Miquella y Malenia.',
    desde: '11-la-larga-marcha',
    hasta: '13-el-nino-que-no-crecia',
  },
  {
    era: 'La Fractura',
    hechos:
      'Noche de los Cuchillos Negros y muerte de Godwyn. Marika rompe el Anillo. Guerra de los semidioses. Batalla de Aeonia.',
    desde: '14-los-cuchillos-negros',
    hasta: '18-aeonia',
  },
  {
    era: 'Regreso de los Sinluz',
    hechos:
      'La gracia llama a los muertos. Edda recorre las Tierras Intermedias y desciende a Mohgwyn.',
    desde: '19-la-capilla',
    hasta: '30-el-senor-de-la-sangre',
  },
  {
    era: 'Tierra de las Sombras',
    hechos:
      'Edda sigue a Miquella al reino sellado. Caída de Messmer, de Romina y del Consorte Prometido.',
    desde: '31-la-llanura-de-las-tumbas',
    hasta: '38-enir-ilim',
  },
  {
    era: 'La llama de la ruina',
    hechos:
      'Ascenso a la Forja de los Gigantes. Quema del Árbol. Farum Azula, la Capital de Ceniza y el interior del Árbol.',
    desde: '39-las-cumbres',
    hasta: '44-dentro-del-arbol',
  },
  {
    era: 'Después',
    hechos: 'Nace una nueva era. Las ramas de lo que pudo haber sido.',
    desde: '45-la-era-de-las-estrellas',
    hasta: '46-epilogo',
  },
]

/** «5–8» a partir de los slugs de la entrada */
export function capitulosDe(e: ChronologyEntry): string {
  const a = CHAPTERS.findIndex((c) => c.slug === e.desde) + 1
  const b = CHAPTERS.findIndex((c) => c.slug === e.hasta) + 1
  return a === b ? `${a}` : `${a}–${b}`
}

export const NOTA_EDITORIAL = [
  'El Anillo Roto reúne en un solo relato, contado en orden cronológico, la historia que el mundo de Elden Ring dispersa en descripciones de objetos, diálogos fragmentarios y ruinas silenciosas. Donde las fuentes callan o se contradicen, la novela elige una interpretación y la cuenta como verdad; los lectores atentos encontrarán en cada capítulo la huella de las teorías que la comunidad ha construido durante años.',
  'Los diálogos son recreaciones libres. Los personajes secundarios —sepultureros, centinelas, carceleros, ayudas de cámara— son invención de esta edición, añadidos para mirar los grandes acontecimientos desde la altura de quienes los sufrieron.',
  'La protagonista de la cuarta parte, Edda, es una Sinluz sin rostro ni historia en el juego: cualquier jugador podría ocupar su lugar. Esa es, quizá, la intención.',
]

const UNIDADES = [
  'cero',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
]
const DECENAS = [
  '',
  '',
  '',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa',
]

/** Número en letras (1–99), como en los titulillos de capítulo de una edición cuidada */
export function numeroEnLetras(n: number): string {
  if (n < 30) return UNIDADES[n]
  const d = Math.floor(n / 10),
    u = n % 10
  return u ? `${DECENAS[d]} y ${UNIDADES[u]}` : DECENAS[d]
}
