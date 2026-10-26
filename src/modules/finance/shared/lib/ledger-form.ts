import type {
  FinanceAccount,
  FinanceCard,
} from "@/src/modules/finance/shared/types/entities"
import {
  formatDayMonthYear,
  formatShortClockTime,
} from "@/src/shared/lib/date-format"
import { zonedWallTimeToInstant } from "@/src/shared/lib/zoned-time"
import { splitLedgerTarget } from "./ledger-payloads.ts"
import { parseFinanceMoney } from "./money.ts"

/** Wall-clock parts of a stored transaction date: `YYYY-MM-DDTHH:mm`. */
const DATE_TIME_INPUT = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/
const DATE_INPUT = /^\d{4}-\d{2}-\d{2}$/
const DATE_TIME_FORM = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

/**
 * A destination only counts when it encodes a real account or card. The empty
 * picker value (`CATALOG_NONE`) is a non-empty string, so a length check alone
 * would accept it and enable saving a movement without a destination.
 */
export function isLedgerTargetInput(value: string): boolean {
  const target = splitLedgerTarget(value)
  return Boolean(target.accountId || target.cardId)
}

export function isPositiveAmountInput(value: string): boolean {
  const amount = parseFinanceMoney(value)
  if (amount === null) {
    return false
  }
  return amount > 0
}

/** Ceiling for a money amount in the client forms, under the stored decimal width. */
export const FINANCE_MAX_AMOUNT = 999_999_999.99

const MONEY_CENTS_INPUT = /^\d*\.?\d{0,2}$/

/** A money amount is written in cents: no digit survives past the second decimal. */
export function hasMoneyCentsInput(value: string): boolean {
  return MONEY_CENTS_INPUT.test(value.trim())
}

export function isWithinMaxAmountInput(value: string): boolean {
  const amount = parseFinanceMoney(value)
  if (amount === null) {
    return false
  }
  return amount <= FINANCE_MAX_AMOUNT
}

/**
 * Every money rule at once, for inputs that answer with one message instead of
 * naming the rule that failed.
 */
export function isMoneyAmountInput(value: string): boolean {
  return (
    hasMoneyCentsInput(value) &&
    isPositiveAmountInput(value) &&
    isWithinMaxAmountInput(value)
  )
}

/** A rate keeps up to the 8 decimals the API stores. */
export function isPositiveRateInput(value: string): boolean {
  if (!/^\d*\.?\d{0,8}$/.test(value.trim())) {
    return false
  }
  return isPositiveAmountInput(value)
}

/** The manual forms always carry a date and an hour. */
export function isDateTimeInput(value: string): boolean {
  return DATE_TIME_FORM.test(value)
}

export function todayDateInput(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

export function sliceDateInput(
  value: string | undefined,
  fallback = todayDateInput()
): string {
  if (!value) {
    return fallback
  }
  return value.slice(0, 10)
}

/**
 * A transaction is stored as midnight UTC of its calendar day. The manual
 * forms keep that convention with the hour the user typed, so the stored value
 * is the wall clock itself and nothing here converts time zones.
 */
export function nowDateTimeInput(now = new Date()): string {
  const hour = String(now.getHours()).padStart(2, "0")
  const minute = String(now.getMinutes()).padStart(2, "0")
  return `${todayDateInput(now)}T${hour}:${minute}`
}

/** `YYYY-MM-DDTHH:mm` for the form, taken from the stored value. */
export function sliceDateTimeInput(
  value: string | undefined,
  fallback = nowDateTimeInput()
): string {
  if (!value) {
    return fallback
  }
  const dateTime = value.match(DATE_TIME_INPUT)
  if (dateTime) {
    return `${dateTime[1]}T${dateTime[2]}:${dateTime[3]}`
  }
  if (DATE_INPUT.test(value)) {
    return `${value}T00:00`
  }
  return fallback
}

/** Wall-clock `YYYY-MM-DDTHH:mm` in the ISO instant the API stores. */
/**
 * The instant the form's wall clock names in the user's zone. The API stores
 * instants, so a bare `HH:mm` labelled as UTC lands hours away from the day the
 * user picked.
 */
export function wallClockToIso(value: string, timeZone: string): string {
  const dateTime = value.match(DATE_TIME_INPUT)
  if (dateTime) {
    return zonedWallTimeToInstant(
      `${dateTime[1]}T${dateTime[2]}:${dateTime[3]}`,
      timeZone
    )
  }
  if (DATE_INPUT.test(value)) {
    return zonedWallTimeToInstant(`${value}T00:00`, timeZone)
  }
  return value
}

/**
 * Hour as readable text, or null. Midnight means no hour was recorded, which
 * is every row saved before the forms asked for one.
 */
export function formatFinanceTimeLabel(
  value: string,
  locale: string
): string | null {
  const dateTime = value.match(DATE_TIME_INPUT)
  if (!dateTime) {
    return null
  }
  const hour = `${dateTime[2]}:${dateTime[3]}`
  if (hour === "00:00") {
    return null
  }
  return formatShortClockTime(hour, locale)
}

/** Date plus hour, when the value carries one. */
export function formatFinanceDateTimeLabel(
  value: string,
  locale: string
): string {
  const date = formatCalendarDate(value, locale)
  const time = formatFinanceTimeLabel(value, locale)
  if (!time) {
    return date
  }
  return `${date}, ${time}`
}

export function formatCalendarDate(value: string, locale: string): string {
  const slice = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slice)) {
    return value
  }
  const year = Number(slice.slice(0, 4))
  const month = Number(slice.slice(5, 7))
  const day = Number(slice.slice(8, 10))
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return formatDayMonthYear(date, locale)
}

export function currencyForTarget(
  destination: string,
  accounts: FinanceAccount[],
  cards: FinanceCard[],
  fallback: string
): string {
  const target = splitLedgerTarget(destination)
  const account = accounts.find((item) => item.id === target.accountId)
  if (account?.currency) {
    return account.currency
  }
  const card = cards.find((item) => item.id === target.cardId)
  const cardCurrency = card?.balances[0]?.currency
  if (cardCurrency) {
    return cardCurrency
  }
  return fallback
}

export function ledgerTargetLabel(
  destination: string,
  accounts: FinanceAccount[],
  cards: FinanceCard[]
): string | null {
  const target = splitLedgerTarget(destination)
  const account = accounts.find((item) => item.id === target.accountId)
  if (account) {
    return account.name
  }
  const card = cards.find((item) => item.id === target.cardId)
  if (card) {
    return card.name
  }
  return null
}
