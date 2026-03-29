import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 uppercase tracking-widest relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-primary/20 text-primary border border-primary shadow-[0_0_10px_rgba(0,243,255,0.2)] hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]",
        destructive:
          "bg-destructive/20 text-destructive border border-destructive shadow-[0_0_10px_rgba(255,0,0,0.2)] hover:bg-destructive/30 hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]",
        outline:
          "border border-primary/50 bg-background hover:bg-primary/10 hover:text-primary",
        secondary:
          "bg-secondary/20 text-secondary border border-secondary shadow-[0_0_10px_rgba(188,19,254,0.2)] hover:bg-secondary/30 hover:shadow-[0_0_20px_rgba(188,19,254,0.4)]",
        ghost: "hover:bg-primary/10 hover:text-primary text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{props.children}</span>
        {variant !== 'link' && variant !== 'ghost' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] z-0" />
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
