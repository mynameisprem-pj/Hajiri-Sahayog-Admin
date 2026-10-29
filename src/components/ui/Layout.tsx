import type { ReactNode } from 'react'
import {
  LayoutDashboard, Users, BookOpen,
  CalendarCheck, BarChart2, Settings,
  ChevronRight,
} from 'lucide-react'
import { useActiveTab, useAdminStore, useProfile } from '@/store/useAdminStore'
import { getInitials } from '@/utils/imageUtils'
import { APP_NAME } from '@/types'

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const navItems = [
  { tab: 'dashboard'  as const, label: 'Dashboard',  Icon: LayoutDashboard },
  { tab: 'teachers'   as const, label: 'Teachers',   Icon: Users           },
  { tab: 'students'   as const, label: 'Students',   Icon: BookOpen        },
  { tab: 'attendance' as const, label: 'Attendance', Icon: CalendarCheck   },
  { tab: 'reports'    as const, label: 'Reports',    Icon: BarChart2       },
]

export function Sidebar() {
  const activeTab = useActiveTab()
  const setActiveTab = useAdminStore(s => s.setActiveTab)
  const profile = useProfile()

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white text-base">📋</span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-sm leading-tight">{APP_NAME}</p>
            <p className="text-xs text-primary-600 font-medium">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ tab, label, Icon }) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left
                          transition-all duration-150 group
                          ${isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                          }`}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}
              />
              <span className={`text-sm font-medium ${isActive ? 'text-primary-700' : ''}`}>
                {label}
              </span>
              {isActive && <ChevronRight size={14} className="ml-auto text-primary-400" />}
            </button>
          )
        })}
      </nav>

      {/* Profile at bottom */}
      {profile && (
        <div className="px-3 pb-4 border-t border-slate-100 pt-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                       hover:bg-slate-50 transition-colors text-left"
          >
            {/* Avatar */}
            {profile.avatarBase64 ? (
              <img
                src={profile.avatarBase64}
                alt={profile.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center
                              shrink-0 text-primary-700 font-bold text-sm">
                {getInitials(profile.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">{profile.name}</p>
              <p className="text-xs text-slate-400 truncate">{profile.schoolName}</p>
            </div>
            <Settings size={15} className="text-slate-300 shrink-0" />
          </button>
        </div>
      )}
    </aside>
  )
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

interface TopBarProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center
                        text-slate-300 mb-4 text-3xl mx-auto">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-600 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 mb-5 max-w-sm leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  )
}

// ─── Loading ──────────────────────────────────────────────────────────────────

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{children}</h2>
      {action}
    </div>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`border-t border-slate-100 ${className}`} />
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }[size]
  if (src) {
    return <img src={src} alt={name} className={`${sizeClass} rounded-full object-cover border border-slate-200`} />
  }
  return (
    <div className={`${sizeClass} rounded-full bg-primary-100 text-primary-700 font-bold
                     flex items-center justify-center shrink-0`}>
      {getInitials(name)}
    </div>
  )
}