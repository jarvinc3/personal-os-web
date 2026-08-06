import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-y-hidden bg-background dark:bg-[#090909]!">
      {children}
    </div>
  )
}
