"use client"

import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import type { FinanceCategory } from "@/src/modules/finance/shared/types/entities"

type CategoryMultiTriggerProps = {
  categories: FinanceCategory[]
  onClick: () => void
  placeholder?: string
  disabled?: boolean
}

export function CategoryMultiTrigger({
  categories,
  onClick,
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
        onPress={disabled ? undefined : onClick}
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
          onPress={disabled ? undefined : onClick}
        />
      ))}
    </div>
  )
}
