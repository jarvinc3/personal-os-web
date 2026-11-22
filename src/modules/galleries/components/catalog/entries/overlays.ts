import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const overlaysDocs: readonly GalleryComponentMeta[] = [
  {
    id: "bottom-sheet",
    name: "BottomSheet",
    category: "overlays",
    kind: "domain",
    description:
      "Hoja de edición, flotante para un evento o ancha con dos columnas, siempre por ruta.",
    whenToUse:
      "Edición o contenido secundario en cualquier módulo, con su URL y su cierre por Atrás.",
    whenNotToUse:
      "Una confirmación: ConfirmDialog. Una vista que merece ruta propia: pantalla.",
    importPath: "@/src/shared/components/sheets/bottom-sheet",
    snippet: `import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"

const sheet = useSheetParam(FINANCE_SHEET_KEYS.category)

<BottomSheet
  open={sheet.open}
  onOpenChange={sheet.setOpen}
  title="Editar comercio"
  actions={{ submit: <Button>Guardar</Button> }}
>
  {children}
</BottomSheet>`,
    subcomponents: [],
    anatomy:
      "<BottomSheet open onOpenChange title description actions>{children}</BottomSheet>",
    variants: [
      { name: "variant", values: "default, floating" },
      { name: "size", values: "default, wide" },
      { name: "states", values: "open, pending, closed" },
    ],
    props: [
      {
        name: "open / onOpenChange",
        type: "boolean / (open: boolean) => void",
        description: "Estado que vive en la URL con useSheetParam.",
      },
      {
        name: "actions",
        type: "{ close?, submit?, delete? }",
        description: "Acciones del pie de la hoja.",
      },
      {
        name: "pending",
        type: "boolean",
        description: "Deshabilita las acciones y muestra el pending.",
      },
      {
        name: "variant / size",
        type: "BottomSheetVariant / BottomSheetSize",
        description: "Evento flotante o panel ancho.",
      },
    ],
  },
  {
    id: "confirm-dialog",
    name: "ConfirmDialog",
    category: "overlays",
    kind: "domain",
    description:
      "Confirmación de una acción destructiva o difícil de deshacer, con su tono.",
    whenToUse: "Antes de borrar, vaciar, reemplazar o recalcular datos.",
    whenNotToUse:
      "Navegación, abrir un sheet o un alta reversible. Un AlertDialog simple puede cubrir el caso.",
    importPath: "@/src/shared/components/feedback/confirm-dialog",
    snippet: `import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="¿Eliminar el movimiento?"
  description="Se quitará de la lista y del saldo de la cuenta."
  confirmLabel="Eliminar"
  confirmIcon={Trash2Icon}
  tone="danger"
  onConfirm={onConfirm}
/>`,
    subcomponents: [],
    anatomy:
      "<ConfirmDialog open onOpenChange title description confirmLabel confirmIcon />",
    variants: [
      { name: "tone", values: "default, danger" },
      { name: "states", values: "normal, pending, disabled" },
      { name: "wide", values: "false, true para un diálogo con formulario" },
    ],
    props: [
      {
        name: "title / description",
        type: "ReactNode",
        description: "Pregunta y consecuencia de la acción.",
      },
      {
        name: "confirmLabel / confirmIcon",
        type: "ReactNode / LucideIcon",
        description: "Verbo real de la acción y su icono.",
      },
      {
        name: "pending",
        type: "boolean",
        description: "Deshabilita ambos botones mientras corre la acción.",
      },
    ],
  },
  {
    id: "alert-dialog",
    name: "AlertDialog",
    category: "overlays",
    kind: "ui",
    description:
      "Diálogo modal de confirmación con acción y cancelar, sin ruta.",
    whenToUse:
      "Una confirmación puntual armada a mano, con su título y su consecuencia.",
    whenNotToUse:
      "Una confirmación de Finanzas: ConfirmDialog ya reúne el patrón. Una edición: BottomSheet.",
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

<AlertDialog>
  <AlertDialogTrigger render={<Button variant="destructive" />}>
    Eliminar
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>¿Eliminar el movimiento?</AlertDialogTitle>
      <AlertDialogDescription>No se puede deshacer.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction variant="destructive">Eliminar</AlertDialogAction>
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
    anatomy:
      "<AlertDialog><AlertDialogTrigger /><AlertDialogContent><AlertDialogHeader /><AlertDialogFooter /></AlertDialogContent></AlertDialog>",
    variants: [
      { name: "size (Content)", values: "default, sm" },
      { name: "variant (Action)", values: "default, destructive, outline" },
    ],
    props: [
      {
        name: "open / onOpenChange",
        type: "boolean / (open: boolean) => void",
        description: "Estado del diálogo; Esc y Cancelar cierran.",
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
      "Una edición de producto: BottomSheet por ruta. Una confirmación: AlertDialog.",
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
    anatomy:
      "<Dialog><DialogTrigger /><DialogContent><DialogHeader /><DialogFooter /></DialogContent></Dialog>",
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
      "Panel deslizante primitivo, con swipe para cerrar. Es la base de BottomSheet y del sidebar móvil.",
    whenToUse: "El primitivo que compone BottomSheet o el sidebar móvil.",
    whenNotToUse:
      "Una edición de producto: BottomSheet, que ya envuelve Drawer. La demo abre por ruta.",
    importPath: "@/src/shared/components/ui/drawer",
    snippet: `import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/src/shared/components/ui/drawer"

<Drawer open={open} onOpenChange={setOpen} swipeDirection="down">
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Título</DrawerTitle>
      <DrawerDescription>Descripción</DrawerDescription>
    </DrawerHeader>
    {children}
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
    anatomy:
      "<Drawer><DrawerContent><DrawerHeader /><DrawerFooter /></DrawerContent></Drawer>",
    variants: [
      { name: "swipeDirection", values: "down, up, left, right" },
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
        description: "Lado del que entra y gesto que lo cierra.",
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
      "Un formulario de edición: BottomSheet. Un menú de acciones: DropdownMenu.",
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
    anatomy:
      "<Popover><PopoverTrigger /><PopoverContent><PopoverHeader /></PopoverContent></Popover>",
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
    whenNotToUse: "Un formulario: BottomSheet. Una confirmación: AlertDialog.",
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
    anatomy:
      "<DropdownMenu><DropdownMenuTrigger /><DropdownMenuContent><DropdownMenuGroup><DropdownMenuItem /></DropdownMenuGroup></DropdownMenuContent></DropdownMenu>",
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
    anatomy:
      "<Command><CommandInput /><CommandList><CommandEmpty /><CommandGroup><CommandItem /></CommandGroup></CommandList></Command>",
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
    anatomy:
      "<TooltipProvider><Tooltip><TooltipTrigger /><TooltipContent /></Tooltip></TooltipProvider>",
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
    anatomy:
      "<SidebarProvider><Sidebar><SidebarHeader /><SidebarContent><SidebarGroup><SidebarMenu /></SidebarGroup></SidebarContent></Sidebar></SidebarProvider>",
    variants: [
      { name: "collapsible", values: "offcanvas, icon, none" },
      { name: "variant", values: "sidebar, floating, inset" },
      { name: "mobile", values: "Drawer lateral" },
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
    ],
  },
]
