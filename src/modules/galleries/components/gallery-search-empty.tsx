"use client"

import { SearchXIcon, XIcon } from "lucide-react"

import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"

type GallerySearchEmptyProps = {
  term: string
  onClear: () => void
}

/** Estado vacío de la búsqueda: qué se buscó y cómo volver a la lista. */
export function GallerySearchEmpty({ term, onClear }: GallerySearchEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Sin resultados</EmptyTitle>
        <EmptyDescription>
          Ningún componente coincide con «{term}».
        </EmptyDescription>
      </EmptyHeader>
      <Button type="button" variant="outline" onClick={onClear}>
        <XIcon />
        Limpiar búsqueda
      </Button>
    </Empty>
  )
}
