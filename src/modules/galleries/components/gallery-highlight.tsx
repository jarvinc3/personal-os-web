"use client"

import { Fragment } from "react"

import { highlightSegments } from "@/src/modules/galleries/lib/highlight"

type GalleryHighlightProps = {
  text: string
  query: string
}

/** Texto con el fragmento que coincide con la búsqueda resaltado. */
export function GalleryHighlight({ text, query }: GalleryHighlightProps) {
  const segments = highlightSegments(text, query)

  return (
    <>
      {segments.map((segment, index) => {
        const key = `${index}-${segment.isMatch ? "match" : "text"}`

        if (!segment.isMatch) {
          return <Fragment key={key}>{segment.text}</Fragment>
        }

        return (
          <mark
            key={key}
            className="rounded-sm bg-primary/15 px-0.5 text-inherit"
          >
            {segment.text}
          </mark>
        )
      })}
    </>
  )
}
