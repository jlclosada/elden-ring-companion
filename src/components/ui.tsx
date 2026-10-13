import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Droplet, Flame, Sparkles, Moon, Hammer, Sun, Shield, Zap, Sword, Shirt, Gem, Ghost, Package, Leaf,
  type LucideIcon,
} from 'lucide-react'

export const ICONS: Record<string, LucideIcon> = { Droplet, Flame, Sparkles, Moon, Hammer, Sun, Shield, Zap, Sword, Shirt, Gem, Ghost, Package, Leaf }

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'gold' | 'ghost' | 'outline'; size?: 'sm' | 'md' | 'lg'; to?: string }
export function Button({ variant = 'gold', size = 'md', className, to, children, ...rest }: BtnProps) {
  const cls = cx(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition select-none disabled:opacity-40 disabled:pointer-events-none',
    size === 'sm' && 'h-8 px-3 text-xs',
    size === 'md' && 'h-10 px-4 text-sm',
    size === 'lg' && 'h-12 px-6 text-base',
    variant === 'gold' && 'bg-gradient-to-b from-gold-400 to-gold-600 text-ink-950 shadow-[0_6px_24px_-8px_rgba(230,197,111,.6)] hover:brightness-110',
    variant === 'outline' && 'border border-gold-500/40 text-gold-300 hover:bg-gold-500/10',
    variant === 'ghost' && 'text-parch-200 hover:bg-white/5',
    className,
  )
  if (to) return <Link to={to} className={cls}>{children}</Link>
  return <button className={cls} {...rest}>{children}</button>
}

export function Badge({ children, color, className }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <span
      className={cx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap', className)}
      style={color ? { color, borderColor: `${color}55`, background: `${color}14` } : undefined}
    >
      {children}
    </span>
  )
}

export function Panel({ children, className, hover }: { children: ReactNode; className?: string; hover?: boolean }) {
  return <div className={cx('panel', hover && 'panel-hover', className)}>{children}</div>
}

export function PageHeader({ eyebrow, title, children, actions }: { eyebrow?: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">{eyebrow}</div>}
        <h1 className="font-display text-3xl font-semibold text-gold-gradient md:text-4xl">{title}</h1>
        {children && <p className="mt-2 max-w-2xl text-sm text-parch-300">{children}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-semibold tracking-wide text-parch-100">{children}</h2>
      {right}
    </div>
  )
}

export function ProgressBar({ value, color = 'var(--color-gold-400)', className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cx('h-1.5 overflow-hidden rounded-full bg-white/5', className)}>
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${Math.round(value * 100)}%`, background: color }} />
    </div>
  )
}

export function ProgressRing({ value, size = 88, stroke = 7, label, sub }: { value: number; size?: number; stroke?: number; label?: ReactNode; sub?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.06)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#ringGold)" strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value)} style={{ transition: 'stroke-dashoffset .6s' }} />
        <defs>
          <linearGradient id="ringGold" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#fff1c8" /><stop offset="1" stopColor="#a77f2c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center leading-tight">
        <div className="font-display text-lg font-semibold text-parch-100">{label ?? `${Math.round(value * 100)}%`}</div>
        {sub && <div className="text-[10px] uppercase tracking-wider text-parch-400">{sub}</div>}
      </div>
    </div>
  )
}

export function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="checkbox" aria-checked={checked} aria-label={label} onClick={onChange}
      className={cx(
        'grid size-6 shrink-0 place-items-center rounded-md border transition',
        checked ? 'border-gold-400 bg-gold-500/90 text-ink-950' : 'border-parch-400/40 hover:border-gold-400/70',
      )}
    >
      {checked && <svg viewBox="0 0 16 16" className="size-3.5"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </button>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cx('flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition',
            value === t.id ? 'bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/40' : 'text-parch-300 hover:bg-white/5 hover:text-parch-100')}>
          {t.label}
          {t.count !== undefined && <span className="rounded bg-white/5 px-1.5 text-[11px] text-parch-400">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Empty({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
      {icon && <div className="text-gold-400">{icon}</div>}
      <h3 className="font-display text-xl text-parch-100">{title}</h3>
      {children && <p className="max-w-md text-sm text-parch-300">{children}</p>}
      {action}
    </div>
  )
}
