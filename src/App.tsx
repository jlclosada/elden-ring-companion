import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/Home'

const NewRunPage = lazy(() => import('./pages/NewRun'))
const RunPage = lazy(() => import('./pages/Run'))
const MapPage = lazy(() => import('./pages/MapPage'))
const BuildsPage = lazy(() => import('./pages/Builds'))
const BuildDetailPage = lazy(() => import('./pages/BuildDetail'))
const PlannerPage = lazy(() => import('./pages/Planner'))
const CompendiumPage = lazy(() => import('./pages/Compendium'))
const ItemPage = lazy(() => import('./pages/ItemPage'))
const LorePage = lazy(() => import('./pages/Lore'))
const LoreChapterPage = lazy(() => import('./pages/LoreChapter'))
const NovelReader = lazy(() => import('./pages/NovelReader'))
const NovelBook = lazy(() => import('./pages/NovelBook'))
const StudioPage = lazy(() => import('./pages/Studio'))

function Loading() {
  return <div className="grid h-64 place-items-center text-sm text-parch-400">Buscando la gracia…</div>
}

export function App() {
  return (
    <BrowserRouter>
        <Routes>
          {/* Libro imprimible: fuera del Layout para que el PDF no lleve la navegación */}
          <Route path="lore/libro" element={<Suspense fallback={<Loading />}><NovelBook /></Suspense>} />
          <Route element={<Layout fallback={<Loading />} />}>
            <Route index element={<HomePage />} />
            <Route path="nueva" element={<NewRunPage />} />
            <Route path="partida" element={<RunPage />} />
            <Route path="mapa" element={<MapPage />} />
            <Route path="builds" element={<BuildsPage />} />
            <Route path="builds/:id" element={<BuildDetailPage />} />
            <Route path="planificador" element={<PlannerPage />} />
            <Route path="compendio" element={<CompendiumPage />} />
            <Route path="compendio/:cat/:id" element={<ItemPage />} />
            <Route path="lore" element={<LorePage />} />
            <Route path="lore/novela/:slug" element={<NovelReader />} />
            <Route path="lore/:id" element={<LoreChapterPage />} />
            <Route path="estudio" element={<StudioPage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
    </BrowserRouter>
  )
}
