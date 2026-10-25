"use client"

import { GalleryDemo } from "@/src/modules/component-gallery/gallery-demo"
import { simulatedTap } from "@/src/modules/component-gallery/simulated-tap"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { PlusIcon, SearchXIcon, WalletIcon } from "lucide-react"

/** Vacío, carga y error de una sección (#307). */
export function StatesSection() {
  return (
    <>
      <GalleryDemo
        name="Empty"
        importPath="@/src/shared/components/ui/empty"
        states="con icono, con acción, búsqueda sin resultados"
        note="Cero ítems de una colección. No es un párrafo en muted ni un fallo de carga."
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
        name="Skeleton + FinanceListSkeleton"
        importPath="@/src/shared/components/ui/skeleton"
        states="esqueleto de fila, lista de tres filas"
        note="Mientras llega la primera tanda, el hueco tiene la forma de lo que va a llegar."
      >
        <Skeleton className="h-4 w-32" />
        <div className="rounded-2xl border border-border">
          <FinanceListSkeleton rows={3} />
        </div>
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
        name="FinanceErrorState"
        importPath="@/src/modules/finance/shared/components/layout/error-state"
        states="con Reintentar, reintentando"
        note="El fallo de una sección es un estado reintentable en el mismo sitio, no un texto rojo sin salida."
      >
        <div className="rounded-2xl border border-border">
          <FinanceErrorState
            message="El servidor no respondió."
            onRetry={() => simulatedTap("Reintentar")}
          />
        </div>
        <div className="rounded-2xl border border-border">
          <FinanceErrorState
            message="El servidor no respondió."
            onRetry={() => simulatedTap("Reintentar")}
            isRetrying
          />
        </div>
      </GalleryDemo>
    </>
  )
}
