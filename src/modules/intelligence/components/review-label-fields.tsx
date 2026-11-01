"use client"

import {
  RELEVANCE_LABELS,
  reviewSelectLabel,
  ROUTE_LABELS,
  SEMANTIC_TYPE_LABELS,
  type SemanticRoute,
  type SemanticType,
} from "@/src/modules/intelligence/review-labels"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Layers3, Tag } from "lucide-react"

export type ReviewRelevance = "" | "relevant" | "irrelevant"

type ReviewLabelFieldsProps<T extends SemanticType> = {
  fieldId: string
  relevance: ReviewRelevance
  semanticType: T | ""
  routes: SemanticRoute[]
  /** Tipos que este formulario admite; el lote deja fuera los que piden más datos. */
  semanticTypes: readonly T[]
  relevanceError?: string
  semanticTypeError?: string
  onRelevanceChange: (value: ReviewRelevance) => void
  onSemanticTypeChange: (value: T) => void
  onToggleRoute: (route: SemanticRoute) => void
}

/** Relevancia, tipo semántico y dominios: el vocabulario cerrado del back. */
export function ReviewLabelFields<T extends SemanticType>({
  fieldId,
  relevance,
  semanticType,
  routes,
  semanticTypes,
  relevanceError,
  semanticTypeError,
  onRelevanceChange,
  onSemanticTypeChange,
  onToggleRoute,
}: ReviewLabelFieldsProps<T>) {
  const relevanceLocked =
    semanticType === "SECURITY_ALERT" || semanticType === "SECURITY_OTP"

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor={`relevance-${fieldId}`}>
            <Tag data-icon="inline-start" className="size-4" /> Relevancia
          </FieldLabel>
          <Select
            value={relevance}
            onValueChange={(value) =>
              onRelevanceChange((value ?? "") as ReviewRelevance)
            }
            disabled={relevanceLocked}
          >
            <SelectTrigger id={`relevance-${fieldId}`} className="w-full">
              <Tag className="size-4" aria-hidden="true" />
              <SelectValue placeholder="Sin etiqueta">
                {(value: string | null) =>
                  reviewSelectLabel(value, RELEVANCE_LABELS, "Sin etiqueta")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="relevant">Relevante</SelectItem>
                <SelectItem value="irrelevant">No relevante</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {relevanceError ? <FieldError>{relevanceError}</FieldError> : null}
        </Field>
        <Field>
          <FieldLabel htmlFor={`semantic-${fieldId}`}>
            <Tag data-icon="inline-start" className="size-4" /> Tipo semántico
          </FieldLabel>
          <Select<string>
            value={semanticType}
            onValueChange={(value) => value && onSemanticTypeChange(value as T)}
          >
            <SelectTrigger id={`semantic-${fieldId}`} className="w-full">
              <Tag className="size-4" aria-hidden="true" />
              <SelectValue placeholder="Elige un tipo">
                {(value: string | null) =>
                  reviewSelectLabel(
                    value,
                    SEMANTIC_TYPE_LABELS,
                    "Elige un tipo"
                  )
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {semanticTypes.map((value) => (
                  <SelectItem key={value} value={value}>
                    {SEMANTIC_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {semanticTypeError ? (
            <FieldError>{semanticTypeError}</FieldError>
          ) : null}
        </Field>
      </div>
      <Field>
        <FieldLabel>
          <Layers3 data-icon="inline-start" className="size-4" /> Dominios
        </FieldLabel>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Dominios"
        >
          {(Object.entries(ROUTE_LABELS) as [SemanticRoute, string][]).map(
            ([route, label]) => (
              <Button
                key={route}
                type="button"
                size="sm"
                variant={routes.includes(route) ? "default" : "outline"}
                aria-pressed={routes.includes(route)}
                onClick={() => onToggleRoute(route)}
              >
                <Layers3 className="size-4" aria-hidden="true" /> {label}
              </Button>
            )
          )}
        </div>
        {!routes.length ? (
          <p className="text-xs text-muted-foreground">Sin dominios</p>
        ) : null}
      </Field>
    </>
  )
}
