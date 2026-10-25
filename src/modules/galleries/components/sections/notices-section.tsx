"use client"

import { GalleryDemo } from "@/src/modules/galleries/components/gallery-demo"
import { NoticeCard } from "@/src/modules/finance/shared/components/notice-card"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  BellIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

/** Alertas en línea, avisos con tono y toasts (#307). */
export function NoticesSection() {
  return (
    <>
      <GalleryDemo
        name="Alert"
        importPath="@/src/shared/components/ui/alert"
        states="default, warning, info, destructive, con acción"
        note="Un aviso puntual dentro de un flujo. El error de una sección es FinanceErrorState, no un Alert."
      >
        <Alert>
          <InfoIcon />
          <AlertTitle>Dato informativo</AlertTitle>
          <AlertDescription>
            Los importes se muestran en la moneda de la cuenta.
          </AlertDescription>
        </Alert>
        <Alert variant="warning">
          <TriangleAlertIcon />
          <AlertTitle>Presupuesto cerca del límite</AlertTitle>
          <AlertDescription>
            Te queda el 12 % del monto del mes.
          </AlertDescription>
        </Alert>
        <Alert variant="info">
          <InfoIcon />
          <AlertTitle>Importación en curso</AlertTitle>
          <AlertDescription>
            Los movimientos aparecen al terminar la revisión.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No se pudo guardar</AlertTitle>
          <AlertDescription>
            Revisa la conexión y vuelve a intentarlo.
          </AlertDescription>
          <AlertAction>
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Descartar aviso"
              onClick={() => appToast.info({ text1: "Aviso descartado" })}
            >
              <XIcon />
            </Button>
          </AlertAction>
        </Alert>
      </GalleryDemo>

      <GalleryDemo
        name="NoticeCard"
        importPath="@/src/modules/finance/shared/components/notice-card"
        states="warning, danger, info, con acción a la derecha"
        note="El aviso que acompaña a la card de una entidad, con su tono y un botón de salida."
      >
        <NoticeCard
          icon={TriangleAlertIcon}
          title="Descuadre de saldo"
          description="El saldo del banco no coincide con el de la app."
          tone="warning"
          trailing={
            <Button
              size="icon-xs"
              variant="outline"
              aria-label="Revisar descuadre"
              onClick={() => appToast.info({ text1: "Revisar descuadre" })}
            >
              <BellIcon />
            </Button>
          }
        />
        <NoticeCard
          icon={CircleAlertIcon}
          title="Cargo rechazado"
          description="La tarjeta rechazó el último cobro de la suscripción."
          tone="danger"
        />
        <NoticeCard
          icon={InfoIcon}
          title="Pago procesado"
          description="El movimiento ya aparece en tu cuenta."
          tone="info"
        />
      </GalleryDemo>

      <GalleryDemo
        name="appToast"
        importPath="@/src/shared/lib/app-toast"
        states="success, error, info, warning"
        note="El toast de una mutación. No es un estado de sección; no mueve el foco y se anuncia solo."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => appToast.success({ text1: "Movimiento guardado" })}
          >
            <CircleCheckIcon />
            Éxito
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() =>
              appToast.error({
                text1: "No se pudo guardar",
                text2: "Revisa la conexión.",
              })
            }
          >
            <CircleAlertIcon />
            Error
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              appToast.info({
                text1: "Sincronización en curso",
                text2: "Te avisamos al terminar.",
              })
            }
          >
            <InfoIcon />
            Info
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              appToast.warning({ text1: "Queda poco saldo en la cuenta" })
            }
          >
            <TriangleAlertIcon />
            Aviso
          </Button>
        </div>
      </GalleryDemo>
    </>
  )
}
