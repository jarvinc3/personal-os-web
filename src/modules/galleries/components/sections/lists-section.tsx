"use client"

import { GalleryDemo } from "@/src/modules/galleries/components/gallery-demo"
import { GALLERY_ACCENT } from "@/src/modules/galleries/components/mock/values"
import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/settings/settings-section"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import {
  BellIcon,
  CreditCardIcon,
  LandmarkIcon,
  MoonIcon,
  ShieldIcon,
  TagsIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react"
import { useState } from "react"

/** Filas de una lista y filas de ajustes (#307). */
export function ListsSection() {
  const [notifications, setNotifications] = useState(true)

  return (
    <>
      <GalleryDemo
        name="SummarySection + SummaryItem"
        importPath="@/src/shared/components/data-display/summary"
        states="enlace, acción, con valor, chevron, última fila, con tinte"
        note="Es el bloque con título de cualquier lista. No se arma con un div de borde a mano."
      >
        <SummarySection title="Cuentas" icon={LandmarkIcon}>
          <SummaryItem
            title="Cuenta de ahorros"
            value="DOP $12,500.00"
            icon={WalletIcon}
            href={APP_ROUTES.app.settingsAppearance}
          />
          <SummaryItem
            title="Cuenta corriente"
            description="Banco Ejemplo"
            value="DOP $3,200.00"
            icon={CreditCardIcon}
            onPress={() => simulatedTap("Abrir cuenta corriente")}
          />
        </SummarySection>

        <SummarySection title="Categorías" icon={TagsIcon}>
          <SummaryItem
            title="Mercado"
            value="DOP $1,250.00"
            icon={TagsIcon}
            accentColor={GALLERY_ACCENT}
            tintRow
            isLast
          />
        </SummarySection>

        <SummarySection title="Deshabilitada" icon={WalletIcon}>
          <SummaryItem
            title="Cuenta archivada"
            description="No se puede abrir"
            icon={WalletIcon}
            disabled
            isLast
          />
        </SummarySection>
      </GalleryDemo>

      <GalleryDemo
        name="SettingsSection + SettingsRow"
        importPath="@/src/shared/components/settings/settings-section"
        states="chevron, switch, destructiva, deshabilitada"
        note="Grupo con etiqueta corta en mayúsculas. La fila con switch lleva icono obligatorio."
      >
        <SettingsSection title="Cuenta">
          <SettingsRow
            label="Perfil"
            description="Nombre, correo y foto"
            icon={ShieldIcon}
            showChevron
            onPress={() => simulatedTap("Abrir perfil")}
          />
          <SettingsRow
            label="Avisos"
            description="Recibir un aviso al llegar un cobro"
            icon={BellIcon}
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
          <SettingsRow
            label="Tema"
            value="Oscuro"
            icon={MoonIcon}
            showChevron
            onPress={() => simulatedTap("Elegir tema")}
          />
          <SettingsRow
            label="Eliminar cuenta"
            icon={Trash2Icon}
            destructive
            showChevron
            onPress={() => simulatedTap("Eliminar cuenta")}
          />
          <SettingsRow
            label="Sesión"
            value="Sin permiso"
            icon={ShieldIcon}
            disabled
            isLast
          />
        </SettingsSection>
      </GalleryDemo>
    </>
  )
}
