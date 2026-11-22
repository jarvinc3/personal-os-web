"use client"

import { Skeleton } from "@/src/shared/components/ui/skeleton"

/**
 * Se pinta mientras llega el trozo del chat. Copia la estructura del overlay
 * para que el cambio no salte cuando el componente real monta.
 */
export function AgentChatOverlaySkeleton() {
  return (
    <>
      <div
        className="agent-chat-backdrop fixed inset-0 z-80 animate-in bg-background/60 backdrop-blur-md duration-200 fade-in motion-reduce:animate-none motion-reduce:backdrop-blur-none"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-busy="true"
        aria-label="Chat con el agente"
        data-slot="agent-chat-skeleton"
        className="agent-chat-panel fixed inset-0 z-90 flex animate-in flex-col bg-background/80 backdrop-blur-xl duration-200 fade-in slide-in-from-bottom-2 motion-reduce:animate-none"
      >
        <p role="status" className="sr-only">
          Cargando el chat.
        </p>
        <div
          className="flex items-start gap-2 border-b border-border px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2"
          aria-hidden
        >
          <Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
            <Skeleton className="h-3.5 w-24 rounded-full" />
            <Skeleton className="h-5 w-40 rounded-full" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-3"
          aria-hidden
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-10 w-1/2 self-end" />
            <Skeleton className="h-24 w-4/5" />
          </div>
        </div>
        <div
          className="border-t border-border bg-background px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          aria-hidden
        >
          <div className="mx-auto flex w-full max-w-3xl">
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        </div>
      </div>
    </>
  )
}
