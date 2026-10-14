"use client"

import { ChatTransactionRow } from "@/src/modules/ai/components/blocks/chat-transaction-row"
import type { ChatBlock } from "@/src/modules/ai/types/chat.types"
import { Button } from "@/src/shared/components/ui/button"
import Link from "next/link"

type ChatTransactionListProps = {
  block: Extract<ChatBlock, { type: "transaction_list" }>
}

export function ChatTransactionList({ block }: ChatTransactionListProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-2xl border border-border bg-card p-1">
        {block.items.map((snapshot, index) => (
          <ChatTransactionRow
            key={snapshot.id}
            snapshot={snapshot}
            isLast={index === block.items.length - 1}
          />
        ))}
      </div>
      {block.moreHref ? (
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href={block.moreHref}>Ver todos</Link>
        </Button>
      ) : null}
    </div>
  )
}
