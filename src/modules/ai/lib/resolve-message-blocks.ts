import type {
  AiActionSummary,
  ChatBlock,
} from "@/src/modules/ai/types/chat.types"

function pickRicherMarkdown(content: string, blocks?: ChatBlock[]): string {
  const blockMarkdown =
    blocks?.find((block) => block.type === "markdown")?.content?.trim() ?? ""
  const trimmedContent = content.trim()

  if (trimmedContent.length >= blockMarkdown.length) {
    return trimmedContent || blockMarkdown || "…"
  }

  return blockMarkdown || trimmedContent || "…"
}

export function resolveMessageBlocks(
  content: string,
  blocks?: ChatBlock[],
  actions?: AiActionSummary[]
): ChatBlock[] {
  const markdownContent = pickRicherMarkdown(content, blocks)
  const actionBlocks =
    blocks?.filter(
      (block): block is Extract<ChatBlock, { type: "action" }> =>
        block.type === "action"
    ) ?? []

  if (blocks?.length) {
    return blocks.map((block) =>
      block.type === "markdown" ? { ...block, content: markdownContent } : block
    )
  }

  const resolvedActions = actions ?? actionBlocks.map((block) => block.action)

  return [
    { type: "markdown", content: markdownContent },
    ...resolvedActions.map((action) => ({ type: "action" as const, action })),
  ]
}
