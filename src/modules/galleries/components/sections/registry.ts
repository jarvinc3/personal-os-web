import type { ComponentType } from "react"

import type { ComponentGallerySectionId } from "@/src/modules/galleries/components/sections"
import { ActionsSection } from "@/src/modules/galleries/components/sections/actions-section"
import { ChartsSection } from "@/src/modules/galleries/components/sections/charts-section"
import { EntriesSection } from "@/src/modules/galleries/components/sections/entries-section"
import { HeadingsSection } from "@/src/modules/galleries/components/sections/headings-section"
import { ListsSection } from "@/src/modules/galleries/components/sections/lists-section"
import { MoneyAndDatesSection } from "@/src/modules/galleries/components/sections/money-and-dates-section"
import { NoticesSection } from "@/src/modules/galleries/components/sections/notices-section"
import { OverlaysSection } from "@/src/modules/galleries/components/sections/overlays-section"
import { SelectorsSection } from "@/src/modules/galleries/components/sections/selectors-section"
import { StatesSection } from "@/src/modules/galleries/components/sections/states-section"
import { TabsSection } from "@/src/modules/galleries/components/sections/tabs-section"

/** Cuerpo real de cada sección, en el orden de COMPONENT_GALLERY_SECTIONS. */
export const COMPONENT_GALLERY_SECTION_BODIES: Record<
  ComponentGallerySectionId,
  ComponentType
> = {
  entradas: EntriesSection,
  selectores: SelectorsSection,
  acciones: ActionsSection,
  overlays: OverlaysSection,
  tabs: TabsSection,
  listas: ListsSection,
  encabezados: HeadingsSection,
  estados: StatesSection,
  avisos: NoticesSection,
  montos: MoneyAndDatesSection,
  graficos: ChartsSection,
}
