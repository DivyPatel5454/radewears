import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// This configuration is necessary for tailwind-merge to work with Tailwind v4 properly.
// In v4, font sizes, colors, spacing, etc. are redefined, but standard merge config covers 95%.
export const twMerge = extendTailwindMerge({})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
