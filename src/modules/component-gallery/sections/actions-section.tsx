"use client"

import { GalleryDemo } from "@/src/modules/component-gallery/gallery-demo"
import { simulatedTap } from "@/src/modules/component-gallery/simulated-tap"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import {
  ChevronLeftIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"

/** Variantes, tamaños y estados de Button (#307). */
export function ActionsSection() {
  return (
    <>
      <GalleryDemo
        name="Button"
        importPath="@/src/shared/components/ui/button"
        states="default, outline, secondary, ghost, destructive, link"
        note="Todo botón lleva icono. El texto es opcional; si el botón es solo icono, lleva aria-label."
      >
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => simulatedTap("Guardar")}>
            <SaveIcon />
            Guardar
          </Button>
          <Button variant="outline" onClick={() => simulatedTap("Editar")}>
            <PencilIcon />
            Editar
          </Button>
          <Button variant="secondary" onClick={() => simulatedTap("Agregar")}>
            <PlusIcon />
            Agregar
          </Button>
          <Button variant="ghost" onClick={() => simulatedTap("Más")}>
            <EllipsisVerticalIcon />
            Más
          </Button>
          <Button
            variant="destructive"
            onClick={() => simulatedTap("Eliminar")}
          >
            <Trash2Icon />
            Eliminar
          </Button>
          <Button variant="link" onClick={() => simulatedTap("Ver detalle")}>
            Ver detalle
          </Button>
        </div>
      </GalleryDemo>

      <GalleryDemo
        name="Button"
        importPath="@/src/shared/components/ui/button"
        states="sm, default, lg, icon, icon-sm, icon-lg"
        note="El tamaño cambia la altura y el icono, no el color."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => simulatedTap("Pequeño")}>
            <PlusIcon />
            Pequeño
          </Button>
          <Button size="default" onClick={() => simulatedTap("Mediano")}>
            <PlusIcon />
            Mediano
          </Button>
          <Button size="lg" onClick={() => simulatedTap("Grande")}>
            <PlusIcon />
            Grande
          </Button>
          <Button
            size="icon"
            aria-label="Más acciones"
            onClick={() => simulatedTap("Solo icono")}
          >
            <EllipsisVerticalIcon />
          </Button>
          <Button
            size="icon-sm"
            aria-label="Editar"
            onClick={() => simulatedTap("Solo icono pequeño")}
          >
            <PencilIcon />
          </Button>
          <Button
            size="icon-lg"
            aria-label="Eliminar"
            variant="destructive"
            onClick={() => simulatedTap("Solo icono grande")}
          >
            <Trash2Icon />
          </Button>
        </div>
      </GalleryDemo>

      <GalleryDemo
        name="Button"
        importPath="@/src/shared/components/ui/button"
        states="pending con Spinner, deshabilitado, deshabilitado por envío"
        note="Mientras la acción está pendiente, el botón se deshabilita y muestra el Spinner dentro, no en medio de la sección."
      >
        <div className="flex flex-wrap gap-2">
          <Button disabled>
            <Spinner />
            Guardando
          </Button>
          <Button variant="outline" disabled>
            <SaveIcon />
            Deshabilitado
          </Button>
        </div>
      </GalleryDemo>

      <GalleryDemo
        name="Button asChild"
        importPath="@/src/shared/components/ui/button"
        states="navegación con Link"
        note="Navegar es un Link con el estilo del botón, no un botón con router.push."
      >
        <Button asChild variant="outline">
          <Link href={APP_ROUTES.app.dev}>
            <ChevronLeftIcon />
            Volver al índice
          </Link>
        </Button>
      </GalleryDemo>
    </>
  )
}
