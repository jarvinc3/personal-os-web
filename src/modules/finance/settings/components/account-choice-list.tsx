import { OptionRow } from "@/src/shared/components/layout/form-blocks"
import { getModule } from "@/src/shared/constants/module-registry"
import { Landmark, Wallet } from "lucide-react"

const MODULE_ACCENT = getModule("finance").accent

export type AccountOption = { id: string; name: string; currency: string }

type AccountChoiceListProps = {
  accounts: AccountOption[]
  selectedId: string
  onSelect: (accountId: string) => void
  noneLabel: string
}

export function AccountChoiceList({
  accounts,
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
        <OptionRow
          key={account.id}
          icon={Landmark}
          iconColor={MODULE_ACCENT}
          accentColor={MODULE_ACCENT}
          label={account.name}
          description={account.currency}
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
