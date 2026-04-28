import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-zinc-400">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{prefix}</span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600',
            'focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-600',
            'transition-all text-sm py-2.5',
            prefix ? 'pl-7 pr-3' : 'px-3',
            error && 'border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
export { Input }
