import Image from "next/image"
import Link from "next/link"
import {
  BellIcon,
  ChevronRightIcon,
  FileTextIcon,
  InboxIcon,
  SettingsIcon,
  Trash2Icon,
} from "lucide-react"

import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
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
import { Card } from "@/src/shared/components/ui/card"
import { Switch } from "@/src/shared/components/ui/switch"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

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
    {
      label: "Filas planas dentro de una Card",
      code: `
<Card className="w-full gap-0 bg-card p-1">
  <ItemGroup className="gap-0 divide-y divide-border/60">
    <Item
      variant="plain"
      className="min-h-[52px] px-3 py-3"
      render={<Link href={APP_ROUTES.app.settingsAccount} />}
    >
      <ItemMedia className="size-9 rounded-md bg-muted">
        <SettingsIcon className="size-4.5" />
      </ItemMedia>
      <ItemContent className="gap-0.5">
        <ItemTitle className="text-sm font-normal md:text-base">
          Perfil
        </ItemTitle>
        <ItemDescription className="text-xs">
          Nombre, correo y foto
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4.5 text-muted-foreground" />
      </ItemActions>
    </Item>
    <Item variant="plain" className="min-h-[52px] px-3 py-3">
      <ItemMedia className="size-9 rounded-md bg-muted">
        <BellIcon className="size-4.5" />
      </ItemMedia>
      <ItemContent className="gap-0.5">
        <ItemTitle className="text-sm font-normal md:text-base">
          Avisos
        </ItemTitle>
        <ItemDescription className="text-xs">
          Recibir un aviso al llegar un cobro
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Switch defaultChecked />
      </ItemActions>
    </Item>
  </ItemGroup>
</Card>
`,
      node: (
        <Card className="w-full gap-0 bg-card p-1">
          <ItemGroup className="gap-0 divide-y divide-border/60">
            <Item
              variant="plain"
              className="min-h-[52px] px-3 py-3"
              render={<Link href={APP_ROUTES.app.settingsAccount} />}
            >
              <ItemMedia className="size-9 rounded-md bg-muted">
                <SettingsIcon className="size-4.5" />
              </ItemMedia>
              <ItemContent className="gap-0.5">
                <ItemTitle className="text-sm font-normal md:text-base">
                  Perfil
                </ItemTitle>
                <ItemDescription className="text-xs">
                  Nombre, correo y foto
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4.5 text-muted-foreground" />
              </ItemActions>
            </Item>
            <Item variant="plain" className="min-h-[52px] px-3 py-3">
              <ItemMedia className="size-9 rounded-md bg-muted">
                <BellIcon className="size-4.5" />
              </ItemMedia>
              <ItemContent className="gap-0.5">
                <ItemTitle className="text-sm font-normal md:text-base">
                  Avisos
                </ItemTitle>
                <ItemDescription className="text-xs">
                  Recibir un aviso al llegar un cobro
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Switch defaultChecked />
              </ItemActions>
            </Item>
          </ItemGroup>
        </Card>
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
    "variant (Media)": [
      {
        label: "default",
        node: (
          <Item className="w-full max-w-sm">
            <ItemMedia>
              <BellIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Sin fondo</ItemTitle>
              <ItemDescription>La media queda desnuda</ItemDescription>
            </ItemContent>
          </Item>
        ),
      },
      {
        label: "icon",
        node: (
          <Item className="w-full max-w-sm">
            <ItemMedia variant="icon">
              <BellIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Con fondo</ItemTitle>
              <ItemDescription>Icono dentro de un círculo</ItemDescription>
            </ItemContent>
          </Item>
        ),
      },
      {
        label: "image",
        node: (
          <Item className="w-full max-w-sm">
            <ItemMedia variant="image">
              <Image src="/images/image.png" alt="" width={40} height={40} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Con imagen</ItemTitle>
              <ItemDescription>Miniatura recortada</ItemDescription>
            </ItemContent>
          </Item>
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
