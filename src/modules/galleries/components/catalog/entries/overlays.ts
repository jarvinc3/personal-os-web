import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const overlaysDocs: readonly GalleryComponentMeta[] = [
  {
    id: "alert-dialog",
    name: "AlertDialog",
    category: "overlays",
    kind: "ui",
    description:
      "Diálogo modal de confirmación con acción y cancelar, sin ruta.",
    whenToUse:
      "Toda confirmación de una acción destructiva o difícil de deshacer: título en pregunta, consecuencia, icono y pending.",
    whenNotToUse:
      "Navegación, abrir una hoja o un alta reversible. Una edición: una hoja con Drawer.",
    importPath: "@/src/shared/components/ui/alert-dialog",
    snippet: `import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/shared/components/ui/alert-dialog"

<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogMedia className="bg-destructive/10 text-destructive">
        <Trash2Icon />
      </AlertDialogMedia>
      <AlertDialogTitle>¿Eliminar el movimiento?</AlertDialogTitle>
      <AlertDialogDescription>
        Se quitará de la lista y del saldo de la cuenta. No se puede deshacer.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={pending}>
        <XIcon className="size-4 shrink-0" aria-hidden="true" />
        Cancelar
      </AlertDialogCancel>
      <AlertDialogAction
        variant="destructive"
        disabled={pending}
        onClick={onConfirm}
      >
        {pending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Trash2Icon className="size-4 shrink-0" aria-hidden="true" />
        )}
        {pending ? "Eliminando..." : "Eliminar"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
    subcomponents: [
      "AlertDialogTrigger",
      "AlertDialogContent",
      "AlertDialogHeader",
      "AlertDialogMedia",
      "AlertDialogTitle",
      "AlertDialogDescription",
      "AlertDialogFooter",
      "AlertDialogAction",
      "AlertDialogCancel",
    ],
    anatomy: [
      {
        name: "AlertDialog",
        children: [
          { name: "AlertDialogTrigger" },
          {
            name: "AlertDialogContent",
            children: [
              { name: "AlertDialogHeader" },
              { name: "AlertDialogFooter" },
            ],
          },
        ],
      },
    ],
    variants: [
      { name: "size (Content)", values: "default, sm" },
      { name: "variant (Action)", values: "default, destructive, outline" },
      { name: "states", values: "normal, pending" },
    ],
    props: [
      {
        name: "open / onOpenChange",
        type: "boolean / (open: boolean) => void",
        description:
          "Estado del diálogo; Esc y Cancelar cierran, un clic fuera no. Con pending, el cambio se ignora.",
      },
      {
        name: "AlertDialogMedia",
        type: "ReactNode",
        description:
          "Icono grande del encabezado; en una acción destructiva lleva bg-destructive/10 y text-destructive.",
      },
      {
        name: "pending",
        type: "boolean",
        description:
          "Deshabilita Cancelar y la acción, y cambia el icono de la acción por Spinner.",
      },
    ],
  },
  {
    id: "dialog",
    name: "Dialog",
    category: "overlays",
    kind: "ui",
    description: "Diálogo modal centrado para contenido o un formulario corto.",
    whenToUse:
      "Un contenido modal que no es una confirmación y no merece una hoja.",
    whenNotToUse:
      "Una edición de producto: una hoja con Drawer por ruta. Una confirmación: AlertDialog.",
    importPath: "@/src/shared/components/ui/dialog",
    snippet: `import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/shared/components/ui/dialog"

<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>Abrir</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Renombrar etiqueta</DialogTitle>
      <DialogDescription>El nombre cambia en todas partes.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`,
    subcomponents: [
      "DialogTrigger",
      "DialogContent",
      "DialogHeader",
      "DialogTitle",
      "DialogDescription",
      "DialogFooter",
      "DialogClose",
    ],
    anatomy: [
      {
        name: "Dialog",
        children: [
          { name: "DialogTrigger" },
          {
            name: "DialogContent",
            children: [{ name: "DialogHeader" }, { name: "DialogFooter" }],
          },
        ],
      },
    ],
    variants: [{ name: "showCloseButton", values: "true, false" }],
    props: [
      {
        name: "open / onOpenChange",
        type: "boolean / (open: boolean) => void",
        description: "Estado del diálogo.",
      },
      {
        name: "showCloseButton (Content)",
        type: "boolean",
        description: "Muestra la X de cierre.",
      },
    ],
  },
  {
    id: "drawer",
    name: "Drawer",
    category: "overlays",
    kind: "ui",
    description:
      "Panel deslizante con swipe. Cada hoja de producto compone Drawer, SheetHeader, SheetBody y su pie; los selectores se abren como drawers anidados.",
    whenToUse:
      "Toda hoja de producto: edición, selección o aviso, siempre por ruta. La cabecera y el cuerpo viven en SheetHeader y SheetBody.",
    whenNotToUse:
      "Una confirmación: AlertDialog. Una vista que merece ruta propia: pantalla.",
    importPath: "@/src/shared/components/ui/drawer",
    snippet: `import { Drawer, DrawerContent, DrawerFooter } from "@/src/shared/components/ui/drawer"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"

const sheet = useSheetParam(FINANCE_SHEET_KEYS.category)

<Drawer open={sheet.open} onOpenChange={(next) => sheet.setOpen(next)}>
  <DrawerContent>
    <SheetHeader title="Editar comercio" description="Los cambios se guardan al confirmar." />
    <SheetBody>{children}</SheetBody>
    <DrawerFooter className={SHEET_FOOTER_CLASS}>
      <Button type="button" variant="outline" className="flex-1" onClick={() => sheet.setOpen(false)}>
        <XIcon aria-hidden="true" />
        Cancelar
      </Button>
      <Button type="button" className="flex-1" onClick={onSave}>
        <SaveIcon aria-hidden="true" />
        Guardar
      </Button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`,
    subcomponents: [
      "DrawerTrigger",
      "DrawerContent",
      "DrawerHeader",
      "DrawerTitle",
      "DrawerDescription",
      "DrawerFooter",
      "DrawerClose",
      "DrawerSwipeHandle",
    ],
    anatomy: [
      {
        name: "Drawer",
        children: [
          {
            name: "DrawerContent",
            children: [
              { name: "SheetHeader" },
              { name: "SheetBody" },
              { name: "DrawerFooter" },
            ],
          },
        ],
      },
    ],
    variants: [
      { name: "swipeDirection", values: "down, up, left, right" },
      { name: "modal", values: "true, false" },
      { name: "anidado", values: "un drawer sobre otro" },
      { name: "showSwipeHandle / snapPoints", values: "opcionales" },
    ],
    props: [
      {
        name: "open / onOpenChange",
        type: "boolean / (open: boolean) => void",
        description: "Estado controlado del panel.",
      },
      {
        name: "swipeDirection",
        type: '"down" | "up" | "left" | "right"',
        description:
          "Lado del que entra y gesto que lo cierra. Por defecto, derecha en escritorio y abajo en móvil.",
      },
      {
        name: "modal",
        type: 'boolean | "trap-focus"',
        description: "Con false, la página sigue interactiva detrás del panel.",
      },
      {
        name: "snapPoints",
        type: "(number | string)[]",
        description:
          "Alturas donde se detiene el panel: fracciones de 0 a 1 o medidas en px/rem.",
      },
      {
        name: "showSwipeHandle",
        type: "boolean",
        description:
          "Muestra el tirador que permite arrastrar entre puntos de anclaje.",
      },
      {
        name: "composición de producto",
        type: "SheetHeader + SheetBody + DrawerFooter",
        description:
          "La cabecera, el cuerpo desplazable y el pie que repite cada hoja. Un selector dentro de otra hoja se monta dentro de su Drawer y se apila como drawer anidado.",
      },
    ],
  },
  {
    id: "popover",
    name: "Popover",
    category: "overlays",
    kind: "ui",
    description: "Panel flotante anclado a un control.",
    whenToUse:
      "Un ajuste puntual, una ayuda o un contenido corto junto a su disparador.",
    whenNotToUse:
      "Un formulario de edición: una hoja con Drawer. Un menú de acciones: DropdownMenu.",
    importPath: "@/src/shared/components/ui/popover",
    snippet: `import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/src/shared/components/ui/popover"

<Popover>
  <PopoverTrigger render={<Button variant="outline" />}>Ajustes</PopoverTrigger>
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>Densidad</PopoverTitle>
      <PopoverDescription>Se aplica solo a esta vista.</PopoverDescription>
    </PopoverHeader>
  </PopoverContent>
</Popover>`,
    subcomponents: [
      "PopoverTrigger",
      "PopoverContent",
      "PopoverHeader",
      "PopoverTitle",
      "PopoverDescription",
      "PopoverPopup",
      "PopoverPortal",
      "PopoverPositioner",
    ],
    anatomy: [
      {
        name: "Popover",
        children: [
          { name: "PopoverTrigger" },
          { name: "PopoverContent", children: [{ name: "PopoverHeader" }] },
        ],
      },
    ],
    variants: [
      {
        name: "side / align",
        values: "top, bottom, left, right; start, center, end",
      },
    ],
    props: [
      {
        name: "open / onOpenChange",
        type: "boolean / (open: boolean) => void",
        description: "Estado del panel.",
      },
    ],
  },
  {
    id: "dropdown-menu",
    name: "DropdownMenu",
    category: "overlays",
    kind: "ui",
    description:
      "Menú de acciones anclado a un botón, con grupos, atajos y submenús.",
    whenToUse:
      "Las acciones secundarias de una fila o un encabezado, detrás de un botón de más.",
    whenNotToUse:
      "Un formulario: una hoja con Drawer. Una confirmación: AlertDialog.",
    importPath: "@/src/shared/components/ui/dropdown-menu",
    snippet: `import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="outline" />}>Más</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Editar</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    subcomponents: [
      "DropdownMenuTrigger",
      "DropdownMenuContent",
      "DropdownMenuGroup",
      "DropdownMenuLabel",
      "DropdownMenuItem",
      "DropdownMenuCheckboxItem",
      "DropdownMenuRadioGroup",
      "DropdownMenuRadioItem",
      "DropdownMenuSeparator",
      "DropdownMenuShortcut",
      "DropdownMenuSub",
    ],
    anatomy: [
      {
        name: "DropdownMenu",
        children: [
          { name: "DropdownMenuTrigger" },
          {
            name: "DropdownMenuContent",
            children: [
              {
                name: "DropdownMenuGroup",
                children: [{ name: "DropdownMenuItem" }],
              },
            ],
          },
        ],
      },
    ],
    variants: [
      { name: "variant (Item)", values: "default, destructive" },
      { name: "estados", values: "open, closed, checked, disabled" },
    ],
    props: [
      {
        name: "open / onOpenChange",
        type: "boolean / (open: boolean) => void",
        description: "Estado del menú.",
      },
    ],
  },
  {
    id: "command",
    name: "Command",
    category: "overlays",
    kind: "ui",
    description: "Paleta de búsqueda con grupos, atajos y estado vacío.",
    whenToUse:
      "Una búsqueda de acciones o de registros con teclado, normalmente dentro de un Dialog.",
    whenNotToUse:
      "Una lista de navegación normal: el sidebar. Una selección de catálogo: Combobox.",
    importPath: "@/src/shared/components/ui/command",
    snippet: `import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/shared/components/ui/command"

<Command>
  <CommandInput placeholder="Buscar una acción" />
  <CommandList>
    <CommandEmpty>Sin resultados</CommandEmpty>
    <CommandGroup heading="Ir a">
      <CommandItem>Inicio</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`,
    subcomponents: [
      "CommandInput",
      "CommandList",
      "CommandEmpty",
      "CommandGroup",
      "CommandItem",
      "CommandShortcut",
      "CommandSeparator",
      "CommandDialog",
    ],
    anatomy: [
      {
        name: "Command",
        children: [
          { name: "CommandInput" },
          {
            name: "CommandList",
            children: [
              { name: "CommandEmpty" },
              { name: "CommandGroup", children: [{ name: "CommandItem" }] },
            ],
          },
        ],
      },
    ],
    variants: [
      {
        name: "CommandDialog",
        values: "paleta modal con título accesible",
      },
    ],
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "Composición de input, lista, grupos e ítems.",
      },
    ],
  },
  {
    id: "tooltip",
    name: "Tooltip",
    category: "overlays",
    kind: "ui",
    description: "Etiqueta flotante al pasar el puntero o enfocar un control.",
    whenToUse: "El nombre de un botón de solo icono o una ayuda breve.",
    whenNotToUse: "Contenido que se toca o un formulario: Popover.",
    importPath: "@/src/shared/components/ui/tooltip",
    snippet: `import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/shared/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button size="icon" />}>
      <PencilIcon />
    </TooltipTrigger>
    <TooltipContent>Editar</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    subcomponents: ["TooltipTrigger", "TooltipContent", "TooltipProvider"],
    anatomy: [
      {
        name: "TooltipProvider",
        children: [
          {
            name: "Tooltip",
            children: [{ name: "TooltipTrigger" }, { name: "TooltipContent" }],
          },
        ],
      },
    ],
    variants: [
      {
        name: "side / align",
        values: "top, bottom, left, right; start, center, end",
      },
    ],
    props: [
      {
        name: "delay (Provider)",
        type: "number",
        description: "Retardo antes de mostrar el tooltip.",
      },
    ],
  },
  {
    id: "sidebar",
    name: "Sidebar",
    category: "overlays",
    kind: "ui",
    description:
      "Navegación lateral con grupos, menús, rails y su versión móvil en Drawer.",
    whenToUse: "El chrome de navegación del shell autenticado.",
    whenNotToUse:
      "Una lista de acciones dentro de una card: DropdownMenu o una lista de Item.",
    importPath: "@/src/shared/components/ui/sidebar",
    snippet: `import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/src/shared/components/ui/sidebar"

<SidebarProvider>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton isActive><HomeIcon /><span>Inicio</span></SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarProvider>`,
    subcomponents: [
      "SidebarProvider",
      "Sidebar",
      "SidebarHeader",
      "SidebarContent",
      "SidebarFooter",
      "SidebarGroup",
      "SidebarGroupLabel",
      "SidebarMenu",
      "SidebarMenuItem",
      "SidebarMenuButton",
      "SidebarMenuAction",
      "SidebarMenuBadge",
      "SidebarMenuSkeleton",
      "SidebarMenuSub",
      "SidebarTrigger",
      "SidebarRail",
      "SidebarInset",
      "SidebarSeparator",
    ],
    anatomy: [
      {
        name: "SidebarProvider",
        children: [
          {
            name: "Sidebar",
            children: [
              { name: "SidebarHeader" },
              {
                name: "SidebarContent",
                children: [
                  { name: "SidebarGroup", children: [{ name: "SidebarMenu" }] },
                ],
              },
            ],
          },
        ],
      },
    ],
    variants: [
      { name: "collapsible", values: "offcanvas, icon, none" },
      { name: "variant", values: "sidebar, floating, inset" },
      { name: "mobile", values: "Drawer lateral" },
      { name: "variant (MenuButton)", values: "default, outline" },
      { name: "size (MenuButton)", values: "default, sm, lg" },
    ],
    props: [
      {
        name: "collapsible",
        type: '"offcanvas" | "icon" | "none"',
        description: "Cómo se repliega en escritorio.",
      },
      {
        name: "variant",
        type: '"sidebar" | "floating" | "inset"',
        description: "Aspecto del panel.",
      },
      {
        name: "isActive (MenuButton)",
        type: "boolean",
        description: "Marca la ruta activa.",
      },
      {
        name: "variant (SidebarMenuButton)",
        type: '"default" | "outline"',
        description: "Aspecto del botón de cada entrada del menú.",
      },
      {
        name: "size (SidebarMenuButton)",
        type: '"default" | "sm" | "lg"',
        description: "Alto del botón de cada entrada del menú.",
      },
    ],
  },
]
