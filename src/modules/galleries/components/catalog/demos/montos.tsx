import { useState } from "react"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { CurrencyFlag } from "@/src/modules/finance/shared/components/currency-flag"
import { Money } from "@/src/modules/finance/shared/components/money"
import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  GALLERY_AMOUNTS,
  GALLERY_COMPACT_DISPLAY,
  GALLERY_DATE,
  GALLERY_DATE_TIME,
  GALLERY_DISPLAY,
  GALLERY_NO_CENTS_DISPLAY,
} from "@/src/modules/galleries/components/mock/values"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

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

function MoneyFieldDemo() {
  const [amount, setAmount] = useState("1850.00")

  return (
    <div className="flex w-full flex-col gap-3">
      <FinanceMoneyField
        calculatorKey="gallery-amount"
        amount={amount}
        onAmountChange={setAmount}
        onAmountCommit={setAmount}
        currency="DOP"
      />
      <FinanceMoneyField
        calculatorKey="gallery-negative"
        amount="-1850.00"
        onAmountChange={() => {}}
        onAmountCommit={() => {}}
        amountError="El monto no puede ser negativo"
      />
      <FinanceMoneyField
        calculatorKey="gallery-zero"
        amount="0.00"
        onAmountChange={() => {}}
        onAmountCommit={() => {}}
        disabled
      />
    </div>
  )
}

function DateFieldDemo() {
  const [date, setDate] = useState(GALLERY_DATE)
  const [dateTime, setDateTime] = useState(GALLERY_DATE_TIME)

  return (
    <div className="flex w-full flex-col gap-3">
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
    </div>
  )
}

export const montosDemos: GalleryDemoMap = {
  "format-finance-money": [
    {
      label: "Con centavos, sin centavos, compacto, negativo y cero",
      code: `
<dl className="flex w-full flex-col gap-1 text-sm">
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
`,
      node: (
        <dl className="flex w-full flex-col gap-1 text-sm">
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
      ),
    },
  ],
  money: [
    {
      label: "Ingreso, gasto, cero y sin tono",
      code: `
<dl className="flex w-full flex-col gap-1 text-sm">
  <div className="flex items-center justify-between gap-3">
    <dt className="text-muted-foreground">Ingreso</dt>
    <dd>
      <Money
        value={"12500.00"}
        display={{ currency: "DOP", showCents: true, compactNumbers: false, locale: "es-DO" }}
        showSign
        tone="auto"
      />
    </dd>
  </div>
  <div className="flex items-center justify-between gap-3">
    <dt className="text-muted-foreground">Gasto</dt>
    <dd>
      <Money
        value={"-1850.00"}
        display={{ currency: "DOP", showCents: true, compactNumbers: false, locale: "es-DO" }}
        showSign
        tone="auto"
      />
    </dd>
  </div>
  <div className="flex items-center justify-between gap-3">
    <dt className="text-muted-foreground">Cero</dt>
    <dd>
      <Money
        value={"0.00"}
        display={{ currency: "DOP", showCents: true, compactNumbers: false, locale: "es-DO" }}
        showSign
        tone="auto"
      />
    </dd>
  </div>
  <div className="flex items-center justify-between gap-3">
    <dt className="text-muted-foreground">Sin tono</dt>
    <dd>
      <Money value={"1250000.00"} display={{ currency: "DOP", showCents: true, compactNumbers: false, locale: "es-DO" }} />
    </dd>
  </div>
</dl>
`,
      node: (
        <dl className="flex w-full flex-col gap-1 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Ingreso</dt>
            <dd>
              <Money
                value={GALLERY_AMOUNTS.income}
                display={GALLERY_DISPLAY}
                showSign
                tone="auto"
              />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Gasto</dt>
            <dd>
              <Money
                value={GALLERY_AMOUNTS.expense}
                display={GALLERY_DISPLAY}
                showSign
                tone="auto"
              />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Cero</dt>
            <dd>
              <Money
                value={GALLERY_AMOUNTS.zero}
                display={GALLERY_DISPLAY}
                showSign
                tone="auto"
              />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Sin tono</dt>
            <dd>
              <Money value={GALLERY_AMOUNTS.large} display={GALLERY_DISPLAY} />
            </dd>
          </div>
        </dl>
      ),
    },
  ],
  "finance-money-field": [
    {
      label: "Normal, con error y deshabilitado",
      code: `
const [amount, setAmount] = useState("1850.00")

<div className="flex w-full flex-col gap-3">
  <FinanceMoneyField
    calculatorKey="gallery-amount"
    amount={amount}
    onAmountChange={setAmount}
    onAmountCommit={setAmount}
    currency="DOP"
  />
  <FinanceMoneyField
    calculatorKey="gallery-negative"
    amount="-1850.00"
    onAmountChange={() => {}}
    onAmountCommit={() => {}}
    amountError="El monto no puede ser negativo"
  />
  <FinanceMoneyField
    calculatorKey="gallery-zero"
    amount="0.00"
    onAmountChange={() => {}}
    onAmountCommit={() => {}}
    disabled
  />
</div>
`,
      node: <MoneyFieldDemo />,
    },
  ],
  "finance-date-field": [
    {
      label: "Fecha, fecha y hora, error y deshabilitado",
      code: `
const [date, setDate] = useState("2026-10-23")
const [dateTime, setDateTime] = useState("2026-10-23T09:30")

<div className="flex w-full flex-col gap-3">
  <FinanceDateField label="Fecha" value={date} onChange={setDate} />
  <FinanceDateField
    label="Fecha y hora"
    value={dateTime}
    onChange={setDateTime}
    withTime
  />
  <FinanceDateField
    label="Fecha de corte"
    value="2026-10-23"
    onChange={() => {}}
    error="Elige una fecha posterior"
  />
  <FinanceDateField
    label="Fecha fija"
    value="2026-10-23"
    onChange={() => {}}
    disabled
  />
</div>
`,
      node: <DateFieldDemo />,
    },
  ],
  "currency-flag": [
    {
      label: "DOP, USD, EUR y MXN",
      code: `
<div className="flex flex-wrap items-center gap-3">
  {["DOP", "USD", "EUR", "MXN"].map((code) => (
    <span key={code} className="flex items-center gap-1.5 text-sm">
      <CurrencyFlag code={code} />
      {code}
    </span>
  ))}
</div>
`,
      node: (
        <div className="flex flex-wrap items-center gap-3">
          {["DOP", "USD", "EUR", "MXN"].map((code) => (
            <span key={code} className="flex items-center gap-1.5 text-sm">
              <CurrencyFlag code={code} />
              {code}
            </span>
          ))}
        </div>
      ),
    },
  ],
  "brand-logo": [
    {
      label: "Con imagen, sin imagen y tamaños",
      code: `
<div className="flex flex-wrap items-center gap-3">
  <BrandLogo name="Banco Ejemplo" size={40} />
  <BrandLogo name="Institución Ejemplo" size={48} />
  <BrandLogo name="Suscripción Ejemplo" size={24} />
  <BrandLogo name="Comercio" size={36} />
</div>
`,
      node: (
        <div className="flex flex-wrap items-center gap-3">
          <BrandLogo name="Banco Ejemplo" size={40} />
          <BrandLogo name="Institución Ejemplo" size={48} />
          <BrandLogo name="Suscripción Ejemplo" size={24} />
          <BrandLogo name="Comercio" size={36} />
        </div>
      ),
    },
  ],
}

const OTHER_CURRENCY_DISPLAY: FinanceMoneyDisplay = {
  ...GALLERY_DISPLAY,
  currency: "USD",
}

const ENGLISH_DISPLAY: FinanceMoneyDisplay = {
  ...GALLERY_DISPLAY,
  locale: "en-US",
}

export const montosVariantDemos: GalleryVariantDemoMap = {
  "format-finance-money": {
    display: [
      {
        label: "currency",
        node: (
          <span className="tabular-nums">
            {formatFinanceMoney(GALLERY_AMOUNTS.income, OTHER_CURRENCY_DISPLAY)}
          </span>
        ),
      },
      {
        label: "showCents",
        node: (
          <span className="tabular-nums">
            {formatFinanceMoney(
              GALLERY_AMOUNTS.large,
              GALLERY_NO_CENTS_DISPLAY
            )}
          </span>
        ),
      },
      {
        label: "compactNumbers",
        node: (
          <span className="tabular-nums">
            {formatFinanceMoney(GALLERY_AMOUNTS.large, GALLERY_COMPACT_DISPLAY)}
          </span>
        ),
      },
      {
        label: "locale",
        node: (
          <span className="tabular-nums">
            {formatFinanceMoney(GALLERY_AMOUNTS.income, ENGLISH_DISPLAY)}
          </span>
        ),
      },
    ],
  },
  money: {
    tone: [
      {
        label: "auto",
        node: (
          <Money
            value={GALLERY_AMOUNTS.expense}
            display={GALLERY_DISPLAY}
            tone="auto"
          />
        ),
      },
      {
        label: "none",
        node: (
          <Money
            value={GALLERY_AMOUNTS.expense}
            display={GALLERY_DISPLAY}
            tone="none"
          />
        ),
      },
    ],
    showSign: [
      {
        label: "true",
        node: (
          <Money
            value={GALLERY_AMOUNTS.expense}
            display={GALLERY_DISPLAY}
            showSign
          />
        ),
      },
      {
        label: "false",
        node: (
          <Money value={GALLERY_AMOUNTS.expense} display={GALLERY_DISPLAY} />
        ),
      },
    ],
    sign: [
      {
        label: "overrides the sign of the amount",
        node: (
          <Money
            value={GALLERY_AMOUNTS.income}
            display={GALLERY_DISPLAY}
            sign="−"
            showSign
            tone="auto"
          />
        ),
      },
    ],
  },
  "finance-money-field": {
    entryMode: [
      {
        label: "keyboard",
        node: (
          <FinanceMoneyField
            calculatorKey="variant-keyboard"
            amount={GALLERY_AMOUNTS.expense}
            onAmountChange={() => {}}
            onAmountCommit={() => {}}
            entryMode="keyboard"
          />
        ),
      },
      {
        label: "calculator",
        node: (
          <FinanceMoneyField
            calculatorKey="variant-calculator"
            amount={GALLERY_AMOUNTS.expense}
            onAmountChange={() => {}}
            onAmountCommit={() => {}}
            entryMode="calculator"
          />
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <FinanceMoneyField
            calculatorKey="variant-normal"
            amount="1850.00"
            onAmountChange={() => {}}
            onAmountCommit={() => {}}
            currency="DOP"
          />
        ),
      },
      {
        label: "invalid",
        node: (
          <FinanceMoneyField
            calculatorKey="variant-invalid"
            amount="-1850.00"
            onAmountChange={() => {}}
            onAmountCommit={() => {}}
            amountError="El monto no puede ser negativo"
          />
        ),
      },
      {
        label: "disabled",
        node: (
          <FinanceMoneyField
            calculatorKey="variant-disabled"
            amount="0.00"
            onAmountChange={() => {}}
            onAmountCommit={() => {}}
            disabled
          />
        ),
      },
    ],
  },
  "finance-date-field": {
    withTime: [
      {
        label: "false (fecha)",
        node: (
          <FinanceDateField
            label="Fecha"
            value={GALLERY_DATE}
            onChange={() => {}}
          />
        ),
      },
      {
        label: "true (fecha y hora)",
        node: (
          <FinanceDateField
            label="Fecha y hora"
            value={GALLERY_DATE_TIME}
            onChange={() => {}}
            withTime
          />
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <FinanceDateField
            label="Fecha"
            value={GALLERY_DATE}
            onChange={() => {}}
          />
        ),
      },
      {
        label: "invalid",
        node: (
          <FinanceDateField
            label="Fecha de corte"
            value={GALLERY_DATE}
            onChange={() => {}}
            error="Elige una fecha posterior"
          />
        ),
      },
      {
        label: "disabled",
        node: (
          <FinanceDateField
            label="Fecha fija"
            value={GALLERY_DATE}
            onChange={() => {}}
            disabled
          />
        ),
      },
      {
        label: "optional",
        node: (
          <FinanceDateField
            label="Fecha límite"
            value=""
            onChange={() => {}}
            optional
          />
        ),
      },
    ],
  },
  "currency-flag": {
    code: [
      {
        label: "DOP",
        node: (
          <span className="flex items-center gap-1.5 text-sm">
            <CurrencyFlag code="DOP" />
            DOP
          </span>
        ),
      },
      {
        label: "USD",
        node: (
          <span className="flex items-center gap-1.5 text-sm">
            <CurrencyFlag code="USD" />
            USD
          </span>
        ),
      },
      {
        label: "EUR",
        node: (
          <span className="flex items-center gap-1.5 text-sm">
            <CurrencyFlag code="EUR" />
            EUR
          </span>
        ),
      },
    ],
  },
  "brand-logo": {
    size: [
      { label: "24", node: <BrandLogo name="Suscripción Ejemplo" size={24} /> },
      { label: "36", node: <BrandLogo name="Comercio" size={36} /> },
      { label: "40", node: <BrandLogo name="Banco Ejemplo" size={40} /> },
      { label: "48", node: <BrandLogo name="Institución Ejemplo" size={48} /> },
    ],
    states: [
      {
        label: "con logo",
        node: (
          <BrandLogo name="Personal OS" logoUrl="/assets/icon.png" size={40} />
        ),
      },
      {
        label: "sin logo",
        node: <BrandLogo name="Banco Ejemplo" size={40} />,
      },
      {
        label: "logo que falla",
        node: (
          <BrandLogo
            name="Comercio Ejemplo"
            logoUrl="/assets/logo-que-falla.png"
            size={40}
          />
        ),
      },
    ],
  },
}
