import type { LoreSection } from './lore'

/** Episodios adicionales de cada capítulo (se añaden al final de sus secciones). */
export const EXTRA_SECTIONS: Record<string, LoreSection[]> = {
  dragones: [
    {
      heading: 'El culto del dragón',
      text: [
        'No todos los dragones murieron luchando. Lansseax, una dragona antigua de rayo rojo, aceptó vivir dentro de la Orden y se convirtió en protectora de la capital. De aquella alianza nació el culto del dragón de Leyndell: caballeros que aprendían a invocar el rayo antiguo y lo usaban en nombre del Árbol. Las oraciones del rayo de los dragones, que todavía se enseñan, son la prueba de que el oro no solo derrotó a la tormenta, sino que también la domesticó.',
        'Otros dragones más jóvenes, sin la sabiduría de los antiguos, se refugiaron en las ruinas y los acantilados de Caelid y Liurnia. Allí siguen, viejos y hambrientos, devorando a los incautos. Algunos humanos aprendieron a arrancarles el corazón y comérselo para obtener su aliento: es la Comunión Dracónica, una herejía que convierte lentamente en dragón a quien la practica.',
      ],
    },
    {
      heading: 'Las ciudades bajo tierra',
      text: [
        'Antes del Árbol existió también otra civilización: los Nox, habitantes de ciudades eternas que miraban a las estrellas y no a los dioses. Cuando desafiaron a la Voluntad Mayor fueron castigados; las estrellas cayeron sobre ellos y sus ciudades se hundieron bajo tierra. Allí, bajo un cielo pintado que imitaba la noche, siguieron viviendo los que sobrevivieron, enmascarados y fieles a sus antiguos secretos.',
      ],
    },
  ],
  marika: [
    {
      heading: 'La Puerta Divina',
      text: [
        'Los Cornamentados habían levantado en el corazón de su tierra una torre llamada Enir-Ilim, coronada por la Puerta Divina: el lugar donde un ser podía convertirse en dios. Ellos mismos aspiraban a cruzarla. Fue Marika quien lo consiguió, y desde ese momento el resto del mundo empezó a contar la historia a partir de ella.',
        'Los historiadores del juego no se ponen de acuerdo en todo. Unos ven en Marika a una libertadora que se vengó de sus opresores; otros, a una diosa que reprodujo con creces la crueldad que había sufrido. Lo único seguro es que todo lo que sabían las Tierras Intermedias sobre su reina había sido cuidadosamente escogido por ella.',
      ],
    },
  ],
  gigantes: [
    {
      heading: 'El señor de la tormenta',
      text: [
        'Antes de que Godrick se encerrara en sus murallas, Velo Tormentoso pertenecía a un señor de la tormenta que dominaba los vientos de Necrolimbo. Godfrey lo derrotó y la tormenta, que hasta entonces protegía el castillo, quedó como un eco que todavía sopla en las torres. Los ventarrones de Stormhill son, en cierto modo, el último aliento de aquel señor.',
      ],
    },
    {
      heading: 'La Reina de los Ojos Lóbregos',
      text: [
        'Entre los enemigos de la Orden hubo una diosa que dominaba la llama negra: la Reina de los Ojos Lóbregos. Sus apóstoles, los Piel de Dios, vestían la piel de los dioses que mataban y cantaban a una muerte que no conocía el renacimiento. Maliketh la persiguió hasta el final y la derrotó, pero los Piel de Dios sobrevivieron. Cuando la Orden empezó a desmoronarse, volvieron a aparecer en las torres divinas y en las ruinas de Farum Azula.',
      ],
    },
    {
      heading: 'Las bestias de Farum Azula',
      text: [
        'Maliketh no estaba solo. Las bestias de Farum Azula, criaturas de pelaje gris y fe sencilla, le servían como clérigos. Cuando la Runa de la Muerte le fue arrebatada en parte, Maliketh se ocultó bajo la forma humilde de Gurranq, un clérigo bestia enloquecido que devora raíces de la muerte en el Santuario Bestial y pide a los viajeros que le traigan más. Su hambre era su penitencia.',
      ],
    },
  ],
  augurios: [
    {
      heading: 'Las cloacas',
      text: [
        'Bajo la capital corren las Cloacas de los Repudiados, una red de túneles donde la Orden arrojaba lo que no quería ver. Allí crecieron Morgott y Mohg, rodeados de Augurios a los que se les cortaban los cuernos al nacer, en un ritual tan doloroso que muchos morían. Los que sobrevivían quedaban marcados para siempre; los que conservaban los cuernos eran encadenados.',
        'Morgott aprendió en aquella oscuridad una lealtad inexplicable. Amó a la Orden que lo humillaba y juró protegerla. Mohg encontró otra cosa: en lo más profundo de las cloacas escuchó a la Madre Informe, un dios exterior que se alimentaba de sangre y dolor, y aprendió a prender su propia sangre como una llama.',
      ],
    },
    {
      heading: 'El príncipe y el dragón',
      text: [
        'Godwyn, en cambio, creció bajo el sol. Cuentan que se batió con el dragón Fortissax y, en lugar de matarlo, se ganó su amistad. Aquella imagen —el príncipe dorado y el dragón de rayo uno junto al otro— fue durante siglos el símbolo de lo que la Orden podía llegar a ser. Nadie imaginaba que Fortissax acabaría luchando dentro del sueño de su amigo muerto, intentando contener la Muerte que brotaba de él.',
      ],
    },
  ],
  luna: [
    {
      heading: 'La Academia de Raya Lucaria',
      text: [
        'En el centro del gran lago se alzaba la Academia de Raya Lucaria, donde los hechiceros estudiaban el brillo: piedras que contienen la luz de las estrellas y que, según sus maestros, eran los restos de vida estelar. Los más ambiciosos se clavaban piedras de brillo en el cráneo para acercarse al cosmos. Algunos, como los Hechiceros primigenios Lusat y Azur, llegaron tan lejos que se convirtieron en piedra mientras contemplaban el vacío.',
        'La Academia y la familia real de Caria se habían enfrentado durante generaciones. Rennala consiguió unirlas cuando invocó la luna llena sobre el lago: los magos se arrodillaron ante ella y la Academia se convirtió en su corte. Esa misma luna fue la que, años después, se apagaría en su mirada.',
      ],
    },
    {
      heading: 'El aprendizaje de Radahn',
      text: [
        'Radahn admiraba a los hombres de la guerra y quería luchar a lomos de su querido caballo Leonard. Era demasiado grande para él, así que viajó a Sellia, la ciudad de la hechicería, y aprendió la magia de la gravedad solo para no aplastar a su montura. Con el tiempo, esa misma magia le permitió contener las estrellas del cielo, que se habían detenido por él.',
      ],
    },
  ],
  radagon: [
    {
      heading: 'La reina que se casó consigo misma',
      text: [
        'En los muros de la capital, la estatua de Radagon sostiene el martillo con el que intentó reparar el Anillo. Su pelo rojo, que se cortó por Rennala, volvió a crecer tras abandonar Caria. Muchos lo ven como un detalle sin importancia; otros, como la señal de que Radagon volvió a ser plenamente lo que siempre había sido: una parte de Marika que obedecía cuando la diosa ya no quería obedecer.',
      ],
    },
    {
      heading: 'Oro puro',
      text: [
        'Miquella creyó que el oro puro, despojado de cualquier dios exterior, podía liberar a su hermana de la podredumbre. Forjó agujas capaces de contener el poder de los dioses rivales y fundó en el Árbol Hierático una orden de caballeros, entre ellos Loretta, la arquera de la luna, que custodiaba su capilla. En Elphael, la base del árbol, vivían los marginados que nadie quería: Augurios, albinaúricos, deformes. Durante un tiempo, el Árbol Hierático fue lo más parecido a un refugio.',
      ],
    },
  ],
  cuchillos: [
    {
      heading: 'Las asesinas',
      text: [
        'Las asesinas del Cuchillo Negro eran mujeres Numen, el mismo linaje del que se decía que procedía Marika. Sus armas estaban impregnadas del fragmento de la Runa de la Muerte que Ranni robó a Maliketh. Tras aquella noche, sus cuerpos fueron enterrados en catacumbas, y sus espíritus siguen apareciendo cerca de las tumbas de los héroes, como si continuaran vigilando algo.',
      ],
    },
    {
      heading: 'Los muertos que no mueren',
      text: [
        'De las raíces de Godwyn nacieron los Inmortales: seres que habían muerto pero no podían descansar. La Orden los perseguía y los encerraba. Un hombre llamado D, Cazador de los Muertos, y su gemelo dedicaron su vida a exterminarlos. Pero hubo quien vio en ellos otra cosa: Fia, la Compañera del Lecho de Muerte, abrazaba a los Sinluz para darles un poco de su vida, y soñaba con un mundo en el que la muerte volviera a ser parte natural de las cosas.',
        'Fia buscaba la Runa de la Muerte que faltaba para restaurar a Godwyn: no para devolverlo a la vida, sino para que muriera de verdad, como un príncipe de la muerte que llevara a los Inmortales a su descanso.',
      ],
    },
  ],
  fractura: [
    {
      heading: 'Velo Tormentoso',
      text: [
        'Godrick el Injertado fue el primer semidiós que los Sinluz encontraron. Descendiente de la sangre dorada de Godfrey, era débil y lo sabía, y por eso injertaba en su cuerpo brazos y cabezas de los vencidos. En su trono, rodeado de un ejército de soldados y monstruos injertados, esperaba a que alguien se arrodillara. Su Gran Runa era la más modesta de todas.',
      ],
    },
    {
      heading: 'La Mansión del Volcán',
      text: [
        'En el Monte Gelmir, Rykard fundó una orden de Recusantes: Sinluz que rechazaban la Orden Áurea y cazaban a los que la servían. Su esposa, Tanith, lo amó incluso cuando la serpiente lo devoró, y mantuvo viva la Mansión del Volcán como si su señor siguiera en el trono. Rykard no había muerto: vivía dentro de la serpiente, un dios blasfemo que había decidido comerse el mundo antes de dejar que lo gobernaran.',
      ],
    },
    {
      heading: 'El último defensor',
      text: [
        'Mientras tanto, Morgott se convirtió en el Rey Augurio. Con su espada maldita, forjada con su propia sangre, defendió Leyndell de todos los que querían tomarla, incluidos los propios hijos de Marika. Con el disfraz de Margit, el Augurio Caído, esperaba a los Sinluz en las puertas de Velo Tormentoso para ponerlos a prueba. Si no merecían el Árbol, morían allí.',
      ],
    },
  ],
  sinluz: [
    {
      heading: 'Otros Sinluz',
      text: [
        'El protagonista no era el único que volvía. En el camino se cruza con otros como él: Nepheli Loux, una guerrera que busca su lugar; Kenneth Haight, que quiere recuperar sus tierras; Alexander, un guerrero tinaja con un corazón enorme que sueña con convertirse en campeón; Vyke, el caballero de la Mesa Redonda que una vez estuvo a punto de ser Señor de Elden y se perdió en la Llama Frenética.',
        'Cada uno representa una manera de enfrentarse a un mundo roto. Algunos encuentran la paz; la mayoría, no. Lo que tienen en común es que la gracia los guió hasta aquí y que ninguno sabe muy bien para qué.',
      ],
    },
    {
      heading: 'El misterio de Melina',
      text: [
        'Melina no recuerda bien quién es. Dice que su madre le encomendó una misión y que tiene un cuerpo quemado bajo la capa. Habla con Marika de una manera que nadie más habla, y su ojo tiene la marca de la Reina. Si es hija de Marika, fragmento suyo o algo distinto sigue siendo uno de los grandes debates del juego.',
      ],
    },
  ],
  estrellas: [
    {
      heading: 'Blaidd y Seluvis',
      text: [
        'Blaidd, el medio lobo, era la sombra de Ranni: una criatura creada por los Dedos para vigilarla y, si era necesario, matarla. Pero Blaidd la amaba como a una hermana y le fue leal hasta el final. Cuando la misión de Ranni se completa, los Dedos lo arrastran a la locura que siempre le tuvieron reservada.',
        'Seluvis, su preceptor, la servía en apariencia mientras coleccionaba marionetas hechas con personas reales y conspiraba para dominarla. Su torre está llena de cuerpos inmóviles que una vez fueron magos, guerreros y princesas.',
      ],
    },
    {
      heading: 'La luna oscura',
      text: [
        'El Mandoble de la Luna Oscura pasaba de reina en reina en la familia de Caria, como prueba de que la luna había elegido a su esposa. Al entregárselo al Sinluz, Ranni lo convierte en su consorte. Su era no sería de oro ni de fuego, sino de estrellas lejanas, de una luna fría que guía sin mandar. Ella misma se aleja del mundo para que nadie pueda volver a gobernarlo desde arriba.',
      ],
    },
  ],
  'llama-frenetica': [
    {
      heading: 'Los que ardieron',
      text: [
        'La Llama Frenética ya había consumido a otros antes. Hay una aldea entera en Liurnia cuyos habitantes, al mirar a los ojos de la llama, enloquecieron y empezaron a escupir fuego por los ojos. En la Tierra de las Sombras, Midra, un noble atormentado, intentó resistirse durante años en su mansión del Bosque Abisal antes de entregarse a ella.',
        'El fuego del caos no es una venganza: es una forma de piedad terrible. Para quien sufre demasiado, la promesa de que nada vuelva a separarse de nada —que todo arda y se funda— puede parecer un descanso. Por eso es tan peligrosa.',
      ],
    },
  ],
  arder: [
    {
      heading: 'Leyndell, capital de la ceniza',
      text: [
        'Cuando el Sinluz regresa de Farum Azula, la capital dorada ya no existe. El Árbol arde, la ceniza cubre las avenidas y un dragón muerto bloquea el camino. Allí, entre las ruinas, el Sinluz encuentra a Godfrey, que había vuelto antes que él, y a Sir Gideon Ofnir, que intenta detenerlo porque sabe que no hay nada más que saber.',
      ],
    },
    {
      heading: 'Las eras, una a una',
      text: [
        'La Era de la Fractura deja el Anillo tal y como Marika lo rompió: los semidioses están muertos, pero el mundo sigue siendo el mismo. La Era del Orden, si el Sinluz ayudó al hermano Goldmask y a Corhyn, repara el Anillo para que la Orden ya no dependa de los caprichos de los dioses. La Era de los Nacidos del Ocaso, la de Fia, devuelve la muerte a la vida. La Bendición de la Desesperación, la del Comedor de Estiércol, maldice a todos con su sangre.',
        'La Era de las Estrellas pertenece a Ranni, y la de la Llama Frenética a los Tres Dedos, que hacen arder a todo el que vive, incluida Melina si no lo impide. Ninguna es «la buena». Elden Ring termina como empieza: con un Sinluz frente a una diosa rota, eligiendo qué tipo de dolor merece la pena.',
      ],
    },
  ],
  sombras: [
    {
      heading: 'Santa Trina',
      text: [
        'En la Tierra de las Sombras se venera a una santa del sueño y la piedad, Santa Trina, a la que se representa con flores que adormecen. Los fieles descubren poco a poco que Trina y Miquella son la misma persona: dos caras de un mismo niño dios. Mientras Miquella abandonaba todo lo que amaba, Trina seguía consolando a quien sufría.',
      ],
    },
    {
      heading: 'Los Cornamentados',
      text: [
        'Los Cornamentados que sobrevivieron a la cruzada de Messmer se escondieron en sus ruinas y torres, odiando a Marika con un odio que había atravesado generaciones. Algunos acompañan al Sinluz, como el Cornudo que busca vengarse de Messmer. A través de ellos se entiende el pasado que Marika enterró: los sacrificios, el desprecio de los Cornamentados hacia las chamanas y el resentimiento que convirtió a una de ellas en diosa.',
      ],
    },
    {
      heading: 'Bayle e Igon',
      text: [
        'En el Pico Escarpado vive Bayle el Pavoroso, un dragón que se atrevió a desafiar al propio Placidusax y quedó destrozado para siempre. Igon, un cazador de dragones que perdió todo frente a él, espera la ocasión de enfrentarse a Bayle de nuevo. Si el Sinluz le ayuda, Igon cumple su juramento y muere en paz.',
      ],
    },
  ],
  consorte: [
    {
      heading: 'Leda y los Caballeros de la Aguja',
      text: [
        'Entre los seguidores de Miquella destacaba Leda, la caballero de la aguja, que vigilaba a los demás fieles y castigaba a los que dudaban. Cuando el encanto de Miquella empieza a resquebrajarse, Leda se vuelve contra los que antes llamaba hermanos, convencida de que solo ella le sigue siendo fiel. El último tramo del viaje está lleno de traiciones entre quienes compartían el mismo amor.',
      ],
    },
    {
      heading: 'Lo que quedó',
      text: [
        'Radahn cae dos veces en la historia de Elden Ring: la primera, enloquecido por la podredumbre de Malenia; la segunda, convertido en el esposo de un dios que no supo amarlo. En ambas, quien lo derriba es un Sinluz. Miquella, que había renunciado a su amor para no tener ataduras, descubre al final que eso era lo único que le hacía humano.',
      ],
    },
  ],
}
