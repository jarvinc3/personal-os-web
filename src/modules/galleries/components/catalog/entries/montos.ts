import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const montosDocs: readonly GalleryComponentMeta[] = [
  {
    id: "format-finance-money",
    name: "formatFinanceMoney",
    category: "montos",
    kind: "domain",
    description:
      "Formatea un importe con la moneda, los centavos y la compactación del usuario.",
    whenToUse:
      "Cualquier importe de producto que se pinta en pantalla, dentro de un nodo tabular-nums.",
    whenNotToUse:
      "Para escribir o editar un monto: ahí va FinanceMoneyField. Tampoco con Intl.NumberFormat ni toLocaleString.",
    importPath: "@/src/modules/finance/shared/lib/money",
    snippet: `import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"

<span className="tabular-nums">
  {formatFinanceMoney(amount, display)}
</span>`,
    subcomponents: [],
    anatomy: [{ name: "formatFinanceMoney" }],
    variants: [
      {
        name: "display",
        values: "currency, showCents, compactNumbers, locale",
      },
    ],
    props: [
      {
        name: "amount",
        type: "string | number | null",
        description: "Monto del API, siempre en string cuando viene de la red.",
      },
      {
        name: "display",
        type: "FinanceMoneyDisplay",
        description: "Moneda, centavos, compactación y locale del usuario.",
      },
    ],
  },
  {
    id: "money",
    name: "Money",
    category: "montos",
    kind: "domain",
    description:
      "Pinta un importe con signo y color de tono, o neutro, sobre formatFinanceMoney.",
    whenToUse: "Un monto con signo dentro de una fila, una card o un detalle.",
    whenNotToUse:
      "Dentro de una frase que ya arma el importe con formatFinanceMoney.",
    importPath: "@/src/modules/finance/shared/components/money",
    snippet: `import { Money } from "@/src/modules/finance/shared/components/money"

<Money value={amount} display={display} showSign tone="auto" />`,
    subcomponents: [],
    anatomy: [{ name: "Money" }],
    variants: [
      { name: "tone", values: "auto, none" },
      { name: "showSign", values: "true, false" },
      { name: "sign", values: "overrides the sign of the amount" },
    ],
    props: [
      {
        name: "value",
        type: "string | number | null",
        description: "Monto a pintar.",
      },
      {
        name: "display",
        type: "FinanceMoneyDisplay",
        description: "Formato de moneda y centavos.",
      },
      {
        name: "tone",
        type: '"auto" | "none"',
        description: "Colorea según el signo o deja el color del texto.",
      },
      {
        name: "showSign",
        type: "boolean",
        description: "Añade + o − según el signo del monto.",
      },
    ],
  },
  {
    id: "finance-money-field",
    name: "FinanceMoneyField",
    category: "montos",
    kind: "domain",
    description:
      "Campo para escribir un importe, con teclado propio y calculadora en una hoja por ruta.",
    whenToUse:
      "Escribir un monto en un formulario de Finanzas o en un ajuste de límite.",
    whenNotToUse: "Para mostrar un monto: eso es Money o formatFinanceMoney.",
    importPath: "@/src/modules/finance/shared/components/forms/money-field",
    snippet: `import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"

<FinanceMoneyField
  calculatorKey="transaction-amount"
  amount={amount}
  onAmountChange={setAmount}
  onAmountCommit={setAmount}
  currency="DOP"
/>`,
    subcomponents: [],
    anatomy: [{ name: "FinanceMoneyField" }],
    variants: [
      { name: "entryMode", values: "keyboard, calculator" },
      { name: "states", values: "normal, invalid, disabled" },
    ],
    props: [
      {
        name: "calculatorKey",
        type: "string",
        description: "Clave única del monto en la URL de la calculadora.",
      },
      {
        name: "amount",
        type: "string",
        description: "Valor actual del campo.",
      },
      {
        name: "onAmountChange / onAmountCommit",
        type: "(value: string) => void",
        description:
          "Cambio mientras se escribe y confirmación de la calculadora.",
      },
      {
        name: "amountError",
        type: "string",
        description: "Error pegajoso bajo el campo.",
      },
    ],
  },
  {
    id: "finance-date-field",
    name: "FinanceDateField",
    category: "montos",
    kind: "domain",
    description:
      "Fila que abre la rueda de fecha estilo iOS y confirma con Listo. Con withTime, añade la hora.",
    whenToUse:
      "Elegir una fecha o una fecha y hora en cualquier formulario. Es la única entrada de fecha válida.",
    whenNotToUse:
      "Un input nativo de fecha o un Calendar. La rueda no se monta suelta: va dentro de este campo.",
    importPath: "@/src/modules/finance/shared/components/forms/date-field",
    snippet: `import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"

<FinanceDateField label="Fecha" value={date} onChange={setDate} />`,
    subcomponents: [],
    anatomy: [{ name: "FinanceDateField" }],
    variants: [
      { name: "withTime", values: "false (fecha), true (fecha y hora)" },
      { name: "states", values: "normal, invalid, disabled, optional" },
    ],
    props: [
      {
        name: "value",
        type: "string",
        description: "YYYY-MM-DD o YYYY-MM-DDTHH:mm cuando lleva hora.",
      },
      {
        name: "onChange",
        type: "(next: string) => void",
        description: "Escribe el valor elegido en la rueda.",
      },
      {
        name: "withTime",
        type: "boolean",
        description: "Añade la rueda de hora al panel.",
      },
      {
        name: "error",
        type: "string",
        description: "Error bajo la fila.",
      },
    ],
  },
  {
    id: "currency-flag",
    name: "CurrencyFlag",
    category: "montos",
    kind: "domain",
    description: "Bandera rasterizada de la región de una moneda ISO.",
    whenToUse:
      "Junto al código de una moneda en un selector o en una fila de resumen.",
    whenNotToUse:
      "Como única marca de una entidad financiera; para eso está BrandLogo.",
    importPath: "@/src/modules/finance/shared/components/currency-flag",
    snippet: `import { CurrencyFlag } from "@/src/modules/finance/shared/components/currency-flag"

<span className="flex items-center gap-1.5 text-sm">
  <CurrencyFlag code="DOP" />
  DOP
</span>`,
    subcomponents: [],
    anatomy: [{ name: "CurrencyFlag" }],
    variants: [
      { name: "code", values: "ISO 4217 de cualquier moneda con región" },
    ],
    props: [
      {
        name: "code",
        type: "string",
        description: "Código ISO de la moneda; sin región no pinta nada.",
      },
      {
        name: "className",
        type: "string",
        description: "Ajuste de tamaño o alineación.",
      },
    ],
  },
  {
    id: "brand-logo",
    name: "BrandLogo",
    category: "montos",
    kind: "domain",
    description:
      "Marca circular de una entidad: la imagen si existe y las iniciales si falta o falla.",
    whenToUse:
      "Cuenta, tarjeta, institución, comercio o movimiento identificado por su marca.",
    whenNotToUse:
      "Una categoría, que lleva su icono y su color. Tampoco iniciales pintadas a mano.",
    importPath: "@/src/modules/finance/shared/components/brand-logo",
    snippet: `import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"

<BrandLogo name={entity.name} logoUrl={entity.logoUrl} size={40} />`,
    subcomponents: [],
    anatomy: [{ name: "BrandLogo" }],
    variants: [
      { name: "size", values: "24, 36, 40, 48 (px)" },
      { name: "states", values: "con logo, sin logo, logo que falla" },
    ],
    props: [
      {
        name: "name",
        type: "string",
        description: "Nombre de la entidad; da las iniciales y el aria-label.",
      },
      {
        name: "logoUrl",
        type: "string | null",
        description:
          "Imagen de la marca; si falta o falla, se muestran las iniciales.",
      },
      {
        name: "size",
        type: "number",
        description: "Diámetro en px.",
      },
    ],
  },
]
