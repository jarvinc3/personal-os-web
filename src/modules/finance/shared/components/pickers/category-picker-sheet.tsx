"use client"

import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { toggleCategorySelection } from "@/src/modules/finance/shared/lib/category-selection"
import {
  filterCategoriesByType,
  groupCategoriesByParent,
  searchCategoryGroups,
  sortCategoriesNewestFirst,
} from "@/src/modules/finance/shared/lib/category-tree"
import { foldSearchText } from "@/src/shared/lib/search-text"
import type {
  FinanceCategory,
  FinanceCategoryType,
} from "@/src/modules/finance/shared/types/entities"
import {
  EMPTY_COMPACT_CLASS_NAME,
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  SearchIcon,
  TagsIcon,
} from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"

const DEFAULT_NONE_LABEL = "Sin categoría"
const NO_EXCLUDED_IDS: string[] = []

type CategoryPickerSheetBaseProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: FinanceCategory[]
  categoryType: FinanceCategoryType
  /** Lists only root categories. Used to pick a parent category. */
  onlyParents?: boolean
  /** Hides these ids. Used to exclude the category being edited. */
  excludeIds?: string[]
  noneLabel?: string
  /** Creates the typed category; the caller selects it and closes the sheet. */
  onCreate?: (name: string) => void | Promise<void>
}

type CategoryPickerSheetSingleProps = CategoryPickerSheetBaseProps & {
  multiple?: false
  value?: string
  onSelect: (categoryId: string) => void
}

type CategoryPickerSheetMultipleProps = CategoryPickerSheetBaseProps & {
  multiple: true
  value: string[]
  onChange: (categoryIds: string[]) => void
}

export type CategoryPickerSheetProps =
  CategoryPickerSheetSingleProps | CategoryPickerSheetMultipleProps

export function CategoryPickerSheet(props: CategoryPickerSheetProps) {
  const {
    open,
    onOpenChange,
    categories,
    categoryType,
    onlyParents = false,
    excludeIds = NO_EXCLUDED_IDS,
    noneLabel = DEFAULT_NONE_LABEL,
    onCreate,
  } = props
  const [search, setSearch] = useState("")
  const [manualOpen, setManualOpen] = useState<Record<string, boolean>>({})
  const groups = useMemo(() => {
    const excluded = new Set(excludeIds)
    const typed = filterCategoriesByType(categories, categoryType).filter(
      (item) => !excluded.has(item.id)
    )
    const pool = onlyParents
      ? typed.filter((item) => item.parentId == null)
      : typed
    return groupCategoriesByParent(sortCategoriesNewestFirst(pool))
  }, [categories, categoryType, onlyParents, excludeIds])
  const hits = useMemo(
    () => searchCategoryGroups(groups, search),
    [groups, search]
  )
  const searching = foldSearchText(search).length > 0
  const typedName = search.trim()
  const exactMatch =
    typedName.length > 0 &&
    filterCategoriesByType(categories, categoryType).some(
      (item) => foldSearchText(item.name) === foldSearchText(typedName)
    )
  const canCreate = Boolean(onCreate) && typedName.length > 0 && !exactMatch
  const showNone =
    !searching || foldSearchText(noneLabel).includes(foldSearchText(search))
  const selectedIds = props.multiple ? props.value : []
  const selected = new Set(selectedIds)

  useEffect(() => {
    if (!open) {
      // A picker can be replaced by another sheet without a close callback,
      // so reset on the open flag instead of the close handler.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch("")
      setManualOpen({})
    }
  }, [open])

  function select(categoryId: string) {
    if (props.multiple) {
      props.onChange(toggleCategorySelection(props.value, categoryId))
      return
    }
    props.onSelect(categoryId)
    onOpenChange(false)
  }

  function createFromSearch() {
    if (!onCreate) {
      return
    }
    void onCreate(typedName)
  }

  function selectedTrailing(categoryId: string, expand?: ReactNode) {
    if (!props.multiple || !selected.has(categoryId)) {
      return expand
    }
    return (
      <>
        <CheckIcon className="size-4 text-primary" aria-hidden />
        {expand}
      </>
    )
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Categoría">
      <div className="sticky -top-5 z-10 bg-background pt-3 pb-1">
        <FormTextField
          icon={SearchIcon}
          type="search"
          value={search}
          onChange={setSearch}
          placeholder="Buscar categoría"
          ariaLabel="Buscar categoría"
          autoComplete="off"
          className="min-h-10"
        />
      </div>

      {canCreate ? (
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-3 py-3 text-left",
            PRESSABLE_CLASS
          )}
          onClick={createFromSearch}
        >
          <PlusIcon className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium">Crear «{typedName}»</span>
        </button>
      ) : null}

      {showNone ? (
        <button
          key={search}
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 text-left",
            PRESSABLE_CLASS,
            searching && "animate-search-flash"
          )}
          onClick={() => select(CATALOG_NONE)}
        >
          <TagsIcon className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium">{noneLabel}</span>
          {props.multiple && selectedIds.length === 0 ? (
            <CheckIcon className="ml-auto size-4 text-primary" aria-hidden />
          ) : null}
        </button>
      ) : null}

      {groups.length === 0 ? (
        <Empty className={EMPTY_COMPACT_CLASS_NAME}>
          <EmptyHeader>
            <EmptyTitle>No hay categorías de este tipo</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : hits.length === 0 && !showNone ? (
        <Empty className={EMPTY_COMPACT_CLASS_NAME}>
          <EmptyHeader>
            <EmptyTitle>Ninguna categoría coincide</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {hits.map((hit) => {
            const parent = hit.category
            const flash = hit.parentMatches ? "animate-search-flash" : undefined
            if (hit.children.length === 0) {
              return (
                <CategoryCard
                  key={`${parent.id}:${search}`}
                  name={parent.name}
                  icon={parent.icon}
                  color={parent.color}
                  isSystem={parent.isSystem}
                  onPress={() => select(parent.id)}
                  className={flash}
                  trailing={selectedTrailing(parent.id)}
                />
              )
            }
            const open = searching
              ? hit.open || Boolean(manualOpen[parent.id])
              : Boolean(manualOpen[parent.id])
            return (
              <Collapsible
                key={parent.id}
                className="group/category"
                open={open}
                onOpenChange={(next) =>
                  setManualOpen((current) => ({
                    ...current,
                    [parent.id]: next,
                  }))
                }
              >
                <CategoryCard
                  key={`${parent.id}:${search}`}
                  name={parent.name}
                  icon={parent.icon}
                  color={parent.color}
                  isSystem={parent.isSystem}
                  onPress={() => select(parent.id)}
                  className={flash}
                  trailing={selectedTrailing(
                    parent.id,
                    <CollapsibleTrigger
                      type="button"
                      className="flex size-8 shrink-0 items-center justify-center text-muted-foreground"
                      aria-label={`Expandir ${parent.name}`}
                    >
                      <ChevronDownIcon className="size-4 transition-transform group-data-open/category:rotate-180" />
                    </CollapsibleTrigger>
                  )}
                />
                <CollapsibleContent className="mt-2 flex flex-col gap-2 pl-7">
                  {hit.children.map((child) => {
                    const childHit = hit.matchingChildren.some(
                      (match) => match.id === child.id
                    )
                    return (
                      <CategoryCard
                        key={`${child.id}:${search}`}
                        name={child.name}
                        icon={child.icon}
                        color={child.color ?? parent.color}
                        isSystem={child.isSystem}
                        onPress={() => select(child.id)}
                        className={
                          childHit ? "animate-search-flash" : undefined
                        }
                        trailing={selectedTrailing(child.id)}
                      />
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      )}
    </BottomSheet>
  )
}
