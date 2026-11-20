import { PlusIcon } from "lucide-react"

import { useAgentChatLauncher } from "@/src/shared/components/agent-chat/agent-chat-launcher"
import { ProgressRing } from "@/src/shared/components/ui/progress-ring"
import { useHoldProgress } from "@/src/shared/hooks/use-hold-progress"

export function Fab({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  const agentChat = useAgentChatLauncher()
  const longPress = useHoldProgress({
    disabled: !agentChat.available,
    onLongPress: () => {
      if (agentChat.available) {
        agentChat.launch()
      }
    },
  })

  return (
    <button
      type="button"
      onClick={() => {
        if (longPress.consumeSuppressedClick()) {
          return
        }
        onClick()
      }}
      {...longPress.handlers}
      disabled={disabled}
      aria-label={label}
      className="fixed right-4 bottom-24 z-50 flex h-12 w-12 touch-none items-center justify-center rounded-full bg-primary text-white shadow-xl select-none disabled:opacity-50"
    >
      {longPress.progress > 0 ? (
        <ProgressRing
          value={longPress.progress}
          size={48}
          thickness={2}
          arcClassName="stroke-white"
          trackClassName="stroke-transparent"
          className="pointer-events-none absolute inset-0"
        />
      ) : null}
      <PlusIcon className="size-5" aria-hidden />
    </button>
  )
}
