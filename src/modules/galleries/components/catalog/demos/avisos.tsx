import {
  BellIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import { Button } from "@/src/shared/components/ui/button"
import {
  ALERT_SOFT_TONE_CLASS_NAME,
  ALERT_TONE_CLASS_NAME,
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { appToast } from "@/src/shared/lib/app-toast"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

export const avisosDemos: GalleryDemoMap = {
  alert: [
    {
      label: "default, warning, info, destructive y con acción",
      code: `
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
`,
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
  "app-toast": [
    {
      label: "success, error, info y warning",
      code: `
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
`,
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
      code: `
<Button
  size="sm"
  variant="outline"
  onClick={() => appToast.success({ text1: "Toast de Sonner" })}
>
  <CircleCheckIcon />
  Mostrar toast
</Button>
`,
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

export const avisosVariantDemos: GalleryVariantDemoMap = {
  alert: {
    variant: [
      {
        label: "default",
        node: (
          <Alert>
            <InfoIcon />
            <AlertTitle>Dato informativo</AlertTitle>
            <AlertDescription>
              Los importes se muestran en la moneda de la cuenta.
            </AlertDescription>
          </Alert>
        ),
      },
      {
        label: "destructive",
        node: (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>No se pudo guardar</AlertTitle>
            <AlertDescription>
              Revisa la conexión y vuelve a intentarlo.
            </AlertDescription>
          </Alert>
        ),
      },
    ],
    tono: [
      {
        label: "warning",
        node: (
          <Alert className={ALERT_TONE_CLASS_NAME.warning}>
            <TriangleAlertIcon />
            <AlertTitle>Presupuesto cerca del límite</AlertTitle>
            <AlertDescription>Te queda el 12 % del monto.</AlertDescription>
          </Alert>
        ),
      },
      {
        label: "info",
        node: (
          <Alert className={ALERT_TONE_CLASS_NAME.info}>
            <InfoIcon />
            <AlertTitle>Importación en curso</AlertTitle>
            <AlertDescription>
              Los movimientos aparecen al terminar.
            </AlertDescription>
          </Alert>
        ),
      },
    ],
    lavado: [
      {
        label: "warning",
        node: (
          <Alert className={ALERT_SOFT_TONE_CLASS_NAME.warning}>
            <TriangleAlertIcon />
            <AlertTitle>Descuadre de saldo</AlertTitle>
            <AlertDescription>
              El saldo del banco no coincide con el de la app.
            </AlertDescription>
          </Alert>
        ),
      },
      {
        label: "destructive",
        node: (
          <Alert className={ALERT_SOFT_TONE_CLASS_NAME.destructive}>
            <CircleAlertIcon />
            <AlertTitle>Cargo rechazado</AlertTitle>
            <AlertDescription>
              La tarjeta rechazó el último cobro de la suscripción.
            </AlertDescription>
          </Alert>
        ),
      },
    ],
  },
  "app-toast": {
    tipo: [
      {
        label: "success",
        node: (
          <Button
            size="sm"
            onClick={() => appToast.success({ text1: "Movimiento guardado" })}
          >
            <CircleCheckIcon />
            Éxito
          </Button>
        ),
      },
      {
        label: "error",
        node: (
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
        ),
      },
      {
        label: "info",
        node: (
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
        ),
      },
      {
        label: "warning",
        node: (
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
        ),
      },
    ],
    undo: [
      {
        label: "showUndoToast para una acción reversible",
        node: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => showUndoToast("Cuenta archivada", () => {})}
          >
            <CircleCheckIcon />
            Archivar cuenta
          </Button>
        ),
      },
    ],
  },
  sonner: {
    position: [
      {
        label: "top-center (configurado en el host)",
        node: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => appToast.info({ text1: "Toast del host" })}
          >
            <BellIcon />
            Mostrar toast
          </Button>
        ),
      },
    ],
  },
}
