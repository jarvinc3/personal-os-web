"use client"

import {
  SUBSCRIPTION_SORTS,
  SUBSCRIPTION_SORT_LABEL,
  type SubscriptionSort,
} from "@/src/modules/finance/subscriptions/lib/subscription-filters"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/settings/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import {
  ArrowDownWideNarrowIcon,
  CalendarClockIcon,
  CheckIcon,
  HashIcon,
  SortAscIcon,
  XIcon,
} from "lucide-react"

const SORT_ICON = {
  NEXT_DATE: CalendarClockIcon,
  AMOUNT: HashIcon,
  NAME: SortAscIcon,
} as const

type SubscriptionSortSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: SubscriptionSort
  onChange: (next: SubscriptionSort) => void
}

/** Order of the subscription list. Applied by the API, not by the client. */
export function SubscriptionSortSheet({
  open,
  onOpenChange,
  value,
  onChange,
}: SubscriptionSortSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Ordenar por"
      actions={{
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4 shrink-0" />
            Cerrar
          </Button>
        ),
      }}
    >
      <SettingsSection title="Ordenar por">
        {SUBSCRIPTION_SORTS.map((sort, index) => (
          <SettingsRow
            key={sort}
            icon={SORT_ICON[sort]}
            label={SUBSCRIPTION_SORT_LABEL[sort]}
            isLast={index === SUBSCRIPTION_SORTS.length - 1}
            onPress={() => {
              onChange(sort)
              onOpenChange(false)
            }}
            trailing={
              sort === value ? (
                <CheckIcon className="size-4 text-primary" aria-hidden />
              ) : null
            }
          />
        ))}
      </SettingsSection>
      <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <ArrowDownWideNarrowIcon className="size-3.5" aria-hidden />
        El orden se aplica a toda la lista, no solo a lo cargado.
      </p>
    </BottomSheet>
  )
}
