import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { Search, X } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, leftIcon, className = '', id, ...props
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-absent ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400',
            'transition-all duration-200',
            error ? 'border-absent bg-absent-light/20' : 'border-slate-200 bg-white hover:border-slate-300',
            leftIcon ? 'pl-9' : 'pl-4',
            'pr-4',
          ].join(' ')}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-absent font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
})
Input.displayName = 'Input'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white
                   text-sm text-slate-800 placeholder-slate-400
                   focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400
                   transition-all duration-200 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white
                   text-sm text-slate-800 focus:outline-none focus:ring-2
                   focus:ring-primary-100 focus:border-primary-400 transition-all duration-200
                   cursor-pointer"
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}