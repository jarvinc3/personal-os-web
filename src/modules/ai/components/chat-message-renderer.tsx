"use client"

import { ChatActionCard } from "@/src/modules/ai/components/chat-action-card"
import { ChatMarkdownBlock } from "@/src/modules/ai/components/chat-markdown-block"
import { resolveMessageBlocks } from "@/src/modules/ai/lib/resolve-message-blocks"
import type {
  AiActionSummary,
  ChatBlock,
  ChatRole,
} from "@/src/modules/ai/types/chat.types"
import { cn } from "@/src/shared/lib/utils"

type ChatMessageRendererProps = {
  role: ChatRole
  content: string
  blocks?: ChatBlock[]
  actions?: AiActionSummary[]
  moduleLabel?: string
  provider?: string
  model?: string
  sessionId?: string | null
  streamingStatus?: string
  onActionUpdated?: (action: AiActionSummary) => void
}

export function ChatMessageRenderer({
  role,
  content,
  blocks,
  actions,
  moduleLabel,
  provider,
  model,
  sessionId,
  streamingStatus,
  onActionUpdated,
}: ChatMessageRendererProps) {
  const isUser = role === "user"
  const hasContent = content.trim().length > 0
  const resolvedBlocks = resolveMessageBlocks(content, blocks, actions)

  return (
    <div
      className={cn(
        "my-1.5 flex flex-col gap-1 p-3",
        isUser
          ? "ml-auto max-w-[88%] rounded-xl rounded-br-none bg-primary text-primary-foreground"
          : "mr-auto w-full max-w-[88%] rounded-xl rounded-bl-none text-foreground"
      )}
    >
      {resolvedBlocks.map((block, index) => {
        if (block.type === "markdown") {
          return (
            <ChatMarkdownBlock
              key={index}
              content={block.content || "…"}
              variant={isUser ? "user" : "assistant"}
            />
          )
        }
        if (block.type === "action") {
          return (
            <div key={block.action.id} className="-mx-1 mt-2 w-full min-w-0">
              <ChatActionCard
                action={block.action}
                sessionId={sessionId}
                onActionUpdated={onActionUpdated}
              />
            </div>
          )
        }
        return null
      })}
      {!isUser && !hasContent && streamingStatus ? (
        <p className="text-sm text-muted-foreground italic">
          {streamingStatus}…
        </p>
      ) : null}
      {!isUser && (moduleLabel || (provider && model)) ? (
        <span className="mt-2 inline-flex w-fit rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
          {moduleLabel ? moduleLabel : null}
          {provider && model ? " · " : null}
          {provider && model ? model : null}
        </span>
      ) : null}
    </div>
  )
}
