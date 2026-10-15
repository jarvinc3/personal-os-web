"use client"

import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import type { FinanceCategory } from "@/src/modules/finance/shared/types/entities"

type CategoryTriggerProps = {
  category: FinanceCategory | null
  onClick: () => void
  placeholder?: string
  disabled?: boolean
}

export function CategoryTrigger({
  category,
  onClick,
  placeholder = "Sin categoría",
  disabled = false,
}: CategoryTriggerProps) {
  if (!category) {
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
    <CategoryCard
      name={category.name}
      icon={category.icon}
      color={category.color}
      isSystem={category.isSystem}
      disabled={disabled}
      onPress={onClick}
    />
  )
}
