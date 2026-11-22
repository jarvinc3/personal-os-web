"use client"

import {
  CodeBlockContent,
  CodeBlockLine,
} from "@/src/shared/components/ui/code-block"
import { useHighlightedCode } from "@/src/shared/hooks/use-highlighted-code"
import { cn } from "@/src/shared/lib/utils"

type HighlightedCodeProps = {
  code: string
  language?: string
  className?: string
}

/** Código con los colores del tema, línea por línea. */
export function HighlightedCode({
  code,
  language = "tsx",
  className,
}: HighlightedCodeProps) {
  const lines = useHighlightedCode(code, language)

  return (
    <CodeBlockContent className={cn(className)}>
      {lines.map((line, index) => (
        <CodeBlockLine key={index}>{line}</CodeBlockLine>
      ))}
    </CodeBlockContent>
  )
}
