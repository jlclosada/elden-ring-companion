# Sendero de Gracia — asistente de partidas y builds para Elden Ring

App web (React 19 + TypeScript + Vite + Tailwind 4) para jugar Elden Ring con una build en mente:
eliges arquetipo y clase, y el asistente te genera **roadmap**, **checklist**, **recomendaciones de lo siguiente que hacer**
y una **ruta en el mapa**, todo adaptado a tu build.

## Cómo levantarlo

### Primera vez: generar el mapa

El mapa usa los mapas reales del juego en alta resolución troceados en teselas. Se generan una sola vez
(descarga ≈380 MB, unos 20 s de proceso, ~52 MB de teselas en `public/tiles/`):

```bash
npm install
npm run map
```

### Con Docker (recomendado)

```bash
docker compose up -d --build web          # producción (nginx) → http://localhost:8090
docker compose --profile dev up dev       # desarrollo con recarga en caliente → http://localhost:5173
docker compose --profile dev up -d --build -V dev   # tras cambiar dependencias (renueva node_modules)
docker compose --profile tools run --rm data   # regenerar el compendio (Fan API + wiki + DLC)
docker compose down                       # parar
```

Puertos configurables: `WEB_PORT=9000 docker compose up -d web`, `DEV_PORT=5174 …`.

### Sin Docker

```bash
npm install
npm run dev          # http://localhost:5173
npm run build && npm run preview
npm run data         # vuelve a descargar el compendio (opcional)
```

## Funciones

| Sección | Qué hace |
|---|---|
| **Partida › Guía paso a paso** | Ruta ordenada para tu build en 10 capítulos (Preparación → Margit → … → DLC). La preparación consigue montura, frascos, el equipo clave y ~50.000 runas (Greyoll) sin tocar el camino principal. Antes de cada jefe, un paso de **preparación** dice qué atributos subir (comparado con tus stats), qué arma mejorar, a qué nivel y con cuántas piedras de cada tipo, y qué equipo llevar. |
| **Nueva partida** | Asistente en 3 pasos: build → clase (ordenadas por eficiencia de niveles) → ruta de preparación ("setup") opcional. |
| **Partida › Siguiente** | Motor de recomendaciones: mezcla camino principal, equipo clave de la build, mejoras de frasco, desbloqueos y avisos de nivel. Mini-mapa con la ruta numerada. |
| **Partida › Roadmap** | 11 fases de progresión (Preparación → Final) con regiones, rango de nivel y tareas. |
| **Partida › Checklist** | ~80 tareas por partida agrupadas (frascos, campanas de herrero, llaves, cenizas, jefes…), con filtros. |
| **Partida › Jefes** | Checklist de ~170 jefes (juego base + DLC) por región, con tipo (remembranza, gran enemigo, campo, mazmorra, prisión eterna, nocturno), obligatorios, fecha de derrota y filtros. Los jefes que también son pasos de la guía se marcan en ambos sitios. |
| **Partida › Estadísticas** | Introduce tus stats; te dice qué subir, cuántas runas faltan y el siguiente punto de control. |
| **Mapa** | Mapa real del juego (Leaflet + teselas, zoom profundo) en 3 capas: Tierras Intermedias, Subsuelo y Reino de las Sombras. ~1.600 marcadores en 23 categorías con iconos, búsqueda, filtros, «marcar como encontrado» con progreso, ruta recomendada y lugares pendientes de tu build resaltados. |
| **Builds** | 9 builds curadas (una exclusiva del DLC) con estadísticas por nivel según la clase, equipo por etapa y dónde conseguirlo. |
| **Planificador** | Calculadora de nivel/runas, sobre topes de atributos y "¿qué armas puedo empuñar?" (a una o dos manos). |
| **Lore** | *El Anillo Roto*, una novela completa de unas 80 000 palabras en 46 capítulos y 6 libros que cuenta toda la historia de Elden Ring en orden, desde la Tormenta y los dragones hasta la Era de las Estrellas (incluye Shadow of the Erdtree y un epílogo con los demás finales), con lector propio (capitular, índice, tamaño de letra) y una **edición impresa** en `/lore/libro`, maquetada con Paged.js como un libro de editorial: portadilla, portada, créditos, dedicatoria, epígrafe, índice con números de página, nota editorial, mapas, portadillas de libro con epígrafe, capítulos en página impar, titulillos, folios exteriores, márgenes en espejo, glosario, cronología, *dramatis personae* y colofón. Formatos 15×23 cm, A5 y A4. `npm run libro:pdf` genera el PDF directamente (Chrome sin interfaz). Además: crónicas temáticas, un reparto de 27 personajes, reliquias enlazadas a su descripción del juego, lugares en el mapa y aviso de spoilers del DLC. |
| **Buscador (⌘K)** | Busca en todo a la vez: jefes, ~2.350 objetos, ~1.600 lugares del mapa, capítulos, personajes, glosario, builds y secciones. Se abre con ⌘K / Ctrl+K o «/». |
| **Partida › Diario** | Crónica de la partida a partir de la fecha de cada hito: días jugados, sesiones, racha, mejor sesión, gráfica de progreso con los jefes marcados y línea temporal día a día. |
| **Compendio** | ~2.350 objetos (juego base + DLC) (armas, escudos, armaduras, talismanes, hechizos, cenizas, objetos) con estadísticas, requisitos e info de dónde se consiguen. |

El progreso se guarda automáticamente en `localStorage`, con varias partidas en curso a la vez: selector para cambiar,
renombrar y duplicar partidas, y **copia de seguridad** (exportar/importar JSON desde Inicio) para no perder nada al cambiar
de navegador o borrar datos.

### Shadow of the Erdtree

- Opción por partida (en el asistente o con el botón **DLC** de la partida). Las tareas del DLC se desbloquean al marcar
  la entrada al Reino de las Sombras, que a su vez requiere haber derrotado a Mohg y a Radahn.
- 3 fases propias (Llanura de las Tumbas → Scadu Altus y el Torreón → Enir-Ilim) con progreso independiente del juego base.
- Grupo **Bendición del Árbol Umbrío** (Fragmentos y Cenizas veneradas) y tabla de bendición recomendada por jefe.
- Capa **Sombras (DLC)** en el mapa con 9 regiones y ~40 puntos de interés.
- Equipo del DLC añadido a las 8 builds y una build nueva solo DLC: **Puño de Hoja Seca** (artes marciales Destreza/Fe).
- Unos 450 objetos del DLC en el compendio, con filtro *Juego base / Shadow of the Erdtree*.

## App móvil (iOS y Android, Expo)

La carpeta `mobile/` es una app nativa hecha con Expo (SDK 57, Expo Router, pestañas nativas) con todo excepto la novela: inicio, partidas, guía paso a paso, recomendaciones, ruta, checklist, jefes, diario, atributos, mapa interactivo, builds, planificador, compendio, crónicas y personajes.

- **Comparte el código de la web**: datos (`src/data`), guía, plan y estadísticas (`src/lib`) se importan tal cual desde `../src` (alias `@shared/*`). Si cambias una build o un jefe en la web, la app lo recoge.
- **Partidas** guardadas en el teléfono (AsyncStorage), con la misma lógica que la web.
- **Mapa**: Leaflet dentro de un WebView. Leaflet y los iconos van empaquetados en la app (se regeneran con `node mobile/scripts/gen-map-assets.mjs`). Las teselas (53 MB) se sirven desde el contenedor web del ordenador: `docker compose up -d web` (puerto 8090) y el móvil en la misma wifi. Para otro servidor, `EXPO_PUBLIC_TILES_URL` en `mobile/.env`.

### Probarla en tu móvil

Requiere Node 22 (`nvm install 22`) y la app **Expo Go** en el teléfono (App Store o Google Play).

```bash
cd mobile
npm install
npx expo start
```

Escanea el código QR con la cámara (iPhone) o con Expo Go (Android). Para el simulador de iOS, pulsa `i` en la terminal de Expo.

## Arquitectura

```
scripts/fetch-data.mjs     Descarga el compendio (Elden Ring Fan API) + "Acquisition" de la wiki de Fandom
scripts/dlc.mjs            Extrae Shadow of the Erdtree de la wiki (infobox, descripción, imagen y adquisición)
scripts/fetch-lore.mjs     Descripción completa del juego de cada objeto (plantilla Description de la wiki)
src/data/lore.ts, lore-extra.ts  Capítulos y personajes del lore (prosa propia)
src/content/novela/        Novela «El Anillo Roto»: un .md por capítulo + index.ts (libros, orden, parser)
scripts/build-map.mjs      Teselas del mapa, marcadores reales y geolocalización de objetos (npm run map)
scripts/location-overrides.json  Anclajes de los lugares de la guía sin marcador homónimo
src/components/GameMap.tsx Visor Leaflet (CRS simple, teselas, iconos, ruta, foco)
src/data/dlc.ts            Regiones, puntos del mapa, fases y tareas del DLC
Dockerfile / docker/       Imagen multi-etapa (dev, build, nginx) y configuración de nginx para la SPA
src/data/generated/*.json  Datos generados (carga perezosa por categoría)
src/data/regions.ts        Regiones del mapa (formas, niveles) y las 11 fases de progresión
src/data/locations.ts      Puntos de interés del mapa
src/data/progression.ts    Tareas universales: camino principal, frascos, mejoras, llaves, jefes
src/data/builds.ts         Builds curadas: equipo + ubicación, puntos de control de stats, ruta de setup
src/data/classes.ts        Clases iniciales y metadatos de atributos
src/data/bosses.ts         Catálogo de jefes (checklist por partida, sincronizado con las tareas)
src/pages/NovelBook.tsx, src/pages/book/  Edición impresa (Paged.js): estilos de imprenta y composición del libro
src/content/novela/edicion.ts  Preliminares, epígrafes, glosario, cronología y nota editorial
scripts/export-book.mjs    Exporta la edición impresa a PDF sin diálogo (npm run libro:pdf)
src/data/guide.ts          Guía: capítulos, ruta común y plan de cada build (pasos, atributos por capítulo, equipo)
src/lib/guide.ts           Ensambla la guía de una partida, pasos de preparación y coste de piedras
src/lib/plan.ts            Genera las tareas de una partida y el motor de recomendaciones
src/lib/stats.ts           Fórmula de runas, nivel, siguiente atributo, requisitos de armas
src/store/runs.ts          Estado de partidas (zustand + persist)
```

### Cómo funcionan las recomendaciones

Cada tarea tiene fase, ubicación, etiquetas (`arc`, `bleed`, `int`, `flask`…) y dependencias.
`recommend()` descarta lo bloqueado o demasiado avanzado (más de una fase por delante) y puntúa:
siguiente paso principal, preparación, piezas *clave* de la build, mejoras de frasco, tareas que desbloquean otras,
afinidad de etiquetas con la build, cercanía a la región del siguiente paso y penalización si la zona supera tu nivel.

### Añadir una build

Añade un objeto a `BUILDS` en `src/data/builds.ts`. Los nombres de `gear` deben coincidir con el compendio
(se comparan normalizados); las `location` deben existir en `locations.ts`.

## Datos y créditos

- Estadísticas e imágenes: [Elden Ring Fan API](https://eldenring.fanapis.com) (comunidad).
- Ubicaciones de objetos: sección *Acquisition* de la [wiki de Elden Ring en Fandom](https://eldenring.fandom.com) (CC BY-SA).
- Mapas y coordenadas de gracias, jefes, mazmorras, prisiones eternas, mausoleos, mercaderes, semillas, lágrimas, fragmentos del Árbol Umbrío y cenizas veneradas:
  [CreateDDy/EldenRing_MapInteractive](https://github.com/CreateDDy/EldenRing_MapInteractive) (MIT, ver `data-src/createdd/`).
- Los objetos del compendio (armas, talismanes, hechizos…) se ubican cruzando su texto de adquisición con esos lugares:
  su posición es la del lugar donde se consiguen (marcados como «ubicación aproximada»), no la del punto exacto de recogida.
- Arte de los mapas © FromSoftware / Bandai Namco.
- Incluye el juego base y *Shadow of the Erdtree* (el DLC se extrae de la wiki porque la Fan API no lo cubre).

Elden Ring © FromSoftware / Bandai Namco. Proyecto de fans sin afiliación.
