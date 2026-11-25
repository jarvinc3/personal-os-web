import {
  FIELD_CHOICE_CLASS_NAME,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldMedia,
  FieldTitle,
} from "@/src/shared/components/ui/field"
import { cn } from "@/src/shared/lib/utils"
import {
  EMPTY_COMPACT_CLASS_NAME,
  Empty,
  EmptyHeader,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { FinanceAccount } from "@/src/modules/finance/shared/types/entities"
import { getModule } from "@/src/shared/constants/module-registry"
import { Wallet } from "lucide-react"

const MODULE_ACCENT = getModule("finance").accent

type AccountChoiceListProps = {
  accounts: FinanceAccount[]
  display: FinanceMoneyDisplay
  selectedId: string
  onSelect: (accountId: string) => void
  noneLabel: string
}

export function AccountChoiceList({
  accounts,
  display,
  selectedId,
  onSelect,
  noneLabel,
}: AccountChoiceListProps) {
  return (
    <>
      <FieldLabel
        onClick={() => onSelect("")}
        className={cn(
          FIELD_CHOICE_CLASS_NAME,
          selectedId === "" ? "border bg-card/50" : "border-border bg-card"
        )}
        style={selectedId === "" ? { borderColor: MODULE_ACCENT } : undefined}
      >
        <FieldMedia icon={Wallet} color={MODULE_ACCENT} />
        <FieldContent>
          <FieldTitle className="text-sm">{noneLabel}</FieldTitle>
        </FieldContent>
      </FieldLabel>
      {accounts.map((account) => (
        <AccountProductRow
          key={account.id}
          account={account}
          display={display}
          variant="compact"
          selected={selectedId === account.id}
          onPress={() => onSelect(account.id)}
        />
      ))}
      {accounts.length === 0 ? (
        <Empty className={EMPTY_COMPACT_CLASS_NAME}>
          <EmptyHeader>
            <EmptyTitle>No hay cuentas todavía</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : null}
    </>
  )
}
