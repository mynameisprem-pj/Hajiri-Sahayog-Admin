import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  children?: ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-soft disabled:bg-primary-300',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50',
  ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50',
  danger:    'bg-absent text-white hover:bg-red-600 active:bg-red-700 shadow-soft disabled:bg-red-300',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-5 py-3 text-base rounded-xl gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={[
      'inline-flex items-center justify-center font-medium',
      'transition-all duration-150 active:scale-95',
      'disabled:cursor-not-allowed disabled:active:scale-100',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1',
      'select-none',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ')}
    {...props}
  >
    {loading
      ? <Loader2 size={14} className="animate-spin shrink-0" />
      : icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
    }
    {children && <span>{children}</span>}
    {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
  </button>
))
Button.displayName = 'Button'

export function IconButton({
  icon, label, onClick, className = '', disabled = false,
}: { icon: ReactNode; label: string; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100
                  active:scale-95 transition-all duration-150 disabled:opacity-40
                  disabled:cursor-not-allowed ${className}`}
    >
      {icon}
    </button>
  )
}