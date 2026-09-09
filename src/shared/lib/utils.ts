import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PRESSABLE_CLASS =
  "origin-center transition-[transform,opacity] duration-150 ease-out active:scale-[0.98] active:opacity-80 motion-reduce:transition-none motion-reduce:active:scale-100 motion-reduce:active:opacity-100"
