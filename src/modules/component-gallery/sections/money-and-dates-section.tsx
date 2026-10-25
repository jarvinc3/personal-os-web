"use client"

import { GalleryDemo } from "@/src/modules/component-gallery/gallery-demo"
import {
  GALLERY_AMOUNTS,
  GALLERY_COMPACT_DISPLAY,
  GALLERY_DATE,
  GALLERY_DATE_TIME,
  GALLERY_DISPLAY,
  GALLERY_NO_CENTS_DISPLAY,
} from "@/src/modules/component-gallery/mock/values"
import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { useState } from "react"

type FormattedAmount = {
  key: string
  label: string
  amount: string
  display: FinanceMoneyDisplay
}

const FORMATTED_AMOUNTS: FormattedAmount[] = [
  {
    key: "con-centavos",
    label: "Con centavos",
    amount: GALLERY_AMOUNTS.income,
    display: GALLERY_DISPLAY,
  },
  {
    key: "sin-centavos",
    label: "Sin centavos",
    amount: GALLERY_AMOUNTS.large,
    display: GALLERY_NO_CENTS_DISPLAY,
  },
  {
    key: "compacto",
    label: "Compacto",
    amount: GALLERY_AMOUNTS.large,
    display: GALLERY_COMPACT_DISPLAY,
  },
  {
    key: "negativo",
    label: "Negativo",
    amount: GALLERY_AMOUNTS.expense,
    display: GALLERY_DISPLAY,
  },
  {
    key: "cero",
    label: "Cero",
    amount: GALLERY_AMOUNTS.zero,
    display: GALLERY_DISPLAY,
  },
]

/** Importes formateados y campos de monto y fecha (#307). */
export function MoneyAndDatesSection() {
  const [amount, setAmount] = useState("1850.00")
  const [date, setDate] = useState(GALLERY_DATE)
  const [dateTime, setDateTime] = useState(GALLERY_DATE_TIME)

  return (
    <>
      <GalleryDemo
        name="formatFinanceMoney"
        importPath="@/src/modules/finance/shared/lib/money"
        states="con centavos, sin centavos, compacto, negativo, cero"
        note="El importe se pinta con tabular-nums y el formato del usuario. Nunca con toLocaleString ni el string crudo."
      >
        <dl className="flex flex-col gap-1 text-sm">
          {FORMATTED_AMOUNTS.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-3"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="tabular-nums">
                {formatFinanceMoney(row.amount, row.display)}
              </dd>
            </div>
          ))}
        </dl>
      </GalleryDemo>

      <GalleryDemo
        name="FinanceMoneyField"
        importPath="@/src/modules/finance/shared/components/forms/money-field"
        states="normal, con moneda, con error, deshabilitado"
        note="Escribir un monto es este campo, no un Input. El modo calculadora vive dentro del mismo control."
      >
        <FinanceMoneyField
          amount={amount}
          onAmountChange={setAmount}
          onAmountCommit={setAmount}
          currency="DOP"
        />
        <FinanceMoneyField
          amount="-1850.00"
          onAmountChange={() => {}}
          onAmountCommit={() => {}}
          amountError="El monto no puede ser negativo"
        />
        <FinanceMoneyField
          amount="0.00"
          onAmountChange={() => {}}
          onAmountCommit={() => {}}
          disabled
        />
      </GalleryDemo>

      <GalleryDemo
        name="FinanceDateField"
        importPath="@/src/modules/finance/shared/components/forms/date-field"
        states="fecha, fecha y hora, con error, deshabilitado"
        note="La rueda de fecha se monta con este campo. No existe un input nativo de fecha."
      >
        <FinanceDateField label="Fecha" value={date} onChange={setDate} />
        <FinanceDateField
          label="Fecha y hora"
          value={dateTime}
          onChange={setDateTime}
          withTime
        />
        <FinanceDateField
          label="Fecha de corte"
          value={GALLERY_DATE}
          onChange={() => {}}
          error="Elige una fecha posterior"
        />
        <FinanceDateField
          label="Fecha fija"
          value={GALLERY_DATE}
          onChange={() => {}}
          disabled
        />
      </GalleryDemo>
    </>
  )
}
