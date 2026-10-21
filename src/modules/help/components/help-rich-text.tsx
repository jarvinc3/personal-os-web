"use client"

import { HELP_LINK_CLASS } from "@/src/modules/help/constants/help-ui"
import {
  glossaryTermHref,
  helpGuideHref,
} from "@/src/modules/help/lib/help-links"
import { parseHelpText } from "@/src/modules/help/lib/help-text"
import Link from "next/link"
import { Fragment } from "react"

type HelpRichTextProps = {
  text: string
  onNavigate?: () => void
}

export function HelpRichText({ text, onNavigate }: HelpRichTextProps) {
  return parseHelpText(text).map((segment, index) => {
    if (segment.kind === "text") {
      return <Fragment key={index}>{segment.value}</Fragment>
    }

    const href =
      segment.kind === "guide"
        ? helpGuideHref(segment.slug)
        : glossaryTermHref(segment.slug)

    return (
      <Link
        key={`${segment.kind}-${segment.slug}-${index}`}
        href={href}
        className={HELP_LINK_CLASS}
        onClick={onNavigate}
      >
        {segment.value}
      </Link>
    )
  })
}
