"use client"

import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import type { FinanceCategory } from "@/src/modules/finance/shared/types/entities"
import { PlusIcon, XIcon } from "lucide-react"

type CategoryMultiTriggerProps = {
  categories: FinanceCategory[]
  onClick: () => void
  onRemove?: (categoryId: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CategoryMultiTrigger({
  categories,
  onClick,
  onRemove,
  placeholder = "Elegir categorías",
  disabled = false,
}: CategoryMultiTriggerProps) {
  if (categories.length === 0) {
    return (
      <CategoryCard
        name={placeholder}
        icon={null}
        isSystem={false}
        variant="pick"
        disabled={disabled}
        onPress={onClick}
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          name={category.name}
          icon={category.icon}
          color={category.color}
          isSystem={category.isSystem}
          disabled={disabled}
          onPress={onClick}
          trailing={
            onRemove ? (
              <button
                type="button"
                aria-label={`Quitar ${category.name}`}
                disabled={disabled}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground disabled:opacity-50"
                onClick={() => onRemove(category.id)}
              >
                <XIcon className="size-4" />
              </button>
            ) : undefined
          }
        />
      ))}
      <CategoryCard
        name="Añadir categoría"
        icon={null}
        isSystem={false}
        variant="pick"
        disabled={disabled}
        onPress={onClick}
        leading={<PlusIcon className="size-5" />}
      />
    </div>
  )
}
