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
  onCreate?: () => void
  description?: string
}

export function InstitutionProductEmpty({
  tab,
  onCreate,
  description,
}: ProductEmptyProps) {
  if (tab === "loans") {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HandCoinsIcon />
          </EmptyMedia>
          <EmptyTitle>Sin préstamos</EmptyTitle>
          <EmptyDescription>
            {description ?? "Registra un préstamo para seguir sus cuotas."}
          </EmptyDescription>
        </EmptyHeader>
        {onCreate ? (
          <EmptyContent>
            <Button onClick={onCreate}>
              <PlusIcon />
              Préstamo
            </Button>
          </EmptyContent>
        ) : null}
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
        {onCreate ? (
          <EmptyContent>
            <Button onClick={onCreate}>
              <PlusIcon />
              Tarjeta
            </Button>
          </EmptyContent>
        ) : null}
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
          {description ?? "Crea la primera cuenta de esta institución."}
        </EmptyDescription>
      </EmptyHeader>
      {onCreate ? (
        <EmptyContent>
          <Button onClick={onCreate}>
            <PlusIcon />
            Cuenta
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
