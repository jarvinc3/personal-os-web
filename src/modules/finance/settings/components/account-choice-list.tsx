import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { FinanceAccount } from "@/src/modules/finance/shared/types/entities"
import { OptionRow } from "@/src/shared/components/forms/option-row"
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
      <OptionRow
        icon={Wallet}
        iconColor={MODULE_ACCENT}
        accentColor={MODULE_ACCENT}
        label={noneLabel}
        selected={selectedId === ""}
        onPress={() => onSelect("")}
      />
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
        <p className="px-2 text-sm text-muted-foreground">
          No hay cuentas todavía.
        </p>
      ) : null}
    </>
  )
}
