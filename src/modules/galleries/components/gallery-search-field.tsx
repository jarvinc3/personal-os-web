"use client"

import { SearchIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"

type GallerySearchFieldProps = {
  value: string
  onValueChange: (value: string) => void
  label: string
  placeholder: string
}

/** Campo de búsqueda de la galería, igual en el índice y en cada categoría. */
export function GallerySearchField({
  value,
  onValueChange,
  label,
  placeholder,
}: GallerySearchFieldProps) {
  return (
    <InputGroup className="h-10">
      <InputGroupAddon align="inline-start">
        <SearchIcon className="text-muted-foreground" />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
      />
    </InputGroup>
  )
}
