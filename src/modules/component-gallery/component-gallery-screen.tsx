"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"

import { COMPONENT_GALLERY_SECTIONS } from "@/src/modules/component-gallery/sections"
import { COMPONENT_GALLERY_SECTION_BODIES } from "@/src/modules/component-gallery/sections/registry"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { PRESSABLE_CLASS } from "@/src/shared/lib/utils"

const SECTION_ANCHOR_CLASS = `inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium whitespace-nowrap text-foreground ${PRESSABLE_CLASS}`

/** Todos los componentes compartidos, por propósito (#307). */
export function ComponentGalleryScreen() {
  const router = useRouter()
  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.dev)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Componentes",
      subtitle: `${COMPONENT_GALLERY_SECTIONS.length} secciones`,
      onBack: handleBack,
    },
    [handleBack]
  )

  return (
    <div className="mx-auto flex max-w-2xl min-w-0 flex-col gap-6 p-4 pb-16 md:px-6">
      <p className="text-sm text-muted-foreground">
        Referencia visual de los componentes reales, con datos de ejemplo. Nada
        aquí lee ni escribe datos del usuario ni llama al back: los toques
        muestran «Toque simulado». Si un componente no aparece, no existe
        todavía y su issue lo agrega.
      </p>

      <nav
        aria-label="Secciones de la galería"
        className="-mx-4 min-w-0 overflow-x-auto px-4 pb-1"
      >
        <ul className="flex w-max gap-2">
          {COMPONENT_GALLERY_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <li key={section.id} className="min-w-0">
                <a href={`#${section.id}`} className={SECTION_ANCHOR_CLASS}>
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  {section.title}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {COMPONENT_GALLERY_SECTIONS.map((section) => {
        const Icon = section.icon
        const Body = COMPONENT_GALLERY_SECTION_BODIES[section.id]
        return (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="flex scroll-mt-24 flex-col gap-3"
          >
            <header className="flex min-w-0 flex-col gap-0.5">
              <h2
                id={`${section.id}-title`}
                className="flex items-center gap-2 text-base font-semibold text-foreground"
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {section.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </header>
            <Body />
          </section>
        )
      })}
    </div>
  )
}
