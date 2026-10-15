"use client"

import { useChatContext } from "@/src/modules/ai/context/chat-context"
import { buildChatContextParams } from "@/src/modules/ai/lib/chat-context-params"
import { Button } from "@/src/shared/components/ui/button"
import { usePendingNavigation } from "@/src/shared/components/ui/navigation-pending"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { SparklesIcon } from "lucide-react"

/**
 * Opens the agent from a finance detail. The registered context travels in the
 * URL so the chip survives a reload and the session history keeps it.
 */
export function ChatLauncherButton() {
  const { navigate, isPending } = usePendingNavigation()
  const context = useChatContext()

  const handleClick = () => {
    const params = buildChatContextParams(context)
    navigate(`${APP_ROUTES.app.chat}?${params.toString()}`)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-9 rounded-full"
      aria-label="Preguntar al agente"
      aria-busy={isPending || undefined}
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? (
        <Spinner className="size-4.5" />
      ) : (
        <SparklesIcon className="size-4.5" />
      )}
    </Button>
  )
}
