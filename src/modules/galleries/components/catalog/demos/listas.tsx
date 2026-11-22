import { useState } from "react"
import Link from "next/link"
import {
  BellIcon,
  FileTextIcon,
  InboxIcon,
  MoonIcon,
  SettingsIcon,
  ShieldIcon,
  Trash2Icon,
} from "lucide-react"

import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import { GALLERY_ACCENT } from "@/src/modules/galleries/components/mock/values"
import { SettingsRow } from "@/src/shared/components/settings/settings-section"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/shared/components/ui/accordion"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/src/shared/components/ui/avatar"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/src/shared/components/ui/marker"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"

import type { GalleryDemoMap } from "@/src/modules/galleries/components/catalog/types"

function SettingsRowDemo() {
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-1">
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
    </div>
  )
}

export const listasDemos: GalleryDemoMap = {
  item: [
    {
      label: "Con media, descripción y acción",
      node: (
        <ItemGroup className="w-full">
          <Item>
            <ItemMedia variant="icon">
              <InboxIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Importación completada</ItemTitle>
              <ItemDescription>12 movimientos</ItemDescription>
            </ItemContent>
            <ItemActions>
              <span className="text-sm font-semibold">Hoy</span>
            </ItemActions>
          </Item>
          <Item variant="outline">
            <ItemMedia variant="icon">
              <FileTextIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Revisión pendiente</ItemTitle>
              <ItemDescription>Tres correos</ItemDescription>
            </ItemContent>
          </Item>
          <Item
            variant="muted"
            render={<Link href={APP_ROUTES.app.settingsAppearance} />}
          >
            <ItemMedia variant="icon">
              <SettingsIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Ajustes</ItemTitle>
              <ItemDescription>Apariencia y avisos</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      ),
    },
  ],
  marker: [
    {
      label: "Con icono, separador y borde",
      node: (
        <div className="flex w-full flex-col gap-4">
          <Marker>
            <MarkerIcon>
              <BellIcon />
            </MarkerIcon>
            <MarkerContent>Sincronización en curso</MarkerContent>
          </Marker>
          <Marker variant="separator">
            <MarkerContent>Hoy</MarkerContent>
          </Marker>
          <Marker variant="border">
            <MarkerContent>Importado del correo</MarkerContent>
          </Marker>
        </div>
      ),
    },
  ],
  "summary-item": [
    {
      label: "Enlace, acción, valor, tinte y deshabilitada",
      node: (
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-col rounded-2xl border border-border bg-card p-2">
            <SummaryItem
              title="Exportar los datos"
              description="Copia de seguridad"
              value="JSON"
              icon={FileTextIcon}
              href={APP_ROUTES.app.settingsAppearance}
            />
            <SummaryItem
              title="Movimientos sin categoría"
              description="Doce pendientes"
              value="12"
              icon={InboxIcon}
              onPress={() => simulatedTap("Abrir movimientos")}
            />
          </div>
          <div className="flex flex-col rounded-2xl border border-border bg-card p-2">
            <SummaryItem
              title="Prioridad alta"
              value="3"
              icon={BellIcon}
              accentColor={GALLERY_ACCENT}
              tintRow
              isLast
            />
          </div>
          <div className="flex flex-col rounded-2xl border border-border bg-card p-2">
            <SummaryItem
              title="Elemento archivado"
              description="No se puede abrir"
              icon={FileTextIcon}
              disabled
              isLast
            />
          </div>
        </div>
      ),
    },
  ],
  "settings-row": [
    {
      label: "Chevron, switch, destructiva y valor",
      node: <SettingsRowDemo />,
    },
  ],
  accordion: [
    {
      label: "Con un panel abierto",
      node: (
        <Accordion defaultValue={["datos"]} className="w-full">
          <AccordionItem value="datos">
            <AccordionTrigger>¿Qué datos se importan?</AccordionTrigger>
            <AccordionContent>
              Solo los movimientos del período elegido; el correo queda como
              evidencia.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="privacidad">
            <AccordionTrigger>¿Puedo revocarlo?</AccordionTrigger>
            <AccordionContent>
              Sí, desde Ajustes → Privacidad, sin borrar los movimientos.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ),
    },
  ],
  avatar: [
    {
      label: "Tamaños, iniciales y grupo",
      node: (
        <div className="flex flex-wrap items-center gap-3">
          <Avatar>
            <AvatarFallback>JA</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>MR</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback>LC</AvatarFallback>
          </Avatar>
          <AvatarGroup>
            <Avatar>
              <AvatarFallback>JA</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>MR</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+3</AvatarGroupCount>
          </AvatarGroup>
        </div>
      ),
    },
  ],
}
