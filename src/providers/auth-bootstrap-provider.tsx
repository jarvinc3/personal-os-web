"use client"

import { useAuthBootstrap } from "@/src/modules/auth"
import type { ReactNode } from "react"

export function AuthBootstrapProvider({ children }: { children: ReactNode }) {
  useAuthBootstrap()
  return children
}
