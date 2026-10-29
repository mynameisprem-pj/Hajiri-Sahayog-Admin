import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useToasts, useAdminStore } from '@/store/useAdminStore'
import type { ToastMessage } from '@/types'

const config = {
  success: { Icon: CheckCircle, border: 'border-present',        icon: 'text-present'        },
  error:   { Icon: XCircle,     border: 'border-absent',         icon: 'text-absent'         },
  warning: { Icon: AlertCircle, border: 'border-leave',          icon: 'text-leave'          },
  info:    { Icon: Info,        border: 'border-primary-400',    icon: 'text-primary-600'    },
}

function ToastItem({ toast }: { toast: ToastMessage }) {
  const dismiss = useAdminStore(s => s.dismissToast)
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t) }, [])
  const { Icon, border, icon } = config[toast.type]

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-elevated border-l-4
                     bg-white transition-all duration-300
                     ${border} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <Icon size={17} className={`shrink-0 mt-0.5 ${icon}`} />
      <p className="flex-1 text-sm font-medium text-slate-800">{toast.message}</p>
      <button onClick={() => dismiss(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
        <X size={15} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToasts()
  if (!toasts.length) return null
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 w-80">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}