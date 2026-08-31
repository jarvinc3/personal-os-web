"use client"

import { CategorySheet } from "@/src/modules/finance/components/category-sheet"
import { useCategories } from "@/src/modules/finance/hooks/use-categories"
import { groupCategoriesByParent } from "@/src/modules/finance/lib/category-tree"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type { FinanceCategory } from "@/src/modules/finance/types/entities"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { PlusIcon, TagsIcon } from "lucide-react"
import { useMemo, useState } from "react"

type CategoriesSectionProps = {
  enabled: boolean
}

export function FinanceCategoriesSection({ enabled }: CategoriesSectionProps) {
  const categoriesQuery = useCategories(enabled)
  const categories = categoriesQuery.data ?? []
  const groups = useMemo(
    () => groupCategoriesByParent(categoriesQuery.data ?? []),
    [categoriesQuery.data],
  )
  const [editing, setEditing] = useState<FinanceCategory | null | undefined>(
    undefined,
  )
  const sheetOpen = editing !== undefined

  const errorMessage = categoriesQuery.error
    ? financeErrorMessage(categoriesQuery.error)
    : null

  const rows = groups.flatMap((group) => [
    { category: group.category, nested: false },
    ...group.children.map((child) => ({ category: child, nested: true })),
  ])

  return (
    <>
      <SettingsSection
        title="Categorías"
        description="Lista plana del API agrupada en el cliente por parentId. El icono es emoji."
      >
        <div className="flex justify-end border-b border-border/60 p-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing(null)}
          >
            <PlusIcon />
            Crear categoría
          </Button>
        </div>
        {errorMessage ? (
          <p className="p-4 text-sm text-destructive">{errorMessage}</p>
        ) : null}
        {categoriesQuery.isPending ? (
          <div className="flex justify-center p-6">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No hay categorías. Crea una custom con un emoji.
          </p>
        ) : (
          rows.map(({ category, nested }, index) => (
            <SettingsRow
              key={category.id}
              label={`${nested ? "↳ " : ""}${category.icon ? `${category.icon} ` : ""}${category.name}`}
              value={category.isSystem ? "Sistema" : "Custom"}
              accentColor={category.color ?? undefined}
              icon={TagsIcon}
              onPress={() => setEditing(category)}
              isLast={index === rows.length - 1}
            />
          ))
        )}
      </SettingsSection>
      <CategorySheet
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined)
        }}
        category={editing ?? null}
        categories={categories}
      />
    </>
  )
}
