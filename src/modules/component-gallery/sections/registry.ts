import type { ComponentType } from "react"

import type { ComponentGallerySectionId } from "@/src/modules/component-gallery/sections"
import { ActionsSection } from "@/src/modules/component-gallery/sections/actions-section"
import { ChartsSection } from "@/src/modules/component-gallery/sections/charts-section"
import { EntriesSection } from "@/src/modules/component-gallery/sections/entries-section"
import { HeadingsSection } from "@/src/modules/component-gallery/sections/headings-section"
import { ListsSection } from "@/src/modules/component-gallery/sections/lists-section"
import { MoneyAndDatesSection } from "@/src/modules/component-gallery/sections/money-and-dates-section"
import { NoticesSection } from "@/src/modules/component-gallery/sections/notices-section"
import { OverlaysSection } from "@/src/modules/component-gallery/sections/overlays-section"
import { SelectorsSection } from "@/src/modules/component-gallery/sections/selectors-section"
import { StatesSection } from "@/src/modules/component-gallery/sections/states-section"
import { TabsSection } from "@/src/modules/component-gallery/sections/tabs-section"

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
