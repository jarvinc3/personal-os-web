import {
  BellIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import { NoticeCard } from "@/src/modules/finance/shared/components/notice-card"
import { Button } from "@/src/shared/components/ui/button"
import {
  ALERT_TONE_CLASS_NAME,
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { appToast } from "@/src/shared/lib/app-toast"

import type { GalleryDemoMap } from "@/src/modules/galleries/components/catalog/types"

export const avisosDemos: GalleryDemoMap = {
  alert: [
    {
      label: "default, warning, info, destructive y con acción",
      node: (
        <div className="flex w-full flex-col gap-3">
          <Alert>
            <InfoIcon />
            <AlertTitle>Dato informativo</AlertTitle>
            <AlertDescription>
              Los importes se muestran en la moneda de la cuenta.
            </AlertDescription>
          </Alert>
          <Alert className={ALERT_TONE_CLASS_NAME.warning}>
            <TriangleAlertIcon />
            <AlertTitle>Presupuesto cerca del límite</AlertTitle>
            <AlertDescription>
              Te queda el 12 % del monto del mes.
            </AlertDescription>
          </Alert>
          <Alert className={ALERT_TONE_CLASS_NAME.info}>
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
        </div>
      ),
    },
  ],
  "notice-card": [
    {
      label: "warning, danger e info",
      node: (
        <div className="flex w-full flex-col gap-2">
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
        </div>
      ),
    },
  ],
  "app-toast": [
    {
      label: "success, error, info y warning",
      node: (
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
      ),
    },
  ],
  sonner: [
    {
      label: "Toast montado desde el host global",
      node: (
        <Button
          size="sm"
          variant="outline"
          onClick={() => appToast.success({ text1: "Toast de Sonner" })}
        >
          <CircleCheckIcon />
          Mostrar toast
        </Button>
      ),
    },
  ],
}
