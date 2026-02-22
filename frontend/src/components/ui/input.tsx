import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, onChange, onBlur, ...props }, ref) => {
    const currentYear = new Date().getFullYear()
    const maxDate = `${currentYear + 10}-12-31`
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (type === "date" && e.target.value) {
        const date = new Date(e.target.value)
        const year = date.getFullYear()
        
        if (year > currentYear + 10) {
          const correctedDate = new Date(e.target.value)
          correctedDate.setFullYear(currentYear + 10)
          const correctedValue = correctedDate.toISOString().split("T")[0]
          e.target.value = correctedValue
          
          if (onChange) {
            const syntheticEvent = {
              ...e,
              target: { ...e.target, value: correctedValue }
            } as React.ChangeEvent<HTMLInputElement>
            onChange(syntheticEvent)
          }
        }
      }
      
      if (onBlur) {
        onBlur(e)
      }
    }

    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        max={type === "date" ? maxDate : undefined}
        className={cn(
          "flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm",
          "placeholder:text-[var(--foreground)]/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
