import {
  accionesDemos,
  accionesVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/acciones"
import {
  avisosDemos,
  avisosVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/avisos"
import {
  encabezadosDemos,
  encabezadosVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/encabezados"
import {
  entradasDemos,
  entradasVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/entradas"
import {
  estadosDemos,
  estadosVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/estados"
import {
  estructuraDemos,
  estructuraVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/estructura"
import {
  graficosDemos,
  graficosVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/graficos"
import {
  listasDemos,
  listasVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/listas"
import {
  montosDemos,
  montosVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/montos"
import {
  overlaysDemos,
  overlaysVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/overlays"
import {
  selectoresDemos,
  selectoresVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/selectores"
import {
  tabsDemos,
  tabsVariantDemos,
} from "@/src/modules/galleries/components/catalog/demos/tabs"
import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

/** Todos los demos, indexados por el id del componente. */
export const GALLERY_DEMOS: GalleryDemoMap = {
  ...entradasDemos,
  ...selectoresDemos,
  ...accionesDemos,
  ...overlaysDemos,
  ...tabsDemos,
  ...listasDemos,
  ...encabezadosDemos,
  ...estadosDemos,
  ...avisosDemos,
  ...montosDemos,
  ...graficosDemos,
  ...estructuraDemos,
}

/** Ejemplos pintados de variantes y estados, por ficha y por grupo. */
export const GALLERY_VARIANT_DEMOS: GalleryVariantDemoMap = {
  ...entradasVariantDemos,
  ...selectoresVariantDemos,
  ...accionesVariantDemos,
  ...overlaysVariantDemos,
  ...tabsVariantDemos,
  ...listasVariantDemos,
  ...encabezadosVariantDemos,
  ...estadosVariantDemos,
  ...avisosVariantDemos,
  ...montosVariantDemos,
  ...graficosVariantDemos,
  ...estructuraVariantDemos,
}
