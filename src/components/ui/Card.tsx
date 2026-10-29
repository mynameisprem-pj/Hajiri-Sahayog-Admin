import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' }

export function Card({ children, padding = 'md', className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-card ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number | string
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'slate'
  icon?: ReactNode
  sub?: string
}

const statColors = {
  blue:   { bg: 'bg-primary-50',   value: 'text-primary-700', label: 'text-primary-600',  icon: 'text-primary-500'  },
  green:  { bg: 'bg-present-light', value: 'text-present-dark', label: 'text-present-dark', icon: 'text-present'     },
  red:    { bg: 'bg-absent-light',  value: 'text-absent-dark',  label: 'text-absent-dark',  icon: 'text-absent'      },
  yellow: { bg: 'bg-leave-light',   value: 'text-leave-dark',   label: 'text-leave-dark',   icon: 'text-leave'       },
  purple: { bg: 'bg-holiday-light', value: 'text-holiday-dark', label: 'text-holiday-dark', icon: 'text-holiday'     },
  slate:  { bg: 'bg-slate-100',     value: 'text-slate-700',    label: 'text-slate-500',    icon: 'text-slate-400'   },
}

export function StatCard({ label, value, color, icon, sub }: StatCardProps) {
  const c = statColors[color]
  return (
    <div className={`${c.bg} rounded-2xl p-5`}>
      {icon && <div className={`${c.icon} mb-2`}>{icon}</div>}
      <div className={`text-3xl font-bold ${c.value}`}>{value}</div>
      <div className={`text-sm font-medium ${c.label} mt-1`}>{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}