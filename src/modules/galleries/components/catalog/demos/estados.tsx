import { PlusIcon, SearchXIcon, WalletIcon } from "lucide-react"

import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import { IconBadge } from "@/src/shared/components/data-display/icon-badge"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
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
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { Spinner } from "@/src/shared/components/ui/spinner"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

export const estadosDemos: GalleryDemoMap = {
  "icon-badge": [
    {
      label: "Tonos, color de entidad y contenido propio",
      code: `
<div className="flex flex-wrap items-center gap-3">
  <IconBadge icon={WalletIcon} tone="primary" />
  <IconBadge icon={WalletIcon} tone="success" size={40} />
  <IconBadge icon={WalletIcon} tone="warning" size={32} />
  <IconBadge icon={WalletIcon} color="#0f766e" />
  <IconBadge size={40}>
    <span className="text-sm font-semibold" aria-hidden>
      AB
    </span>
  </IconBadge>
</div>
`,
      node: (
        <div className="flex flex-wrap items-center gap-3">
          <IconBadge icon={WalletIcon} tone="primary" />
          <IconBadge icon={WalletIcon} tone="success" size={40} />
          <IconBadge icon={WalletIcon} tone="warning" size={32} />
          <IconBadge icon={WalletIcon} color="#0f766e" />
          <IconBadge size={40}>
            <span className="text-sm font-semibold" aria-hidden>
              AB
            </span>
          </IconBadge>
        </div>
      ),
    },
  ],
  empty: [
    {
      label: "Con acción, sin resultados y compacta",
      code: `
<div className="flex w-full flex-col gap-3">
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
  <Empty className={cn(EMPTY_COMPACT_CLASS_NAME, "border")}>
    <EmptyHeader>
      <EmptyTitle>Ningún país coincide</EmptyTitle>
    </EmptyHeader>
  </Empty>
</div>
`,
      node: (
        <div className="flex w-full flex-col gap-3">
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
          <Empty className={`${EMPTY_COMPACT_CLASS_NAME} border`}>
            <EmptyHeader>
              <EmptyTitle>Ningún país coincide</EmptyTitle>
            </EmptyHeader>
          </Empty>
        </div>
      ),
    },
  ],
  skeleton: [
    {
      label: "Línea y bloque",
      code: `
<div className="flex w-full flex-col gap-2">
  <Skeleton className="h-4 w-32" />
  <Skeleton className="h-20 w-full rounded-2xl" />
</div>
`,
      node: (
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ),
    },
  ],
  "error-state": [
    {
      label: "Con Reintentar y reintentando",
      code: `
<div className="flex w-full flex-col gap-3">
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
</div>
`,
      node: (
        <div className="flex w-full flex-col gap-3">
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
        </div>
      ),
    },
  ],
  spinner: [
    {
      label: "Dentro de un botón",
      code: `
<Button disabled size="sm">
  <Spinner />
  Cargando
</Button>
`,
      node: (
        <Button disabled size="sm">
          <Spinner />
          Cargando
        </Button>
      ),
    },
  ],
}

export const estadosVariantDemos: GalleryVariantDemoMap = {
  "icon-badge": {
    tone: [
      {
        label: "primary",
        node: <IconBadge icon={WalletIcon} tone="primary" />,
      },
      {
        label: "success",
        node: <IconBadge icon={WalletIcon} tone="success" />,
      },
      {
        label: "warning",
        node: <IconBadge icon={WalletIcon} tone="warning" />,
      },
      { label: "info", node: <IconBadge icon={WalletIcon} tone="info" /> },
      {
        label: "destructive",
        node: <IconBadge icon={WalletIcon} tone="destructive" />,
      },
      { label: "muted", node: <IconBadge icon={WalletIcon} tone="muted" /> },
    ],
    color: [
      {
        label: "acento de una entidad o categoría",
        node: <IconBadge icon={WalletIcon} color="#0f766e" />,
      },
    ],
    size: [
      {
        label: "48",
        node: <IconBadge icon={WalletIcon} tone="primary" size={48} />,
      },
      {
        label: "32",
        node: <IconBadge icon={WalletIcon} tone="primary" size={32} />,
      },
    ],
  },
  empty: {
    "variant (EmptyMedia)": [
      {
        label: "default",
        node: (
          <Empty className="w-full max-w-sm border p-6">
            <EmptyHeader>
              <EmptyMedia>
                <WalletIcon />
              </EmptyMedia>
              <EmptyTitle>Sin cuentas todavía</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ),
      },
      {
        label: "icon",
        node: (
          <Empty className="w-full max-w-sm border p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WalletIcon />
              </EmptyMedia>
              <EmptyTitle>Sin cuentas todavía</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ),
      },
    ],
    size: [
      {
        label: "normal",
        node: (
          <Empty className="w-full max-w-sm border p-6">
            <EmptyHeader>
              <EmptyTitle>Sin resultados</EmptyTitle>
              <EmptyDescription>
                Prueba con otro nombre o con un monto menor.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ),
      },
      {
        label: "compacta con EMPTY_COMPACT_CLASS_NAME",
        node: (
          <Empty
            className={`${EMPTY_COMPACT_CLASS_NAME} w-full max-w-sm border`}
          >
            <EmptyHeader>
              <EmptyTitle>Ningún país coincide</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ),
      },
    ],
  },
  skeleton: {
    className: [
      {
        label: "línea",
        node: <Skeleton className="h-4 w-32" />,
      },
      {
        label: "bloque",
        node: <Skeleton className="h-20 w-full max-w-sm rounded-2xl" />,
      },
      {
        label: "círculo",
        node: <Skeleton className="size-10 rounded-full" />,
      },
    ],
  },
  "error-state": {
    states: [
      {
        label: "error",
        node: (
          <div className="w-full max-w-sm rounded-2xl border border-border">
            <ErrorState
              message="El servidor no respondió."
              onRetry={() => simulatedTap("Reintentar")}
            />
          </div>
        ),
      },
      {
        label: "reintentando",
        node: (
          <div className="w-full max-w-sm rounded-2xl border border-border">
            <ErrorState
              message="El servidor no respondió."
              onRetry={() => simulatedTap("Reintentar")}
              isRetrying
            />
          </div>
        ),
      },
    ],
  },
  spinner: {
    className: [
      {
        label: "en un botón",
        node: (
          <Button disabled size="sm">
            <Spinner />
            Cargando
          </Button>
        ),
      },
      {
        label: "tamaño y color del contexto",
        node: <Spinner className="size-6 text-primary" />,
      },
    ],
  },
}
