"use client"

import { GalleryDemo } from "@/src/modules/galleries/components/gallery-demo"
import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import {
  CardSkeleton,
  ListSkeleton,
} from "@/src/shared/components/feedback/list-skeleton"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  EMPTY_COMPACT_CLASS_NAME,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { IconBadge } from "@/src/shared/components/data-display/icon-badge"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { PlusIcon, SearchXIcon, WalletIcon } from "lucide-react"

/** Vacío, carga y error de una sección (#307). */
export function StatesSection() {
  return (
    <>
      <GalleryDemo
        name="IconBadge"
        importPath="@/src/shared/components/data-display/icon-badge"
        states="tonos del sistema, color de entidad, emoji"
        note="El círculo con icono y tono. No se dibuja a mano en cada fila."
      >
        <div className="flex flex-wrap items-center gap-3">
          <IconBadge icon={WalletIcon} tone="primary" />
          <IconBadge icon={WalletIcon} tone="success" size={40} />
          <IconBadge icon={WalletIcon} tone="warning" size={32} />
          <IconBadge icon={WalletIcon} color="#0f766e" />
          <IconBadge size={40}>
            <span className="text-[20px] leading-none" aria-hidden>
              🍔
            </span>
          </IconBadge>
        </div>
      </GalleryDemo>

      <GalleryDemo
        name="Empty"
        importPath="@/src/shared/components/ui/empty"
        states="con icono, con acción, compacta para un picker"
        note="Cero ítems de una colección. No es un párrafo en muted ni un fallo de carga. En un picker va con size sm."
      >
        <Empty className="border p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <WalletIcon />
            </EmptyMedia>
            <EmptyTitle>Sin cuentas todavía</EmptyTitle>
            <EmptyDescription>
              Agrega una cuenta para ver su saldo y sus movimientos.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => simulatedTap("Agregar cuenta")}>
              <PlusIcon />
              Agregar cuenta
            </Button>
          </EmptyContent>
        </Empty>

        <Empty className="border p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>La búsqueda no encontró nada</EmptyTitle>
            <EmptyDescription>
              Prueba con otro nombre o con un monto menor.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </GalleryDemo>

      <GalleryDemo
        name="Skeleton + ListSkeleton + CardSkeleton"
        importPath="@/src/shared/components/feedback/list-skeleton"
        states="esqueleto de fila, lista de tres filas, card de 16/28/40"
        note="Mientras llega la primera tanda, el hueco tiene la forma de lo que va a llegar. La card sigue la altura de su variante."
      >
        <Skeleton className="h-4 w-32" />
        <div className="rounded-2xl border border-border">
          <ListSkeleton rows={3} />
        </div>
        <CardSkeleton height={16} />
        <CardSkeleton height={28} />
        <CardSkeleton height={40} />
      </GalleryDemo>

      <GalleryDemo
        name="Empty compacta"
        importPath="@/src/shared/components/ui/empty"
        states="picker sin resultados"
        note="En un picker, usa clases compactas para no desplazar los controles."
      >
        <Empty className={`${EMPTY_COMPACT_CLASS_NAME} border`}>
          <EmptyHeader>
            <EmptyTitle>Ningún país coincide</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </GalleryDemo>

      <GalleryDemo
        name="Spinner + LoadingView"
        importPath="@/src/shared/components/feedback/loading-view"
        states="spinner dentro de un botón, página sin forma"
        note="El Spinner suelto solo va dentro de un control o en LoadingView mientras la página no tiene forma."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled size="sm">
            <Spinner />
            Cargando
          </Button>
          <div className="rounded-2xl border border-border">
            <LoadingView variant="inline" />
          </div>
        </div>
      </GalleryDemo>

      <GalleryDemo
        name="ErrorState"
        importPath="@/src/modules/finance/shared/components/layout/error-state"
        states="con Reintentar, reintentando"
        note="El fallo de una sección es un estado reintentable en el mismo sitio, no un texto rojo sin salida."
      >
        <div className="rounded-2xl border border-border">
          <ErrorState
            message="El servidor no respondió."
            onRetry={() => simulatedTap("Reintentar")}
          />
        </div>
        <div className="rounded-2xl border border-border">
          <ErrorState
            message="El servidor no respondió."
            onRetry={() => simulatedTap("Reintentar")}
            isRetrying
          />
        </div>
      </GalleryDemo>
    </>
  )
}
