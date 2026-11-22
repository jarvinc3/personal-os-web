import { ChevronDownIcon, FileTextIcon, PlusIcon, TagsIcon } from "lucide-react"

import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import { GALLERY_ACCENT } from "@/src/modules/galleries/components/mock/values"
import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { DetailHeader } from "@/src/modules/finance/shared/components/layout/progress-hero"
import {
  SummaryGroup,
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { SettingsSection } from "@/src/shared/components/settings/settings-section"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"

import type { GalleryDemoMap } from "@/src/modules/galleries/components/catalog/types"

export const encabezadosDemos: GalleryDemoMap = {
  "summary-section": [
    {
      label: "Con subtítulo, acción y collapsible",
      code: `
<div className="flex w-full flex-col gap-3">
  <SummarySection
    title="Resumen del mes"
    subtitle="Actualizado hoy"
    icon={FileTextIcon}
    color={"#0f766e"}
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
      <p className="text-sm text-muted-foreground">
        12 movimientos este mes.
      </p>
    </div>
  </SummarySection>
  <SummarySection
    title="Etiquetas"
    subtitle="Seis activas"
    icon={TagsIcon}
    collapsible
    right={<Badge variant="secondary">6</Badge>}
  >
    <SummaryItem title="Fijas" value="3" icon={TagsIcon} isLast />
  </SummarySection>
</div>
`,
      node: (
        <div className="flex w-full flex-col gap-3">
          <SummarySection
            title="Resumen del mes"
            subtitle="Actualizado hoy"
            icon={FileTextIcon}
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
              <p className="text-sm text-muted-foreground">
                12 movimientos este mes.
              </p>
            </div>
          </SummarySection>
          <SummarySection
            title="Etiquetas"
            subtitle="Seis activas"
            icon={TagsIcon}
            collapsible
            right={<Badge variant="secondary">6</Badge>}
          >
            <SummaryItem title="Fijas" value="3" icon={TagsIcon} isLast />
          </SummarySection>
        </div>
      ),
    },
  ],
  "summary-group": [
    {
      label: "Concepto con línea y descripción",
      code: `
<SummaryGroup
  title="Saldo inicial"
  description="Antes de los movimientos de este mes"
>
  <SummaryItem
    title="Movimientos del mes"
    value="DOP $8,000.00"
    icon={TagsIcon}
    isLast
  />
</SummaryGroup>
`,
      node: (
        <SummaryGroup
          title="Saldo inicial"
          description="Antes de los movimientos de este mes"
        >
          <SummaryItem
            title="Movimientos del mes"
            value="DOP $8,000.00"
            icon={TagsIcon}
            isLast
          />
        </SummaryGroup>
      ),
    },
  ],
  "settings-section": [
    {
      label: "Con etiqueta, descripción y acción",
      code: `
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
      <PlusIcon />
    </Button>
  }
>
  <SummaryItem
    title="Exportar mis datos"
    value="JSON"
    icon={FileTextIcon}
    isLast
  />
</SettingsSection>
`,
      node: (
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
              <PlusIcon />
            </Button>
          }
        >
          <SummaryItem
            title="Exportar mis datos"
            value="JSON"
            icon={FileTextIcon}
            isLast
          />
        </SettingsSection>
      ),
    },
  ],
  "detail-header": [
    {
      label: "Con insignia y sin insignia",
      code: `
<div
  className="flex w-full flex-col gap-4 rounded-2xl p-4 text-white"
  style={{ backgroundColor: "#0f766e" }}
>
  <DetailHeader
    media={<BrandLogo name="Cuenta Ejemplo" size={48} />}
    title="Ahorro programado"
    badge={{ label: "Activa" }}
    subtitle="Ahorro · DOP"
  />
  <DetailHeader
    media={<BrandLogo name="Institución Ejemplo" size={48} />}
    title="Banco Ejemplo"
    subtitle="Cuenta principal"
  />
</div>
`,
      node: (
        <div
          className="flex w-full flex-col gap-4 rounded-2xl p-4 text-white"
          style={{ backgroundColor: GALLERY_ACCENT }}
        >
          <DetailHeader
            media={<BrandLogo name="Cuenta Ejemplo" size={48} />}
            title="Ahorro programado"
            badge={{ label: "Activa" }}
            subtitle="Ahorro · DOP"
          />
          <DetailHeader
            media={<BrandLogo name="Institución Ejemplo" size={48} />}
            title="Banco Ejemplo"
            subtitle="Cuenta principal"
          />
        </div>
      ),
    },
  ],
  collapsible: [
    {
      label: "Cerrado y abierto",
      code: `
<Collapsible className="w-full">
  <CollapsibleTrigger
    render={
      <Button variant="outline" className="w-full justify-between" />
    }
  >
    Detalle del cálculo
    <ChevronDownIcon />
  </CollapsibleTrigger>
  <CollapsibleContent className="pt-2">
    <p className="text-sm text-muted-foreground">
      El saldo inicial más los ingresos menos los gastos del mes.
    </p>
  </CollapsibleContent>
</Collapsible>
`,
      node: (
        <Collapsible className="w-full">
          <CollapsibleTrigger
            render={
              <Button variant="outline" className="w-full justify-between" />
            }
          >
            Detalle del cálculo
            <ChevronDownIcon />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <p className="text-sm text-muted-foreground">
              El saldo inicial más los ingresos menos los gastos del mes.
            </p>
          </CollapsibleContent>
        </Collapsible>
      ),
    },
  ],
}
