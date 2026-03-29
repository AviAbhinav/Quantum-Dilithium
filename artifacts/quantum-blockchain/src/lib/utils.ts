import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateHex(hex: string | undefined | null, startChars = 12, endChars = 8): string {
  if (!hex) return "N/A"
  if (hex.length <= startChars + endChars) return hex
  return `${hex.substring(0, startChars)}...${hex.substring(hex.length - endChars)}`
}
