"use client"

import { useChatContext } from "@/src/modules/ai/context/chat-context"
import { buildChatContextParams } from "@/src/modules/ai/lib/chat-context-params"
import { Button } from "@/src/shared/components/ui/button"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { SparklesIcon } from "lucide-react"
import { useRouter } from "next/navigation"

/**
 * Opens the agent from a finance detail. The registered context travels in the
 * URL so the chip survives a reload and the session history keeps it.
 */
export function ChatLauncherButton() {
  const router = useRouter()
  const context = useChatContext()

  const handleClick = () => {
    const params = buildChatContextParams(context)
    router.push(`${APP_ROUTES.app.chat}?${params.toString()}`)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-9 rounded-full"
      aria-label="Preguntar al agente"
      onClick={handleClick}
    >
      <SparklesIcon className="size-4.5" />
    </Button>
  )
}
