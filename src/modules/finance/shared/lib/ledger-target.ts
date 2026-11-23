import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import {
  optionalId,
  optionalTrimmed,
  type PayloadResult,
} from "./ledger-fields.ts"

export function encodeLedgerTarget(
  kind: "account" | "card",
  id: string
): string {
  return `${kind}:${id}`
}

export function splitLedgerTarget(value: string | undefined): {
  accountId?: string
  cardId?: string
} {
  const trimmed = optionalTrimmed(value)
  if (!trimmed || trimmed === CATALOG_NONE) {
    return {}
  }
  if (trimmed.startsWith("account:")) {
    const accountId = trimmed.slice("account:".length)
    return accountId ? { accountId } : {}
  }
  if (trimmed.startsWith("card:")) {
    const cardId = trimmed.slice("card:".length)
    return cardId ? { cardId } : {}
  }
  return {}
}

export function buildLedgerTargetOptions(
  accounts: { id: string; name: string }[],
  cards: { id: string; name: string }[]
): { value: string; label: string }[] {
  return [
    { value: CATALOG_NONE, label: "Elige cuenta o tarjeta" },
    ...accounts.map((account) => ({
      value: encodeLedgerTarget("account", account.id),
      label: `Cuenta · ${account.name}`,
    })),
    ...cards.map((card) => ({
      value: encodeLedgerTarget("card", card.id),
      label: `Tarjeta · ${card.name}`,
    })),
  ]
}

export function xorTarget(
  accountId: string | undefined,
  cardId: string | undefined,
  label: string
): PayloadResult<{ accountId?: string; cardId?: string }> {
  const account = optionalId(accountId)
  const card = optionalId(cardId)
  if (Boolean(account) === Boolean(card)) {
    return {
      ok: false,
      error: `Elige una cuenta o una tarjeta para ${label}, no ambas ni ninguna`,
    }
  }
  return {
    ok: true,
    body: account ? { accountId: account } : { cardId: card },
  }
}
