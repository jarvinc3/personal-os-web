import type { operations } from "./api-schema.ts"

/**
 * Comprobaciones que resuelve `pnpm typecheck`. No hay código en ejecución: si
 * el contrato cambia el tipo de un monto o un nombre del dominio, el archivo
 * deja de compilar y hay que ajustar el cliente.
 */

type Equal<Left, Right> =
  (<Type>() => Type extends Left ? 1 : 2) extends <Type>() => Type extends Right
    ? 1
    : 2
    ? true
    : false

type Expect<Condition extends true> = Condition

type BalanceSheetResponse =
  operations["BalanceSheetController_get"]["responses"][200]["content"]["application/json"]
type GlobalBalance = NonNullable<BalanceSheetResponse["global"]>
type CurrencySlice = NonNullable<GlobalBalance["byCurrency"]>[number]

/** Los montos del balance llegan como texto decimal, no como número. */
export type TotalAssetsIsDecimalText = Expect<
  Equal<NonNullable<GlobalBalance["totalAssets"]>, string>
>

export type CurrencyNetWorthIsDecimalText = Expect<
  Equal<NonNullable<CurrencySlice["netWorth"]>, string>
>

/** Un monto sin datos se publica como `null`, nunca como cero. */
export type NetWorthAllowsNoData = Expect<
  Equal<Exclude<GlobalBalance["netWorth"], undefined>, string | null>
>
