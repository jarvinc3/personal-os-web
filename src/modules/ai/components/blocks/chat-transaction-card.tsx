"use client"

import { ChatMovementRow } from "@/src/modules/ai/components/blocks/chat-movement-row"
import type { ChatBlock } from "@/src/modules/ai/types/chat.types"

type ChatTransactionCardProps = {
  block: Extract<ChatBlock, { type: "transaction_card" }>
}

export function ChatTransactionCard({ block }: ChatTransactionCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-1">
      <ChatMovementRow snapshot={block.snapshot} isLast />
    </div>
  )
}
