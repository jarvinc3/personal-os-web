"use client"

import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import {
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  PlusIcon,
} from "lucide-react"

type ProductEmptyProps = {
  tab: "accounts" | "cards" | "loans"
  onCreate: () => void
}

export function InstitutionProductEmpty({ tab, onCreate }: ProductEmptyProps) {
  if (tab === "loans") {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HandCoinsIcon />
          </EmptyMedia>
          <EmptyTitle>Sin préstamos</EmptyTitle>
          <EmptyDescription>
            Registra un préstamo para seguir sus cuotas.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onCreate}>
            <PlusIcon />
            Préstamo
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (tab === "cards") {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCardIcon />
          </EmptyMedia>
          <EmptyTitle>Sin tarjetas</EmptyTitle>
          <EmptyDescription>
            Agrega una tarjeta de crédito o débito de esta institución.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onCreate}>
            <PlusIcon />
            Tarjeta
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Empty className="py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LandmarkIcon />
        </EmptyMedia>
        <EmptyTitle>Sin cuentas</EmptyTitle>
        <EmptyDescription>
          Crea la primera cuenta de esta institución.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreate}>
          <PlusIcon />
          Cuenta
        </Button>
      </EmptyContent>
    </Empty>
  )
}
