import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { CardProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { LoanProgressCard } from "@/src/modules/finance/loans/components/loan-progress-card"
import { ReceivableCard } from "@/src/modules/finance/receivables"
import { galleryMoney } from "@/src/modules/card-gallery/mock/display"
import {
  galleryCashAccount,
  galleryCheckingAccount,
  galleryCreditCard,
  galleryInstitution,
  galleryLoan,
  galleryNeutralAccount,
  galleryReceivable,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"
import { Badge } from "@/src/shared/components/ui/badge"
import { ScaleIcon, TriangleAlertIcon } from "lucide-react"
import type { ReactNode } from "react"

function WealthLine({
  label,
  status,
  tone,
  children,
}: {
  label: string
  status?: string
  tone?: "danger" | "warning"
  children: ReactNode
}) {
  const StatusIcon = tone === "danger" ? TriangleAlertIcon : ScaleIcon
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-2">
      <span className="px-1 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {status ? (
        <Badge
          variant={tone === "danger" ? "danger" : "warning"}
          className="ml-1 w-fit"
        >
          <StatusIcon aria-hidden />
          {status}
        </Badge>
      ) : null}
    </div>
  )
}

/** Patrimonio con cards; borrador hasta #285 (#272). */
export const wealthVariants: readonly GalleryVariant[] = [
  {
    id: "patrimonio-cuenta",
    label: "Cuenta con descuadre",
    propLabel: "AccountProductRow compact",
    height: "≈ 120 px",
    isDraft: true,
    render: ({ display, notifyTap }) => (
      <WealthLine label="Cuenta" status="Descuadre" tone="danger">
        <AccountProductRow
          account={galleryCheckingAccount}
          display={display}
          variant="compact"
          onPress={notifyTap}
        />
      </WealthLine>
    ),
  },
  {
    id: "patrimonio-efectivo",
    label: "Efectivo",
    propLabel: "AccountProductRow compact",
    height: "≈ 100 px",
    isDraft: true,
    render: ({ display, notifyTap }) => (
      <WealthLine label="Efectivo">
        <AccountProductRow
          account={galleryCashAccount}
          display={display}
          variant="compact"
          onPress={notifyTap}
        />
      </WealthLine>
    ),
  },
  {
    id: "patrimonio-tarjeta",
    label: "Tarjeta sin conciliar",
    propLabel: "CardProductRow compact",
    height: "≈ 150 px",
    isDraft: true,
    render: ({ display, notifyTap }) => (
      <WealthLine label="Tarjeta" status="Sin conciliar" tone="warning">
        <CardProductRow
          card={galleryCreditCard}
          accounts={[galleryCheckingAccount]}
          display={display}
          variant="compact"
          onPress={notifyTap}
        />
      </WealthLine>
    ),
  },
  {
    id: "patrimonio-prestamo",
    label: "Préstamo",
    propLabel: "LoanProgressCard compact",
    height: "≈ 110 px",
    isDraft: true,
    render: ({ display, notifyTap }) => (
      <WealthLine label="Préstamo">
        <LoanProgressCard
          loan={galleryLoan}
          display={display}
          institution={{
            name: galleryInstitution.name,
            color: galleryInstitution.color,
          }}
          variant="compact"
          onPress={notifyTap}
        />
      </WealthLine>
    ),
  },
  {
    id: "patrimonio-cobro",
    label: "Cobro",
    propLabel: "ReceivableCard compact",
    height: "≈ 110 px",
    render: ({ display, notifyTap }) => (
      <WealthLine label="Cobro">
        <ReceivableCard
          source={{ kind: "receivable", receivable: galleryReceivable }}
          display={display}
          variant="compact"
          onPress={notifyTap}
        />
      </WealthLine>
    ),
  },
  {
    id: "patrimonio-sin-conciliar-cuenta",
    label: "Cuenta sin conciliar",
    propLabel: "AccountProductRow compact",
    height: "≈ 120 px",
    isDraft: true,
    render: ({ display, notifyTap }) => (
      <WealthLine
        label="Cuenta"
        status={`Sin conciliar · ${galleryMoney("125000.00")}`}
        tone="warning"
      >
        <AccountProductRow
          account={galleryNeutralAccount}
          display={display}
          variant="compact"
          onPress={notifyTap}
        />
      </WealthLine>
    ),
  },
]
