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
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

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
      label: "Concepto entre líneas y descripción",
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

function CollapsibleSample({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="w-full max-w-sm">
      <CollapsibleTrigger
        render={<Button variant="outline" className="w-full justify-between" />}
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
  )
}

export const encabezadosVariantDemos: GalleryVariantDemoMap = {
  "summary-section": {
    collapsible: [
      {
        label: "false",
        node: (
          <div className="w-full max-w-sm">
            <SummarySection
              title="Resumen del mes"
              subtitle="Actualizado hoy"
              icon={FileTextIcon}
            >
              <div className="p-3 pt-0">
                <p className="text-sm text-muted-foreground">
                  12 movimientos este mes.
                </p>
              </div>
            </SummarySection>
          </div>
        ),
      },
      {
        label: "true con defaultOpen",
        node: (
          <div className="w-full max-w-sm">
            <SummarySection
              title="Etiquetas"
              subtitle="Seis activas"
              icon={TagsIcon}
              collapsible
              defaultOpen
              right={<Badge variant="secondary">6</Badge>}
            >
              <SummaryItem title="Fijas" value="3" icon={TagsIcon} isLast />
            </SummarySection>
          </div>
        ),
      },
    ],
    color: [
      {
        label: "acento del módulo en icono y fondo",
        node: (
          <div className="w-full max-w-sm">
            <SummarySection
              title="Resumen del mes"
              icon={FileTextIcon}
              color={GALLERY_ACCENT}
            >
              <div className="p-3 pt-0">
                <p className="text-sm text-muted-foreground">
                  12 movimientos este mes.
                </p>
              </div>
            </SummarySection>
          </div>
        ),
      },
    ],
  },
  "summary-group": {
    description: [
      {
        label: "opcional",
        node: (
          <div className="w-full max-w-sm">
            <SummaryGroup title="Saldo inicial">
              <SummaryItem
                title="Movimientos del mes"
                value="DOP $8,000.00"
                icon={TagsIcon}
                isLast
              />
            </SummaryGroup>
          </div>
        ),
      },
      {
        label: "debajo del título",
        node: (
          <div className="w-full max-w-sm">
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
          </div>
        ),
      },
    ],
  },
  "detail-header": {
    badge: [
      {
        label: "sin insignia",
        node: (
          <div
            className="flex w-full max-w-sm flex-col rounded-2xl p-4 text-white"
            style={{ backgroundColor: GALLERY_ACCENT }}
          >
            <DetailHeader
              media={<BrandLogo name="Institución Ejemplo" size={48} />}
              title="Banco Ejemplo"
              subtitle="Cuenta principal"
            />
          </div>
        ),
      },
      {
        label: "con label y variant",
        node: (
          <div
            className="flex w-full max-w-sm flex-col rounded-2xl p-4 text-white"
            style={{ backgroundColor: GALLERY_ACCENT }}
          >
            <DetailHeader
              media={<BrandLogo name="Cuenta Ejemplo" size={48} />}
              title="Ahorro programado"
              badge={{ label: "Activa", variant: "success" }}
              subtitle="Ahorro · DOP"
            />
          </div>
        ),
      },
    ],
    media: [
      {
        label: "BrandLogo u otro nodo de 48 px",
        node: (
          <div
            className="flex w-full max-w-sm flex-col rounded-2xl p-4 text-white"
            style={{ backgroundColor: GALLERY_ACCENT }}
          >
            <DetailHeader
              media={<BrandLogo name="Banco Ejemplo" size={48} />}
              title="Banco Ejemplo"
              subtitle="Cuenta principal"
            />
          </div>
        ),
      },
    ],
  },
  collapsible: {
    defaultOpen: [
      { label: "false", node: <CollapsibleSample /> },
      { label: "true", node: <CollapsibleSample defaultOpen /> },
    ],
    states: [
      { label: "open", node: <CollapsibleSample defaultOpen /> },
      { label: "closed", node: <CollapsibleSample /> },
      {
        label: "disabled",
        node: (
          <Collapsible disabled className="w-full max-w-sm">
            <CollapsibleTrigger
              render={
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled
                />
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
  },
}
