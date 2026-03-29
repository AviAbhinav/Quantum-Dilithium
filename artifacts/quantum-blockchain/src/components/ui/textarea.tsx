import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative group w-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 opacity-0 group-focus-within:opacity-100 transition duration-300 blur-sm"></div>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full border border-primary/30 bg-background/50 px-3 py-2 text-sm font-mono text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50 relative z-10 transition-colors",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
