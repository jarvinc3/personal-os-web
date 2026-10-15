"use client"

import { ChatTransactionRow } from "@/src/modules/ai/components/blocks/chat-transaction-row"
import type { ChatBlock } from "@/src/modules/ai/types/chat.types"

type ChatTransactionCardProps = {
  block: Extract<ChatBlock, { type: "transaction_card" }>
}

export function ChatTransactionCard({ block }: ChatTransactionCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-1">
      <ChatTransactionRow snapshot={block.snapshot} isLast />
    </div>
  )
}
