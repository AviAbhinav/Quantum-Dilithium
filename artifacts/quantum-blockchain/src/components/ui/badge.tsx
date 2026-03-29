import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold font-mono uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,243,255,0.3)] hover:bg-primary/30",
        secondary:
          "border-transparent bg-secondary/20 text-secondary shadow-[0_0_10px_rgba(188,19,254,0.3)] hover:bg-secondary/30",
        destructive:
          "border-transparent bg-destructive/20 text-destructive shadow-[0_0_10px_rgba(255,0,0,0.3)] hover:bg-destructive/30",
        outline: "text-foreground border-primary/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
