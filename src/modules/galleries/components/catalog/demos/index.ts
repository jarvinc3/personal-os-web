import { accionesDemos } from "@/src/modules/galleries/components/catalog/demos/acciones"
import { avisosDemos } from "@/src/modules/galleries/components/catalog/demos/avisos"
import { encabezadosDemos } from "@/src/modules/galleries/components/catalog/demos/encabezados"
import { entradasDemos } from "@/src/modules/galleries/components/catalog/demos/entradas"
import { estadosDemos } from "@/src/modules/galleries/components/catalog/demos/estados"
import { estructuraDemos } from "@/src/modules/galleries/components/catalog/demos/estructura"
import { graficosDemos } from "@/src/modules/galleries/components/catalog/demos/graficos"
import { listasDemos } from "@/src/modules/galleries/components/catalog/demos/listas"
import { montosDemos } from "@/src/modules/galleries/components/catalog/demos/montos"
import { overlaysDemos } from "@/src/modules/galleries/components/catalog/demos/overlays"
import { selectoresDemos } from "@/src/modules/galleries/components/catalog/demos/selectores"
import { tabsDemos } from "@/src/modules/galleries/components/catalog/demos/tabs"
import type { GalleryDemoMap } from "@/src/modules/galleries/components/catalog/types"

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
