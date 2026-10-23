"use client"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { InfoIcon } from "lucide-react"

/**
 * Notice for a balance response without `breakdown`: an API that predates the
 * per-currency breakdown still returns the rest of the view.
 */
export function MissingBreakdownNotice() {
  return (
    <Alert>
      <InfoIcon />
      <AlertTitle>Sin desglose por moneda</AlertTitle>
      <AlertDescription>
        El servidor no envió el desglose del patrimonio por moneda. El resto de
        la vista sigue disponible.
      </AlertDescription>
    </Alert>
  )
}
