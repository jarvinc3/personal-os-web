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
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { useState } from "react"

/** Importes formateados y campos de monto y fecha (#307). */
export function MoneyAndDatesSection() {
  const [amount, setAmount] = useState("1850.00")
  const [date, setDate] = useState(GALLERY_DATE)
  const [dateTime, setDateTime] = useState(GALLERY_DATE_TIME)

  return (
    <>
      <GalleryDemo
        name="formatFinanceMoney"
        from="@/src/modules/finance/shared/lib/money"
        states="con centavos, sin centavos, compacto, negativo, cero"
        note="El importe se pinta con tabular-nums y el formato del usuario. Nunca con toLocaleString ni el string crudo."
      >
        <dl className="flex flex-col gap-1 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Con centavos</dt>
            <dd className="tabular-nums">
              {formatFinanceMoney(GALLERY_AMOUNTS.income, GALLERY_DISPLAY)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Sin centavos</dt>
            <dd className="tabular-nums">
              {formatFinanceMoney(
                GALLERY_AMOUNTS.large,
                GALLERY_NO_CENTS_DISPLAY
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Compacto</dt>
            <dd className="tabular-nums">
              {formatFinanceMoney(
                GALLERY_AMOUNTS.large,
                GALLERY_COMPACT_DISPLAY
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Negativo</dt>
            <dd className="tabular-nums">
              {formatFinanceMoney(GALLERY_AMOUNTS.expense, GALLERY_DISPLAY)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Cero</dt>
            <dd className="tabular-nums">
              {formatFinanceMoney(GALLERY_AMOUNTS.zero, GALLERY_DISPLAY)}
            </dd>
          </div>
        </dl>
      </GalleryDemo>

      <GalleryDemo
        name="FinanceMoneyField"
        from="@/src/modules/finance/shared/components/forms/money-field"
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
        from="@/src/modules/finance/shared/components/forms/date-field"
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
