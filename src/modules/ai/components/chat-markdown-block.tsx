"use client"

import { cn } from "@/src/shared/lib/utils"
import type { ReactNode } from "react"

type ChatMarkdownBlockProps = {
  content: string
  variant?: "user" | "assistant"
}

type MarkdownSegment =
  { type: "lines"; lines: string[] } | { type: "table"; rows: string[][] }

function isTableRow(line: string): boolean {
  const trimmed = line.trim()
  return (
    trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|", 1)
  )
}

function isTableSeparatorRow(line: string): boolean {
  const trimmed = line.trim()
  if (!isTableRow(trimmed)) {
    return false
  }
  return trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .every((cell) => /^[\s\-:]+$/.test(cell.trim()))
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
}

function parseMarkdownSegments(content: string): MarkdownSegment[] {
  const lines = content.split("\n")
  const segments: MarkdownSegment[] = []
  let lineBuffer: string[] = []
  let index = 0

  const flushLines = () => {
    if (lineBuffer.length > 0) {
      segments.push({ type: "lines", lines: lineBuffer })
      lineBuffer = []
    }
  }

  while (index < lines.length) {
    if (isTableRow(lines[index])) {
      flushLines()
      const tableLines: string[] = []
      while (index < lines.length && isTableRow(lines[index])) {
        tableLines.push(lines[index])
        index += 1
      }
      const rows = tableLines
        .filter((line) => !isTableSeparatorRow(line))
        .map(parseTableRow)
        .filter((row) => row.some((cell) => cell.length > 0))
      if (rows.length > 0) {
        segments.push({ type: "table", rows })
      }
      continue
    }

    lineBuffer.push(lines[index])
    index += 1
  }

  flushLines()
  return segments
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, partIndex) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${partIndex}`}>{part.slice(2, -2)}</strong>
      )
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${keyPrefix}-${partIndex}`}
          className="rounded bg-muted px-1 font-mono text-xs"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <span key={`${keyPrefix}-${partIndex}`}>{part}</span>
  })
}

function parseHeading(line: string): { level: number; text: string } | null {
  const match = line.match(/^(#{1,6})\s+(.+)$/)
  if (!match) {
    return null
  }
  return { level: match[1].length, text: match[2].trim() }
}

function headingClassName(level: number): string {
  switch (level) {
    case 1:
      return "text-lg font-bold leading-6"
    case 2:
      return "text-base font-bold leading-5"
    case 3:
      return "text-sm font-semibold leading-5"
    default:
      return "text-sm font-medium leading-5"
  }
}

function renderLines(lines: string[], textClass: string, keyPrefix: string) {
  return lines.map((line, lineIndex) => {
    const heading = parseHeading(line.trim())
    const bullet = line.match(/^[-*]\s+(.*)/)
    const ordered = line.match(/^\d+\.\s+(.*)/)

    if (heading) {
      const Tag = heading.level <= 2 ? "h3" : "h4"
      return (
        <Tag
          key={`${keyPrefix}-${lineIndex}`}
          className={cn(
            headingClassName(heading.level),
            textClass,
            heading.level <= 2 ? "mt-2" : "mt-1.5"
          )}
        >
          {renderInline(heading.text, `${keyPrefix}-h-${lineIndex}`)}
        </Tag>
      )
    }

    if (bullet) {
      return (
        <div
          key={`${keyPrefix}-${lineIndex}`}
          className="flex flex-row gap-2 pl-1"
        >
          <span className={textClass}>•</span>
          <p className={cn("flex-1", textClass)}>
            {renderInline(bullet[1], `${keyPrefix}-b-${lineIndex}`)}
          </p>
        </div>
      )
    }

    if (ordered) {
      return (
        <div
          key={`${keyPrefix}-${lineIndex}`}
          className="flex flex-row gap-2 pl-1"
        >
          <span className={textClass}>{line.match(/^\d+/)?.[0]}.</span>
          <p className={cn("flex-1", textClass)}>
            {renderInline(ordered[1], `${keyPrefix}-o-${lineIndex}`)}
          </p>
        </div>
      )
    }

    if (!line.trim()) {
      return <div key={`${keyPrefix}-${lineIndex}`} className="h-2" />
    }

    return (
      <p key={`${keyPrefix}-${lineIndex}`} className={textClass}>
        {renderInline(line, `${keyPrefix}-l-${lineIndex}`)}
      </p>
    )
  })
}

function renderTable(
  rows: string[][],
  textClass: string,
  variant: "user" | "assistant",
  keyPrefix: string
) {
  const columnCount = Math.max(...rows.map((row) => row.length), 1)
  const headerRow = rows[0] ?? []
  const bodyRows = rows.slice(1)
  const headerBg = variant === "user" ? "bg-primary-foreground/10" : "bg-muted"
  const borderClass =
    variant === "user" ? "border-primary-foreground/20" : "border-border"

  return (
    <div
      key={keyPrefix}
      className="my-1 w-full max-w-full min-w-0 overflow-x-auto"
    >
      <table
        className={cn("w-full min-w-full border-collapse text-xs", borderClass)}
      >
        <thead className={headerBg}>
          <tr>
            {Array.from({ length: columnCount }, (_, columnIndex) => (
              <th
                key={`${keyPrefix}-h-${columnIndex}`}
                className={cn(
                  "border px-2 py-1.5 text-left align-top font-semibold",
                  borderClass
                )}
              >
                <span
                  className={cn(
                    "block wrap-break-word whitespace-normal",
                    textClass
                  )}
                >
                  {renderInline(
                    headerRow[columnIndex] ?? "",
                    `${keyPrefix}-h-${columnIndex}`
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr key={`${keyPrefix}-r-${rowIndex}`}>
              {Array.from({ length: columnCount }, (_, columnIndex) => (
                <td
                  key={`${keyPrefix}-r-${rowIndex}-c-${columnIndex}`}
                  className={cn("border px-2 py-1.5 align-top", borderClass)}
                >
                  <span
                    className={cn(
                      "block wrap-break-word whitespace-normal",
                      textClass
                    )}
                  >
                    {renderInline(
                      row[columnIndex] ?? "",
                      `${keyPrefix}-r-${rowIndex}-c-${columnIndex}`
                    )}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ChatMarkdownBlock({
  content,
  variant = "assistant",
}: ChatMarkdownBlockProps) {
  const segments = parseMarkdownSegments(content)
  const textClass =
    variant === "user" ? "text-primary-foreground" : "text-foreground"

  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      {segments.map((segment, segmentIndex) => {
        if (segment.type === "table") {
          return renderTable(
            segment.rows,
            textClass,
            variant,
            `table-${segmentIndex}`
          )
        }
        return (
          <div key={`lines-${segmentIndex}`} className="flex flex-col gap-1">
            {renderLines(segment.lines, textClass, `lines-${segmentIndex}`)}
          </div>
        )
      })}
    </div>
  )
}
