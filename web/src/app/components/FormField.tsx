// Phase 2: 共通フォームフィールドコンポーネント
export const inputClass = 'w-full bg-background border border-border/50 text-sm px-4 py-2 rounded-xl focus:ring-2 focus:ring-primary outline-none'
export const inputClassLg = 'w-full bg-background border border-border/50 text-sm px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary outline-none'
export const labelClass = 'block text-[10px] text-muted-foreground uppercase mb-1'

export function FormField({ label, name, type = 'text', defaultValue, required, placeholder, className, rows }: {
  label: string; name: string; type?: string; defaultValue?: string; required?: boolean; placeholder?: string; className?: string; rows?: number
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {type === 'textarea' ? (
        <textarea name={name} defaultValue={defaultValue || ''} placeholder={placeholder} required={required} className={inputClass} rows={rows || 2} />
      ) : (
        <input type={type} name={name} defaultValue={defaultValue} required={required} placeholder={placeholder}
          className={`${inputClassLg} ${type === 'date' ? 'text-foreground' : ''}`} />
      )}
    </div>
  )
}

export function FormSelect({ label, name, defaultValue, options, className }: {
  label: string; name: string; defaultValue?: string; options: { value: string; label: string }[]; className?: string
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      <select name={name} defaultValue={defaultValue} className={inputClassLg}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
