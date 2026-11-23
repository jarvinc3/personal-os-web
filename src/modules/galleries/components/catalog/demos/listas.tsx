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
  AvatarImage,
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

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

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
      code: `
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
`,
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
      code: `
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
`,
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
      code: `
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
      accentColor={"#0f766e"}
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
`,
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
      code: `
const [notifications, setNotifications] = useState(true)

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
`,
      node: <SettingsRowDemo />,
    },
  ],
  accordion: [
    {
      label: "Con un panel abierto",
      code: `
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
`,
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
      code: `
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
`,
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

export const listasVariantDemos: GalleryVariantDemoMap = {
  item: {
    variant: [
      {
        label: "default",
        node: (
          <Item className="w-full max-w-sm">
            <ItemMedia variant="icon">
              <InboxIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Importación completada</ItemTitle>
              <ItemDescription>12 movimientos</ItemDescription>
            </ItemContent>
          </Item>
        ),
      },
      {
        label: "outline",
        node: (
          <Item variant="outline" className="w-full max-w-sm">
            <ItemMedia variant="icon">
              <FileTextIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Revisión pendiente</ItemTitle>
              <ItemDescription>Tres correos</ItemDescription>
            </ItemContent>
          </Item>
        ),
      },
      {
        label: "muted",
        node: (
          <Item variant="muted" className="w-full max-w-sm">
            <ItemMedia variant="icon">
              <SettingsIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Ajustes</ItemTitle>
              <ItemDescription>Apariencia y avisos</ItemDescription>
            </ItemContent>
          </Item>
        ),
      },
    ],
    size: [
      {
        label: "default",
        node: (
          <Item size="default" className="w-full max-w-sm">
            <ItemMedia variant="icon">
              <BellIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Tamaño default</ItemTitle>
              <ItemDescription>Media de 40 px</ItemDescription>
            </ItemContent>
          </Item>
        ),
      },
      {
        label: "sm",
        node: (
          <Item size="sm" className="w-full max-w-sm">
            <ItemMedia variant="icon">
              <BellIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Tamaño sm</ItemTitle>
              <ItemDescription>Media de 32 px</ItemDescription>
            </ItemContent>
          </Item>
        ),
      },
      {
        label: "xs",
        node: (
          <Item size="xs" className="w-full max-w-sm">
            <ItemMedia variant="icon">
              <BellIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Tamaño xs</ItemTitle>
              <ItemDescription>Media de 24 px</ItemDescription>
            </ItemContent>
          </Item>
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <Item className="w-full max-w-sm">
            <ItemMedia variant="icon">
              <InboxIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Importación completada</ItemTitle>
            </ItemContent>
          </Item>
        ),
      },
      {
        label: "interactive (render)",
        node: (
          <Item
            render={<button type="button" />}
            className="w-full max-w-sm"
            onClick={() => simulatedTap("Abrir detalle")}
          >
            <ItemMedia variant="icon">
              <FileTextIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Abrir detalle</ItemTitle>
              <ItemDescription>Se puede pulsar</ItemDescription>
            </ItemContent>
          </Item>
        ),
      },
      {
        label: "disabled por el padre",
        node: (
          <div
            aria-disabled="true"
            className="pointer-events-none w-full max-w-sm opacity-50"
          >
            <Item>
              <ItemMedia variant="icon">
                <Trash2Icon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Archivar</ItemTitle>
                <ItemDescription>No disponible ahora</ItemDescription>
              </ItemContent>
            </Item>
          </div>
        ),
      },
    ],
  },
  marker: {
    variant: [
      {
        label: "default",
        node: (
          <Marker className="max-w-sm">
            <MarkerIcon>
              <BellIcon />
            </MarkerIcon>
            <MarkerContent>Sincronización en curso</MarkerContent>
          </Marker>
        ),
      },
      {
        label: "separator",
        node: (
          <Marker variant="separator" className="max-w-sm">
            <MarkerContent>Hoy</MarkerContent>
          </Marker>
        ),
      },
      {
        label: "border",
        node: (
          <Marker variant="border" className="max-w-sm">
            <MarkerContent>Importado del correo</MarkerContent>
          </Marker>
        ),
      },
    ],
  },
  "summary-item": {
    "href / onPress": [
      {
        label: "enlace con pending",
        node: (
          <div className="flex w-full max-w-sm flex-col rounded-2xl border border-border bg-card p-2">
            <SummaryItem
              title="Exportar los datos"
              description="Copia de seguridad"
              value="JSON"
              icon={FileTextIcon}
              href={APP_ROUTES.app.settingsAppearance}
            />
          </div>
        ),
      },
      {
        label: "acción sin overlay",
        node: (
          <div className="flex w-full max-w-sm flex-col rounded-2xl border border-border bg-card p-2">
            <SummaryItem
              title="Movimientos sin categoría"
              description="Doce pendientes"
              value="12"
              icon={InboxIcon}
              isLast
              onPress={() => simulatedTap("Abrir movimientos")}
            />
          </div>
        ),
      },
    ],
    tintRow: [
      {
        label: "true con accentColor",
        node: (
          <div className="flex w-full max-w-sm flex-col rounded-2xl border border-border bg-card p-2">
            <SummaryItem
              title="Prioridad alta"
              value="3"
              icon={BellIcon}
              accentColor={GALLERY_ACCENT}
              tintRow
              isLast
            />
          </div>
        ),
      },
      {
        label: "false por defecto",
        node: (
          <div className="flex w-full max-w-sm flex-col rounded-2xl border border-border bg-card p-2">
            <SummaryItem
              title="Prioridad alta"
              value="3"
              icon={BellIcon}
              isLast
            />
          </div>
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <div className="flex w-full max-w-sm flex-col rounded-2xl border border-border bg-card p-2">
            <SummaryItem
              title="Exportar los datos"
              value="JSON"
              icon={FileTextIcon}
              isLast
            />
          </div>
        ),
      },
      {
        label: "disabled",
        node: (
          <div className="flex w-full max-w-sm flex-col rounded-2xl border border-border bg-card p-2">
            <SummaryItem
              title="Elemento archivado"
              description="No se puede abrir"
              icon={FileTextIcon}
              isLast
              disabled
            />
          </div>
        ),
      },
    ],
  },
  "settings-row": {
    modo: [
      {
        label: "navegación (onPress)",
        node: (
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card p-1">
            <SettingsRow
              label="Perfil"
              description="Nombre, correo y foto"
              icon={ShieldIcon}
              isLast
              onPress={() => simulatedTap("Abrir perfil")}
            />
          </div>
        ),
      },
      {
        label: "switch",
        node: (
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card p-1">
            <SettingsRow
              label="Avisos"
              description="Recibir un aviso al llegar un cobro"
              icon={BellIcon}
              switchValue
              isLast
              onSwitchChange={() => simulatedTap("Cambiar avisos")}
            />
          </div>
        ),
      },
      {
        label: "link externo",
        node: (
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card p-1">
            <SettingsRow
              label="Centro de ayuda"
              description="Preguntas y guías"
              icon={FileTextIcon}
              link
              isLast
              onPress={() => simulatedTap("Abrir ayuda")}
            />
          </div>
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card p-1">
            <SettingsRow
              label="Tema"
              value="Oscuro"
              icon={MoonIcon}
              isLast
              onPress={() => simulatedTap("Elegir tema")}
            />
          </div>
        ),
      },
      {
        label: "destructive",
        node: (
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card p-1">
            <SettingsRow
              label="Eliminar cuenta"
              icon={Trash2Icon}
              destructive
              isLast
              onPress={() => simulatedTap("Eliminar cuenta")}
            />
          </div>
        ),
      },
      {
        label: "disabled",
        node: (
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card p-1">
            <SettingsRow
              label="Eliminar cuenta"
              icon={Trash2Icon}
              disabled
              isLast
              onPress={() => simulatedTap("Eliminar cuenta")}
            />
          </div>
        ),
      },
    ],
  },
  accordion: {
    multiple: [
      {
        label: "false",
        node: (
          <Accordion defaultValue={["datos"]} className="w-full max-w-sm">
            <AccordionItem value="datos">
              <AccordionTrigger>¿Qué datos se importan?</AccordionTrigger>
              <AccordionContent>Solo el período elegido.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="privacidad">
              <AccordionTrigger>¿Puedo revocarlo?</AccordionTrigger>
              <AccordionContent>Desde Ajustes → Privacidad.</AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
      },
      {
        label: "true",
        node: (
          <Accordion
            multiple
            defaultValue={["datos", "privacidad"]}
            className="w-full max-w-sm"
          >
            <AccordionItem value="datos">
              <AccordionTrigger>¿Qué datos se importan?</AccordionTrigger>
              <AccordionContent>Solo el período elegido.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="privacidad">
              <AccordionTrigger>¿Puedo revocarlo?</AccordionTrigger>
              <AccordionContent>Desde Ajustes → Privacidad.</AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
      },
    ],
    states: [
      {
        label: "open",
        node: (
          <Accordion defaultValue={["datos"]} className="w-full max-w-sm">
            <AccordionItem value="datos">
              <AccordionTrigger>¿Qué datos se importan?</AccordionTrigger>
              <AccordionContent>Solo el período elegido.</AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
      },
      {
        label: "closed",
        node: (
          <Accordion className="w-full max-w-sm">
            <AccordionItem value="datos">
              <AccordionTrigger>¿Qué datos se importan?</AccordionTrigger>
              <AccordionContent>Solo el período elegido.</AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
      },
      {
        label: "disabled",
        node: (
          <Accordion className="w-full max-w-sm">
            <AccordionItem value="datos" disabled>
              <AccordionTrigger>¿Qué datos se importan?</AccordionTrigger>
              <AccordionContent>Solo el período elegido.</AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
      },
    ],
  },
  avatar: {
    size: [
      {
        label: "sm",
        node: (
          <Avatar size="sm">
            <AvatarFallback>LC</AvatarFallback>
          </Avatar>
        ),
      },
      {
        label: "default",
        node: (
          <Avatar>
            <AvatarFallback>JA</AvatarFallback>
          </Avatar>
        ),
      },
      {
        label: "lg",
        node: (
          <Avatar size="lg">
            <AvatarFallback>MR</AvatarFallback>
          </Avatar>
        ),
      },
    ],
    states: [
      {
        label: "image",
        node: (
          <Avatar>
            <AvatarImage src="/assets/icon.png" alt="Icono de la app" />
            <AvatarFallback>JA</AvatarFallback>
          </Avatar>
        ),
      },
      {
        label: "fallback",
        node: (
          <Avatar>
            <AvatarFallback>JA</AvatarFallback>
          </Avatar>
        ),
      },
      {
        label: "missing image",
        node: (
          <Avatar>
            <AvatarImage src="/assets/no-existe.png" alt="Imagen que falla" />
            <AvatarFallback>MR</AvatarFallback>
          </Avatar>
        ),
      },
    ],
  },
}
