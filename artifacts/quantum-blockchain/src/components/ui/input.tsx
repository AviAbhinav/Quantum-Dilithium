import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative group w-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 opacity-0 group-focus-within:opacity-100 transition duration-300 blur-sm"></div>
        <input
          type={type}
          className={cn(
            "flex h-10 w-full border border-primary/30 bg-background/50 px-3 py-2 text-sm font-mono text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50 relative z-10 transition-colors",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
