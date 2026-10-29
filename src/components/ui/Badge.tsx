import type { AttendanceStatus } from '@/types'
import { ATTENDANCE_STATUS_CONFIG } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
  size?: 'sm' | 'md'
}

const colors = {
  blue:   'bg-primary-50 text-primary-700',
  green:  'bg-present-light text-present-dark',
  red:    'bg-absent-light text-absent-dark',
  yellow: 'bg-leave-light text-leave-dark',
  purple: 'bg-holiday-light text-holiday-dark',
  gray:   'bg-slate-100 text-slate-600',
}

export function Badge({ children, color = 'gray', size = 'md' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full
      ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}
      ${colors[color]}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  const cfg = ATTENDANCE_STATUS_CONFIG[status]
  const colorMap: Record<AttendanceStatus, string> = {
    present: 'bg-present-light text-present-dark',
    absent:  'bg-absent-light text-absent-dark',
    leave:   'bg-leave-light text-leave-dark',
    holiday: 'bg-holiday-light text-holiday-dark',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorMap[status]}`}>
      {cfg.label}
    </span>
  )
}

export function PercentageBadge({ value }: { value: number }) {
  const color = value >= 85 ? 'bg-present-light text-present-dark'
    : value >= 75 ? 'bg-leave-light text-leave-dark'
    : 'bg-absent-light text-absent-dark'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {value}%
    </span>
  )
}