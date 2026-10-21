import type { ReactNode } from "react"

type HelpPageProps = {
  children: ReactNode
}

export function HelpPage({ children }: HelpPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 pb-16 md:px-6">
      {children}
    </div>
  )
}
