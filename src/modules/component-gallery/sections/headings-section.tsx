"use client"

import { GalleryDemo } from "@/src/modules/component-gallery/gallery-demo"
import { GALLERY_ACCENT } from "@/src/modules/component-gallery/mock/values"
import { simulatedTap } from "@/src/modules/component-gallery/simulated-tap"
import { SettingsSection } from "@/src/shared/components/layout/settings-section"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  SummaryGroup,
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/ui/summary"
import {
  ChevronRightIcon,
  LandmarkIcon,
  PlusIcon,
  TagsIcon,
  WalletIcon,
} from "lucide-react"

/** Bloques con título y agrupaciones dentro de una sección (#307). */
export function HeadingsSection() {
  return (
    <>
      <GalleryDemo
        name="SummarySection"
        from="@/src/shared/components/ui/summary"
        states="título con icono, subtítulo, acción a la derecha"
        note="El encabezado de un bloque en cualquier superficie: lista, formulario, sheet o panel."
      >
        <SummarySection
          title="Saldo por cuenta"
          subtitle="Actualizado hoy"
          icon={LandmarkIcon}
          color={GALLERY_ACCENT}
          right={
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Agregar cuenta"
              onClick={() => simulatedTap("Agregar cuenta")}
            >
              <PlusIcon />
            </Button>
          }
        >
          <div className="p-3 pt-0">
            <p className="text-sm text-muted-foreground tabular-nums">
              DOP $15,700.00 en dos cuentas.
            </p>
          </div>
        </SummarySection>
      </GalleryDemo>

      <GalleryDemo
        name="SummarySection collapsible"
        from="@/src/shared/components/ui/summary"
        states="abierto, cerrado, con badge en el encabezado"
        note="El bloque se pliega cuando el contenido es secundario, no cuando es la vista principal."
      >
        <SummarySection
          title="Categorías"
          subtitle="Seis activas"
          icon={TagsIcon}
          collapsible
          right={<Badge variant="secondary">6</Badge>}
        >
          <SummaryItem
            title="Mercado"
            value="DOP $1,250.00"
            icon={TagsIcon}
            isLast
          />
        </SummarySection>
      </GalleryDemo>

      <GalleryDemo
        name="SummaryGroup"
        from="@/src/shared/components/ui/summary"
        states="concepto con línea y descripción"
        note="Une varios controles bajo un mismo concepto dentro de una sección."
      >
        <SummaryGroup
          title="Saldo inicial"
          description="Antes de los movimientos de este mes"
        >
          <SummaryItem
            title="Cuenta de ahorros"
            value="DOP $8,000.00"
            icon={WalletIcon}
            isLast
          />
        </SummaryGroup>
      </GalleryDemo>

      <GalleryDemo
        name="SettingsSection"
        from="@/src/shared/components/layout/settings-section"
        states="etiqueta corta con acción en el encabezado"
        note="Para un grupo de ajustes. El título va en mayúsculas pequeñas, no como encabezado de página."
      >
        <SettingsSection
          title="Datos"
          description="Exporta o elimina tu información"
          headerTrailing={
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Ver todo"
              onClick={() => simulatedTap("Ver todo")}
            >
              <ChevronRightIcon />
            </Button>
          }
          bare
        >
          <div className="rounded-2xl border border-border bg-card p-3 text-sm text-muted-foreground">
            Aquí van las filas del grupo.
          </div>
        </SettingsSection>
      </GalleryDemo>
    </>
  )
}
