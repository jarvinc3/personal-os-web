"use client"

import { ChatBudgetProgress } from "@/src/modules/ai/components/blocks/chat-budget-progress"
import { ChatChart } from "@/src/modules/ai/components/blocks/chat-chart"
import { ChatLoanSummary } from "@/src/modules/ai/components/blocks/chat-loan-summary"
import { ChatTransactionCard } from "@/src/modules/ai/components/blocks/chat-transaction-card"
import { ChatTransactionList } from "@/src/modules/ai/components/blocks/chat-transaction-list"
import type { ChatBlock } from "@/src/modules/ai/types/chat.types"

type ChatBlockRendererProps = {
  block: ChatBlock
}

/** Renders native finance blocks. Unknown types render nothing. */
export function ChatBlockRenderer({ block }: ChatBlockRendererProps) {
  switch (block.type) {
    case "transaction_card":
      return <ChatTransactionCard block={block} />
    case "transaction_list":
      return <ChatTransactionList block={block} />
    case "budget_progress":
      return <ChatBudgetProgress block={block} />
    case "loan_summary":
      return <ChatLoanSummary block={block} />
    case "chart":
      return <ChatChart block={block} />
    default:
      return null
  }
}
