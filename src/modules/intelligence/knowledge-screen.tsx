"use client"

import { KnowledgeExplorer } from "@/src/modules/intelligence/components/knowledge-explorer"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"

export function KnowledgeScreen() {
  usePageHeader({ title: "Conocimiento" })

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 pb-10 md:px-6">
      <KnowledgeExplorer />
    </main>
  )
}
