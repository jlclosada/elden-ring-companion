import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, Compass, Map, Swords, Calculator, BookOpen, ScrollText, Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { useActiveRun } from '../store/runs'
import { progressStats } from '../lib/plan'
import { CLASS_BY_ID } from '../data/classes'
import { ProgressBar, cx } from './ui'
import { CommandPalette } from './CommandPalette'

// El buscador escucha este evento (además de ⌘K, Ctrl+K y «/»)
const openSearch = () => window.dispatchEvent(new Event('open-search'))
const SIDEBAR_KEY = 'ui-sidebar-collapsed'
/** Páginas que ocupan toda la pantalla, sin márgenes (el mapa) */
const FULL_BLEED = ['/mapa']
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

const NAV = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/partida', label: 'Partida', icon: Compass },
  { to: '/mapa', label: 'Mapa', icon: Map },
  { to: '/builds', label: 'Builds', icon: Swords },
  { to: '/planificador', label: 'Planificador', icon: Calculator },
  { to: '/compendio', label: 'Compendio', icon: BookOpen },
  { to: '/lore', label: 'Lore', icon: ScrollText },
]

export function GraceMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <radialGradient id="gm" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6d6" /><stop offset=".5" stopColor="#e6c56f" stopOpacity=".7" /><stop offset="1" stopColor="#e6c56f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#gm)" className="grace-pulse" />
      <path d="M20 5v30M12 13h16M14 27h12" stroke="#3b2a0a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Layout({ fallback }: { fallback?: ReactNode }) {
  const { run, build, tasks } = useActiveRun()
  const prog = run ? progressStats(run, tasks) : null
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem(SIDEBAR_KEY) === '1' } catch { return false } })
  useEffect(() => { try { localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0') } catch { /* sin almacenamiento */ } }, [collapsed])
  const fullBleed = FULL_BLEED.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  return (
    <div className="atmosphere grain min-h-full">
      {/* Sidebar escritorio */}
      <aside className={cx('fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-white/5 bg-ink-950/80 backdrop-blur transition-[width] lg:flex', collapsed ? 'w-[72px]' : 'w-64')}>
        <div className={cx('flex items-center gap-3 pb-6 pt-7', collapsed ? 'justify-center px-2' : 'px-6')}>
          <GraceMark className="size-10 shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display text-lg font-semibold leading-tight text-gold-gradient">Sendero de Gracia</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-parch-400">Elden Ring</div>
            </div>
          )}
        </div>
        <button onClick={openSearch} title={`Buscar (${isMac ? '⌘K' : 'Ctrl K'})`}
          className={cx('mx-3 mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.02] py-2 text-sm text-parch-400 hover:border-gold-500/40 hover:text-parch-200', collapsed ? 'justify-center px-0' : 'px-3')}>
          <Search size={15} />{!collapsed && <>Buscar…<kbd className="ml-auto rounded border border-white/10 px-1.5 text-[10px]">{isMac ? '⌘K' : 'Ctrl K'}</kbd></>}
        </button>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} title={collapsed ? label : undefined}
              className={({ isActive }) => cx('flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition', collapsed ? 'justify-center px-0' : 'px-3',
                isActive ? 'bg-gold-500/12 text-gold-300 ring-1 ring-gold-500/30' : 'text-parch-300 hover:bg-white/5 hover:text-parch-100')}>
              <Icon size={18} className="shrink-0" />{!collapsed && label}
            </NavLink>
          ))}
        </nav>
        <div className={cx('mt-auto', collapsed ? 'p-3' : 'p-4')}>
          {collapsed ? null : run && prog ? (
            <NavLink to="/partida" className="panel panel-hover block p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-parch-400">Partida activa</div>
              <div className="mt-1 truncate font-display text-parch-100">{run.name}</div>
              <div className="mt-0.5 truncate text-xs text-parch-300">{build?.name} · {CLASS_BY_ID[run.classId]?.nameEs} · Nv {run.level}</div>
              <ProgressBar value={prog.pct} className="mt-3" />
              <div className="mt-1 text-right text-[11px] text-parch-400">{prog.done}/{prog.total}</div>
            </NavLink>
          ) : (
            <NavLink to="/nueva" className="panel panel-hover block p-4 text-sm text-parch-300">
              <span className="text-gold-300">+ Nueva partida</span><br />Empieza una run guiada.
            </NavLink>
          )}
          <button onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Expandir menú' : 'Plegar menú'} title={collapsed ? 'Expandir menú' : 'Plegar menú'}
            className={cx('flex w-full items-center gap-2 rounded-lg py-2 text-xs text-parch-400 hover:bg-white/5 hover:text-parch-100', collapsed ? 'justify-center' : 'mt-3 px-3')}>
            {collapsed ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} />Plegar menú</>}
          </button>
        </div>
      </aside>

      {/* Cabecera móvil */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-ink-950/85 px-4 py-3 backdrop-blur lg:hidden">
        <GraceMark className="size-8" />
        <div className="font-display font-semibold text-gold-gradient">Sendero de Gracia</div>
        {run && <div className="ml-auto truncate text-xs text-parch-300">Nv {run.level} · {build?.name}</div>}
        <button onClick={openSearch} className={cx('grid size-9 shrink-0 place-items-center rounded-lg text-parch-300 hover:bg-white/5', !run && 'ml-auto')} aria-label="Buscar"><Search size={18} /></button>
      </header>

      {fullBleed ? (
        // Pantalla completa: entre la cabecera y la barra inferior en móvil, todo el alto en escritorio
        <main className={cx('h-[calc(100dvh-7.75rem)] lg:h-dvh', collapsed ? 'lg:ml-[72px]' : 'lg:ml-64')}>
          <Suspense fallback={fallback}><Outlet /></Suspense>
        </main>
      ) : (
        <main className={cx('px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8 2xl:px-12', collapsed ? 'lg:ml-[72px]' : 'lg:ml-64')}>
          <div className="mx-auto max-w-[2200px]">
            <Suspense fallback={fallback}><Outlet /></Suspense>
          </div>
        </main>
      )}

      <CommandPalette />

      {/* Navegación inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-8 border-t border-white/5 bg-ink-950/95 backdrop-blur lg:hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => cx('flex min-w-0 flex-col items-center gap-1 py-2.5 text-[9px] font-medium sm:text-[10px]', isActive ? 'text-gold-300' : 'text-parch-400')}>
            <Icon size={19} />{label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
