"use client"

import {
  CategoryCard,
  subcategoryCountLabel,
} from "@/src/modules/finance/shared/components/category-card"
import { CategorySheet } from "@/src/modules/finance/catalog/components/category-sheet"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import {
  useCategories,
  useUpdateCategory,
} from "@/src/modules/finance/shared/hooks/use-categories"
import { useSheetListEntity } from "@/src/modules/finance/shared/hooks/use-sheet-entity"
import {
  type CategoryGroup,
  applyLocalCategoryOrder,
  filterCategoriesByType,
  groupCategoriesByParent,
  sortCategoriesNewestFirst,
} from "@/src/modules/finance/shared/lib/category-tree"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type {
  FinanceCategory,
  FinanceCategoryType,
} from "@/src/modules/finance/shared/types/entities"
import { Fab } from "@/src/shared/components/fab/fab"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  ChevronDownIcon,
  GripVerticalIcon,
  TagsIcon,
  UnlinkIcon,
} from "lucide-react"
import { Reorder, useDragControls } from "motion/react"
import { useMemo, useState, type PointerEvent, type ReactNode } from "react"

type CategoriesSectionProps = {
  enabled: boolean
  /** When true, tapping a category opens the edit sheet. */
  editable?: boolean
}

function mergeMovedIds(
  previous: string[],
  nextMoved: string[],
  moving: Set<string>
): string[] {
  const rest = previous.filter(
    (id) => !moving.has(id) && !nextMoved.includes(id)
  )
  return [...nextMoved, ...rest]
}

function DragHandle({
  onPointerDown,
}: {
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      type="button"
      aria-label="Reordenar"
      className="flex size-8 shrink-0 items-center justify-center text-muted-foreground"
      onPointerDown={onPointerDown}
    >
      <GripVerticalIcon className="size-4" />
    </button>
  )
}

function CategoryGroupBlock({
  group,
  orderIds,
  onReorderChildren,
  onEdit,
  onUnlink,
  unlinkingId,
}: {
  group: CategoryGroup<FinanceCategory> & { id: string }
  orderIds: string[]
  onReorderChildren: (parentId: string, nextIds: string[]) => void
  onEdit?: (category: FinanceCategory) => void
  onUnlink?: (category: FinanceCategory) => void
  unlinkingId?: string
}) {
  const controls = useDragControls()
  const { category, children } = group
  const orderedChildren = useMemo(
    () =>
      applyLocalCategoryOrder(sortCategoriesNewestFirst(children), orderIds),
    [children, orderIds]
  )
  const childIds = orderedChildren.map((child) => child.id)

  const card = (item: FinanceCategory, extra?: ReactNode) => (
    <CategoryCard
      name={item.name}
      icon={item.icon}
      color={item.color}
      isSystem={item.isSystem}
      description={
        item.id === category.id && children.length > 0
          ? subcategoryCountLabel(children.length)
          : undefined
      }
      onPress={onEdit ? () => onEdit(item) : undefined}
      trailing={extra}
    />
  )

  const body =
    children.length === 0 ? (
      card(
        category,
        <DragHandle onPointerDown={(event) => controls.start(event)} />
      )
    ) : (
      <Collapsible className="group/category">
        {card(
          category,
          <>
            <CollapsibleTrigger
              type="button"
              className="flex size-8 shrink-0 items-center justify-center text-muted-foreground"
              aria-label={`Expandir ${category.name}`}
            >
              <ChevronDownIcon className="size-4.5 transition-transform group-data-open/category:rotate-180" />
            </CollapsibleTrigger>
            <DragHandle onPointerDown={(event) => controls.start(event)} />
          </>
        )}
        <CollapsibleContent>
          <Reorder.Group
            axis="y"
            values={childIds}
            onReorder={(next) => onReorderChildren(category.id, next)}
            className="mt-2 flex flex-col gap-2 pl-7"
          >
            {orderedChildren.map((child) => (
              <ChildCategoryRow
                key={child.id}
                category={child}
                parentColor={category.color}
                onEdit={onEdit}
                onUnlink={onUnlink}
                unlinking={unlinkingId === child.id}
              />
            ))}
          </Reorder.Group>
        </CollapsibleContent>
      </Collapsible>
    )

  return (
    <Reorder.Item
      value={category.id}
      dragListener={false}
      dragControls={controls}
      className="list-none"
    >
      {body}
    </Reorder.Item>
  )
}

function ChildCategoryRow({
  category,
  parentColor,
  onEdit,
  onUnlink,
  unlinking,
}: {
  category: FinanceCategory
  parentColor?: string | null
  onEdit?: (category: FinanceCategory) => void
  onUnlink?: (category: FinanceCategory) => void
  unlinking: boolean
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={category.id}
      dragListener={false}
      dragControls={controls}
      className="list-none"
    >
      <CategoryCard
        name={category.name}
        icon={category.icon}
        color={category.color ?? parentColor}
        isSystem={category.isSystem}
        onPress={onEdit ? () => onEdit(category) : undefined}
        trailing={
          <>
            {onUnlink && !category.isSystem ? (
              <button
                type="button"
                aria-label="Quitar como subcategoría"
                className="flex size-8 shrink-0 items-center justify-center text-muted-foreground disabled:opacity-50"
                disabled={unlinking}
                onClick={() => onUnlink(category)}
              >
                <UnlinkIcon className="size-4" />
              </button>
            ) : null}
            <DragHandle onPointerDown={(event) => controls.start(event)} />
          </>
        }
      />
    </Reorder.Item>
  )
}

export function FinanceCategoriesSection({
  enabled,
  editable,
}: CategoriesSectionProps) {
  const [listType, setListType] = useState<FinanceCategoryType>("EXPENSE")
  const [orderIds, setOrderIds] = useState<string[]>([])
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null)
  const categoriesQuery = useCategories(enabled)
  const updateCategory = useUpdateCategory()
  const categories = categoriesQuery.data ?? []
  const filtered = useMemo(
    () =>
      sortCategoriesNewestFirst(
        filterCategoriesByType(categoriesQuery.data ?? [], listType)
      ),
    [categoriesQuery.data, listType]
  )
  const groups = useMemo(() => {
    const grouped = groupCategoriesByParent(filtered).map((group) => ({
      ...group,
      id: group.category.id,
    }))
    return applyLocalCategoryOrder(grouped, orderIds)
  }, [filtered, orderIds])
  const rootIds = groups.map((group) => group.category.id)
  const {
    open: openCategorySheet,
    sheetId: categorySheetId,
    setOpen: setOpenCategorySheet,
  } = useSheetParam(FINANCE_SHEET_KEYS.category)
  const editing = useSheetListEntity(
    openCategorySheet,
    categorySheetId,
    categoriesQuery.data,
    categoriesQuery.isPending,
    setOpenCategorySheet
  )

  const errorMessage = categoriesQuery.error
    ? financeErrorMessage(categoriesQuery.error)
    : null

  function onEdit(category: FinanceCategory) {
    setOpenCategorySheet(true, category.id)
  }

  async function onUnlink(category: FinanceCategory) {
    setUnlinkingId(category.id)
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        body: { parentId: null },
      })
      appToast.success({ text1: "Subcategoría quitada" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    } finally {
      setUnlinkingId(null)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <Tabs
          value={listType}
          onValueChange={(next) => {
            if (next === "EXPENSE" || next === "INCOME") {
              setListType(next)
            }
          }}
          className="w-full gap-0"
        >
          <TabsList className="h-auto w-full rounded-2xl p-1" variant="default">
            <TabsTrigger value="EXPENSE" className="rounded-xl px-3 py-2">
              Gastos
            </TabsTrigger>
            <TabsTrigger value="INCOME" className="rounded-xl px-3 py-2">
              Ingresos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="EXPENSE" className="hidden" />
          <TabsContent value="INCOME" className="hidden" />
        </Tabs>
        <div>
          {errorMessage ? (
            <FinanceErrorState
              message={errorMessage}
              onRetry={() => void categoriesQuery.refetch()}
              isRetrying={categoriesQuery.isFetching}
            />
          ) : null}
          <AsyncRegion
            pending={categoriesQuery.isPending}
            pendingFallback={<FinanceListSkeleton />}
            empty={groups.length === 0}
            emptyFallback={
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <TagsIcon />
                  </EmptyMedia>
                  <EmptyTitle>No hay categorías</EmptyTitle>
                  <EmptyDescription>
                    Crea una con el botón de más.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            }
          >
            <Reorder.Group
              axis="y"
              values={rootIds}
              onReorder={(next) =>
                setOrderIds((current) =>
                  mergeMovedIds(current, next, new Set(rootIds))
                )
              }
              className="flex flex-col gap-2"
            >
              {groups.map((group) => (
                <CategoryGroupBlock
                  key={group.category.id}
                  group={group}
                  orderIds={orderIds}
                  onReorderChildren={(_parentId, next) =>
                    setOrderIds((current) =>
                      mergeMovedIds(
                        current,
                        next,
                        new Set(group.children.map((child) => child.id))
                      )
                    )
                  }
                  onEdit={editable ? onEdit : undefined}
                  onUnlink={
                    editable ? (category) => void onUnlink(category) : undefined
                  }
                  unlinkingId={unlinkingId ?? undefined}
                />
              ))}
            </Reorder.Group>
          </AsyncRegion>
        </div>
      </div>

      <Fab
        label="Crear categoría"
        disabled={!enabled}
        onClick={() => setOpenCategorySheet(true, null)}
      />

      <CategorySheet
        open={openCategorySheet}
        onOpenChange={setOpenCategorySheet}
        pending={Boolean(categorySheetId) && !editing}
        category={editing}
        categories={categories}
        defaultType={listType}
      />
    </>
  )
}
