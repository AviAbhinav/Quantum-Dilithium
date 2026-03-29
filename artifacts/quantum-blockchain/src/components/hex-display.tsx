import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, truncateHex } from "@/lib/utils"

interface HexDisplayProps {
  label: string
  value: string | undefined
  truncate?: boolean
  className?: string
}

export function HexDisplay({ label, value, truncate = false, className }: HexDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayValue = truncate ? truncateHex(value) : value

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono tracking-widest text-primary/80 uppercase">
          {label}
        </label>
        {value && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs" 
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-primary/70" />}
          </Button>
        )}
      </div>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 opacity-20 blur-sm"></div>
        <div className="relative bg-black/60 border border-primary/20 p-3 rounded-none overflow-x-auto">
          {value ? (
            <code className="text-sm font-mono text-foreground/90 break-all select-all selection:bg-primary/30">
              {displayValue}
            </code>
          ) : (
            <span className="text-sm font-mono text-muted-foreground italic">Not generated yet</span>
          )}
        </div>
      </div>
    </div>
  )
}
