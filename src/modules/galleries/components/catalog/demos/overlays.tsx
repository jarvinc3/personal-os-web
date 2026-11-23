import { useEffect, useState } from "react"
import {
  BellIcon,
  CopyIcon,
  EllipsisVerticalIcon,
  FileTextIcon,
  HomeIcon,
  LandmarkIcon,
  PanelBottomIcon,
  PencilIcon,
  SaveIcon,
  SettingsIcon,
  StoreIcon,
  Trash2Icon,
  WalletIcon,
} from "lucide-react"

import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import { OverlayFrame } from "@/src/modules/galleries/components/overlay-frame"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { Button } from "@/src/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/shared/components/ui/alert-dialog"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/src/shared/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/shared/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/src/shared/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/src/shared/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/src/shared/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/shared/components/ui/tooltip"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

const SHEET_PARAM = "ejemplo"
const EDIT_SHEET_ID = "editar"
const FLOATING_SHEET_ID = "flotante"
const WIDE_SHEET_ID = "ancha"
const DRAWER_SHEET_ID = "drawer"

function BottomSheetDemo() {
  const { open, sheetId, setOpen } = useSheetParam(SHEET_PARAM)
  const [name, setName] = useState("Comercio Ejemplo")

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => setOpen(true, EDIT_SHEET_ID)}>
        <StoreIcon />
        Abrir hoja de edición
      </Button>
      <Button
        variant="outline"
        onClick={() => setOpen(true, FLOATING_SHEET_ID)}
      >
        <BellIcon />
        Abrir hoja flotante
      </Button>
      <Button variant="outline" onClick={() => setOpen(true, WIDE_SHEET_ID)}>
        <FileTextIcon />
        Abrir panel ancho
      </Button>

      <BottomSheet
        open={open && sheetId === EDIT_SHEET_ID}
        onOpenChange={setOpen}
        title="Editar comercio"
        description="Los cambios se guardan al confirmar."
        actions={{
          submit: (
            <Button onClick={() => simulatedTap("Guardar comercio")}>
              <SaveIcon />
              Guardar
            </Button>
          ),
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Nombre</span>
          <input
            className="h-10 rounded-xl border border-border bg-card px-3"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
      </BottomSheet>

      <BottomSheet
        open={open && sheetId === WIDE_SHEET_ID}
        onOpenChange={setOpen}
        size="wide"
        title="Panel ancho"
        description="Vista previa a la izquierda y formulario a la derecha desde md."
        actions={{
          submit: (
            <Button onClick={() => simulatedTap("Guardar panel ancho")}>
              <SaveIcon />
              Guardar
            </Button>
          ),
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Vista previa del registro.
          </p>
          <p className="rounded-lg border border-border p-3 text-sm">
            Formulario de ejemplo.
          </p>
        </div>
      </BottomSheet>

      <BottomSheet
        variant="floating"
        open={open && sheetId === FLOATING_SHEET_ID}
        onOpenChange={setOpen}
        title="Sincronización completada"
        description="Se importaron 12 movimientos del correo."
        actions={{
          submit: (
            <Button onClick={() => setOpen(false)}>
              <BellIcon />
              Entendido
            </Button>
          ),
        }}
      >
        <p className="text-sm text-muted-foreground">
          Este es el aviso de un evento: la hoja baja como una card y no cubre
          toda la pantalla.
        </p>
      </BottomSheet>
    </div>
  )
}

function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        <Trash2Icon />
        Abrir confirmación
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        icon={Trash2Icon}
        title="¿Eliminar el movimiento?"
        description="Se quitará de la lista y del saldo de la cuenta."
        confirmLabel="Eliminar"
        confirmIcon={Trash2Icon}
        onConfirm={() => simulatedTap("Eliminar movimiento")}
      />
    </>
  )
}

function DrawerDemo() {
  const { open, sheetId, setOpen } = useSheetParam(SHEET_PARAM)
  const drawerOpen = open && sheetId === DRAWER_SHEET_ID

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true, DRAWER_SHEET_ID)}>
        <PanelBottomIcon />
        Abrir drawer
      </Button>
      <Drawer
        open={drawerOpen}
        onOpenChange={(next) => setOpen(next)}
        swipeDirection="down"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer de ejemplo</DrawerTitle>
            <DrawerDescription>
              Se abre por la URL; Atrás lo cierra.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 text-sm text-muted-foreground">
            El contenido del panel vive aquí. En producto se compone con
            BottomSheet.
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline" />}>
              Cerrar
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export const overlaysDemos: GalleryDemoMap = {
  "bottom-sheet": [
    {
      label: "Edición, flotante y panel ancho",
      code: `
const { open, sheetId, setOpen } = useSheetParam("ejemplo")
const [name, setName] = useState("Comercio Ejemplo")

<div className="flex flex-wrap gap-2">
  <Button onClick={() => setOpen(true, "editar-comercio")}>
    <StoreIcon />
    Abrir hoja de edición
  </Button>
  <Button variant="outline" onClick={() => setOpen(true, "aviso-flotante")}>
    <BellIcon />
    Abrir hoja flotante
  </Button>
  <Button variant="outline" onClick={() => setOpen(true, "panel-ancho")}>
    <FileTextIcon />
    Abrir panel ancho
  </Button>

  <BottomSheet
    open={open && sheetId === "editar-comercio"}
    onOpenChange={setOpen}
    title="Editar comercio"
    description="Los cambios se guardan al confirmar."
    actions={{ submit: <Button onClick={() => simulatedTap("Guardar comercio")}><SaveIcon />Guardar</Button> }}
  >
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">Nombre</span>
      <input
        className="h-10 rounded-xl border border-border bg-card px-3"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
    </label>
  </BottomSheet>

  <BottomSheet
    open={open && sheetId === "panel-ancho"}
    onOpenChange={setOpen}
    size="wide"
    title="Panel ancho"
    description="Vista previa a la izquierda y formulario a la derecha desde md."
    actions={{ submit: <Button onClick={() => simulatedTap("Guardar panel ancho")}><SaveIcon />Guardar</Button> }}
  >
    <div className="grid gap-4 md:grid-cols-2">
      <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        Vista previa del registro.
      </p>
      <p className="rounded-lg border border-border p-3 text-sm">
        Formulario de ejemplo.
      </p>
    </div>
  </BottomSheet>

  <BottomSheet
    variant="floating"
    open={open && sheetId === "aviso-flotante"}
    onOpenChange={setOpen}
    title="Sincronización completada"
    description="Se importaron 12 movimientos del correo."
    actions={{ submit: <Button onClick={() => setOpen(false)}><BellIcon />Entendido</Button> }}
  >
    <p className="text-sm text-muted-foreground">
      Este es el aviso de un evento: la hoja baja como una card y no cubre toda
      la pantalla.
    </p>
  </BottomSheet>
</div>
`,
      node: <BottomSheetDemo />,
    },
  ],
  "confirm-dialog": [
    {
      label: "Confirmación destructiva",
      code: `
const [open, setOpen] = useState(false)

<>
  <Button variant="destructive" onClick={() => setOpen(true)}>
    <Trash2Icon />
    Abrir confirmación
  </Button>
  <ConfirmDialog
    open={open}
    onOpenChange={setOpen}
    tone="danger"
    icon={Trash2Icon}
    title="¿Eliminar el movimiento?"
    description="Se quitará de la lista y del saldo de la cuenta."
    confirmLabel="Eliminar"
    confirmIcon={Trash2Icon}
    onConfirm={() => simulatedTap("Eliminar movimiento")}
  />
</>
`,
      node: <ConfirmDialogDemo />,
    },
  ],
  "alert-dialog": [
    {
      label: "Confirmación destructiva",
      code: `
<AlertDialog>
  <AlertDialogTrigger render={<Button variant="destructive" />}>
    <Trash2Icon />
    Eliminar
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogMedia>
        <Trash2Icon />
      </AlertDialogMedia>
      <AlertDialogTitle>¿Eliminar el movimiento?</AlertDialogTitle>
      <AlertDialogDescription>
        Se quitará de la lista y del saldo de la cuenta.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        variant="destructive"
        onClick={() => simulatedTap("Eliminar")}
      >
        Eliminar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
`,
      node: (
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            <Trash2Icon />
            Eliminar
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>¿Eliminar el movimiento?</AlertDialogTitle>
              <AlertDialogDescription>
                Se quitará de la lista y del saldo de la cuenta.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => simulatedTap("Eliminar")}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ],
  dialog: [
    {
      label: "Diálogo con formulario",
      code: `
<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>
    <PencilIcon />
    Renombrar
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Renombrar etiqueta</DialogTitle>
      <DialogDescription>
        El nombre cambia en todas partes.
      </DialogDescription>
    </DialogHeader>
    <p className="text-sm text-muted-foreground">
      Un formulario corto puede vivir aquí; una edición larga va en una
      hoja por ruta.
    </p>
    <DialogFooter showCloseButton>
      <Button onClick={() => simulatedTap("Guardar")}>
        <SaveIcon />
        Guardar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
`,
      node: (
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            <PencilIcon />
            Renombrar
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renombrar etiqueta</DialogTitle>
              <DialogDescription>
                El nombre cambia en todas partes.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Un formulario corto puede vivir aquí; una edición larga va en una
              hoja por ruta.
            </p>
            <DialogFooter showCloseButton>
              <Button onClick={() => simulatedTap("Guardar")}>
                <SaveIcon />
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ),
    },
  ],
  drawer: [
    {
      label: "Drawer abierto por ruta",
      code: `
const { open, sheetId, setOpen } = useSheetParam("ejemplo")
const drawerOpen = open && sheetId === "drawer"

<>
  <Button variant="outline" onClick={() => setOpen(true, "drawer")}>
    <PanelBottomIcon />
    Abrir drawer
  </Button>
  <Drawer
    open={drawerOpen}
    onOpenChange={(next) => setOpen(next)}
    swipeDirection="down"
  >
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Drawer de ejemplo</DrawerTitle>
        <DrawerDescription>
          Se abre por la URL; Atrás lo cierra.
        </DrawerDescription>
      </DrawerHeader>
      <div className="px-4 pb-4 text-sm text-muted-foreground">
        El contenido del panel vive aquí. En producto se compone con BottomSheet.
      </div>
      <DrawerFooter>
        <DrawerClose render={<Button variant="outline" />}>
          Cerrar
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</>
`,
      node: <DrawerDemo />,
    },
  ],
  popover: [
    {
      label: "Panel de un ajuste",
      code: `
<Popover>
  <PopoverTrigger render={<Button variant="outline" />}>
    <SettingsIcon />
    Ajustes rápidos
  </PopoverTrigger>
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>Densidad de la lista</PopoverTitle>
      <PopoverDescription>
        Se aplica solo a esta vista.
      </PopoverDescription>
    </PopoverHeader>
    <p className="text-sm text-muted-foreground">
      Un ajuste puntual cabe aquí.
    </p>
  </PopoverContent>
</Popover>
`,
      node: (
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            <SettingsIcon />
            Ajustes rápidos
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Densidad de la lista</PopoverTitle>
              <PopoverDescription>
                Se aplica solo a esta vista.
              </PopoverDescription>
            </PopoverHeader>
            <p className="text-sm text-muted-foreground">
              Un ajuste puntual cabe aquí.
            </p>
          </PopoverContent>
        </Popover>
      ),
    },
  ],
  "dropdown-menu": [
    {
      label: "Menú de acciones",
      code: `
<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="outline" />}>
    <EllipsisVerticalIcon />
    Más
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
    <DropdownMenuGroup>
      <DropdownMenuItem onClick={() => simulatedTap("Editar")}>
        <PencilIcon />
        Editar
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => simulatedTap("Duplicar")}>
        <CopyIcon />
        Duplicar
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      variant="destructive"
      onClick={() => simulatedTap("Eliminar")}
    >
      <Trash2Icon />
      Eliminar
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
`,
      node: (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <EllipsisVerticalIcon />
            Más
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => simulatedTap("Editar")}>
                <PencilIcon />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => simulatedTap("Duplicar")}>
                <CopyIcon />
                Duplicar
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => simulatedTap("Eliminar")}
            >
              <Trash2Icon />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ],
  command: [
    {
      label: "Paleta con grupos y vacío",
      code: `
<div className="w-full rounded-2xl border border-border">
  <Command>
    <CommandInput
      placeholder="Buscar una acción"
      aria-label="Buscar una acción"
    />
    <CommandList>
      <CommandEmpty>Sin resultados</CommandEmpty>
      <CommandGroup heading="Ir a">
        <CommandItem onSelect={() => simulatedTap("Inicio")}>
          <HomeIcon />
          Inicio
          <CommandShortcut>G I</CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={() => simulatedTap("Finanzas")}>
          <LandmarkIcon />
          Finanzas
          <CommandShortcut>G F</CommandShortcut>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Acciones">
        <CommandItem onSelect={() => simulatedTap("Nueva cuenta")}>
          <WalletIcon />
          Nueva cuenta
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
</div>
`,
      node: (
        <div className="w-full rounded-2xl border border-border">
          <Command>
            <CommandInput
              placeholder="Buscar una acción"
              aria-label="Buscar una acción"
            />
            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>
              <CommandGroup heading="Ir a">
                <CommandItem onSelect={() => simulatedTap("Inicio")}>
                  <HomeIcon />
                  Inicio
                  <CommandShortcut>G I</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => simulatedTap("Finanzas")}>
                  <LandmarkIcon />
                  Finanzas
                  <CommandShortcut>G F</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Acciones">
                <CommandItem onSelect={() => simulatedTap("Nueva cuenta")}>
                  <WalletIcon />
                  Nueva cuenta
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      ),
    },
  ],
  tooltip: [
    {
      label: "Sobre un botón de icono",
      code: `
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline" size="icon" />}>
      <PencilIcon />
      <span className="sr-only">Editar</span>
    </TooltipTrigger>
    <TooltipContent>Editar</TooltipContent>
  </Tooltip>
</TooltipProvider>
`,
      node: (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" size="icon" />}>
              <PencilIcon />
              <span className="sr-only">Editar</span>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ],
  sidebar: [
    {
      label: "Menú con un ítem activo",
      code: `
<SidebarProvider className="min-h-0 w-full">
  <div className="flex w-full max-w-64 flex-col gap-2 rounded-2xl border border-border bg-sidebar p-2">
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton isActive>
          <HomeIcon />
          <span>Inicio</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => simulatedTap("Finanzas")}>
          <LandmarkIcon />
          <span>Finanzas</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => simulatedTap("Ajustes")}>
          <SettingsIcon />
          <span>Ajustes</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </div>
</SidebarProvider>
`,
      node: (
        <SidebarProvider className="min-h-0 w-full">
          <div className="flex w-full max-w-64 flex-col gap-2 rounded-2xl border border-border bg-sidebar p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <HomeIcon />
                  <span>Inicio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => simulatedTap("Finanzas")}>
                  <LandmarkIcon />
                  <span>Finanzas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => simulatedTap("Ajustes")}>
                  <SettingsIcon />
                  <span>Ajustes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarProvider>
      ),
    },
  ],
}

type SheetExampleProps = {
  variant?: "default" | "floating"
  size?: "default" | "wide"
  pending?: boolean
  title?: string
}

function SheetExample({
  variant = "default",
  size = "default",
  pending = false,
  title = "Editar comercio",
}: SheetExampleProps) {
  return (
    <OverlayFrame>
      <BottomSheet
        open
        variant={variant}
        size={size}
        pending={pending}
        onOpenChange={() => {}}
        title={title}
        description="Los cambios se guardan al confirmar."
        actions={{
          submit: (
            <Button>
              <SaveIcon />
              Guardar
            </Button>
          ),
        }}
      >
        <p className="text-sm text-muted-foreground">
          El contenido de la hoja vive aquí.
        </p>
      </BottomSheet>
    </OverlayFrame>
  )
}

type ConfirmExampleProps = {
  tone?: "default" | "danger"
  pending?: boolean
  confirmDisabled?: boolean
  wide?: boolean
  title?: string
}

function ConfirmExample({
  tone = "default",
  pending = false,
  confirmDisabled = false,
  wide = false,
  title = "¿Eliminar el movimiento?",
}: ConfirmExampleProps) {
  return (
    <OverlayFrame>
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        tone={tone}
        icon={Trash2Icon}
        title={title}
        description="Se quitará de la lista y del saldo de la cuenta."
        confirmLabel="Eliminar"
        confirmIcon={Trash2Icon}
        onConfirm={() => {}}
        pending={pending}
        confirmDisabled={confirmDisabled}
        wide={wide}
      />
    </OverlayFrame>
  )
}

function DrawerExample({
  swipeDirection = "down",
  showSwipeHandle = false,
  snapPoints,
}: {
  swipeDirection?: "down" | "up" | "left" | "right"
  showSwipeHandle?: boolean
  snapPoints?: number[]
}) {
  return (
    <OverlayFrame>
      <Drawer
        open
        modal={false}
        swipeDirection={swipeDirection}
        showSwipeHandle={showSwipeHandle}
        snapPoints={snapPoints}
        onOpenChange={() => {}}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer de ejemplo</DrawerTitle>
            <DrawerDescription>
              Se abre hacia {swipeDirection}.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 text-sm text-muted-foreground">
            El contenido del panel vive aquí.
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline" />}>
              Cerrar
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </OverlayFrame>
  )
}

function MenuExample({
  destructive = false,
  checked = false,
  disabled = false,
}: {
  destructive?: boolean
  checked?: boolean
  disabled?: boolean
}) {
  return (
    <OverlayFrame className="h-64" confine={false}>
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          <EllipsisVerticalIcon />
          Más
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem>
              <PencilIcon />
              Editar
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem checked={checked}>
              Destacar
            </DropdownMenuCheckboxItem>
            <DropdownMenuItem variant={destructive ? "destructive" : "default"}>
              <Trash2Icon />
              Eliminar
            </DropdownMenuItem>
            <DropdownMenuItem disabled={disabled}>
              <CopyIcon />
              Duplicar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </OverlayFrame>
  )
}

function AlertExample({
  size = "default",
  actionVariant = "destructive",
}: {
  size?: "default" | "sm"
  actionVariant?: "default" | "destructive" | "outline"
}) {
  return (
    <OverlayFrame>
      <AlertDialog open onOpenChange={() => {}}>
        <AlertDialogContent size={size}>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Eliminar el movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará de la lista y del saldo de la cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant={actionVariant}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </OverlayFrame>
  )
}

function DialogExample({
  showCloseButton = true,
}: {
  showCloseButton?: boolean
}) {
  return (
    <OverlayFrame>
      <Dialog open onOpenChange={() => {}}>
        <DialogContent showCloseButton={showCloseButton}>
          <DialogHeader>
            <DialogTitle>Renombrar etiqueta</DialogTitle>
            <DialogDescription>
              El nombre cambia en todas partes.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Un formulario corto puede vivir aquí.
          </p>
          <DialogFooter>
            <Button>
              <SaveIcon />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </OverlayFrame>
  )
}

function PopoverExample({
  side,
  align,
}: {
  side: "top" | "bottom" | "left" | "right"
  align: "start" | "center" | "end"
}) {
  return (
    <OverlayFrame className="flex items-center justify-center" confine={false}>
      <Popover defaultOpen>
        <PopoverTrigger render={<Button variant="outline" />}>
          <SettingsIcon />
          Ajustes rápidos
        </PopoverTrigger>
        <PopoverContent side={side} align={align}>
          <PopoverHeader>
            <PopoverTitle>Densidad de la lista</PopoverTitle>
            <PopoverDescription>
              Se aplica solo a esta vista.
            </PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    </OverlayFrame>
  )
}

function TooltipExample({
  side,
}: {
  side: "top" | "bottom" | "left" | "right"
}) {
  return (
    <OverlayFrame className="flex items-center justify-center" confine={false}>
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger render={<Button variant="outline" size="icon" />}>
            <PencilIcon />
            <span className="sr-only">Editar</span>
          </TooltipTrigger>
          <TooltipContent side={side}>Editar</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </OverlayFrame>
  )
}

function SidebarMenuSample() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton isActive>
          <HomeIcon />
          <span>Inicio</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <LandmarkIcon />
          <span>Finanzas</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <SettingsIcon />
          <span>Ajustes</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function OpenMobileSidebar() {
  const { isMobile, setOpenMobile } = useSidebar()

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(true)
    }
  }, [isMobile, setOpenMobile])

  return null
}

function SidebarExample({
  collapsible = "offcanvas",
  variant = "floating",
  open = true,
}: {
  collapsible?: "offcanvas" | "icon" | "none"
  variant?: "sidebar" | "floating" | "inset"
  open?: boolean
}) {
  return (
    <OverlayFrame className="h-96">
      <SidebarProvider defaultOpen={open} className="h-full min-h-0">
        <OpenMobileSidebar />
        <Sidebar collapsible={collapsible} variant={variant}>
          <SidebarContent>
            <SidebarMenuSample />
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </OverlayFrame>
  )
}

export const overlaysVariantDemos: GalleryVariantDemoMap = {
  "bottom-sheet": {
    variant: [
      { label: "default", node: <SheetExample /> },
      {
        label: "floating",
        node: (
          <SheetExample variant="floating" title="Sincronización completada" />
        ),
      },
    ],
    size: [
      { label: "default", node: <SheetExample /> },
      { label: "wide", node: <SheetExample size="wide" title="Panel ancho" /> },
    ],
    states: [
      { label: "open", node: <SheetExample /> },
      { label: "pending", node: <SheetExample pending /> },
      {
        label: "closed",
        node: (
          <Button variant="outline">
            <StoreIcon />
            Abrir hoja de edición
          </Button>
        ),
      },
    ],
  },
  "confirm-dialog": {
    tone: [
      { label: "default", node: <ConfirmExample title="¿Cerrar el mes?" /> },
      { label: "danger", node: <ConfirmExample tone="danger" /> },
    ],
    states: [
      { label: "normal", node: <ConfirmExample /> },
      { label: "pending", node: <ConfirmExample pending /> },
      {
        label: "disabled",
        node: <ConfirmExample confirmDisabled />,
      },
    ],
    wide: [
      { label: "false", node: <ConfirmExample /> },
      {
        label: "true para un diálogo con formulario",
        node: <ConfirmExample wide />,
      },
    ],
  },
  "alert-dialog": {
    "size (Content)": [
      { label: "default", node: <AlertExample /> },
      { label: "sm", node: <AlertExample size="sm" /> },
    ],
    "variant (Action)": [
      { label: "default", node: <AlertExample actionVariant="default" /> },
      {
        label: "destructive",
        node: <AlertExample actionVariant="destructive" />,
      },
      { label: "outline", node: <AlertExample actionVariant="outline" /> },
    ],
  },
  dialog: {
    showCloseButton: [
      { label: "true", node: <DialogExample /> },
      { label: "false", node: <DialogExample showCloseButton={false} /> },
    ],
  },
  drawer: {
    swipeDirection: [
      { label: "down", node: <DrawerExample swipeDirection="down" /> },
      { label: "up", node: <DrawerExample swipeDirection="up" /> },
      { label: "left", node: <DrawerExample swipeDirection="left" /> },
      { label: "right", node: <DrawerExample swipeDirection="right" /> },
    ],
    "showSwipeHandle / snapPoints": [
      { label: "con tirador", node: <DrawerExample showSwipeHandle /> },
      {
        label: "con puntos de anclaje",
        node: <DrawerExample snapPoints={[0.5, 1]} />,
      },
    ],
  },
  popover: {
    "side / align": [
      { label: "top start", node: <PopoverExample side="top" align="start" /> },
      {
        label: "bottom end",
        node: <PopoverExample side="bottom" align="end" />,
      },
      {
        label: "left center",
        node: <PopoverExample side="left" align="center" />,
      },
      {
        label: "right center",
        node: <PopoverExample side="right" align="center" />,
      },
    ],
  },
  "dropdown-menu": {
    "variant (Item)": [
      { label: "default", node: <MenuExample /> },
      { label: "destructive", node: <MenuExample destructive /> },
    ],
    estados: [
      { label: "open", node: <MenuExample /> },
      {
        label: "closed",
        node: (
          <Button variant="outline">
            <EllipsisVerticalIcon />
            Más
          </Button>
        ),
      },
      { label: "checked", node: <MenuExample checked /> },
      { label: "disabled", node: <MenuExample disabled /> },
    ],
  },
  command: {
    CommandDialog: [
      {
        label: "paleta modal con título accesible",
        node: (
          <OverlayFrame>
            <CommandDialog open onOpenChange={() => {}}>
              <Command>
                <CommandInput
                  placeholder="Buscar una acción"
                  aria-label="Buscar una acción"
                />
                <CommandList>
                  <CommandEmpty>Sin resultados</CommandEmpty>
                  <CommandGroup heading="Ir a">
                    <CommandItem>
                      <HomeIcon />
                      Inicio
                    </CommandItem>
                    <CommandItem>
                      <LandmarkIcon />
                      Finanzas
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </CommandDialog>
          </OverlayFrame>
        ),
      },
    ],
  },
  sidebar: {
    collapsible: [
      {
        label: "offcanvas",
        node: <SidebarExample collapsible="offcanvas" open={false} />,
      },
      {
        label: "icon",
        node: <SidebarExample collapsible="icon" open={false} />,
      },
      {
        label: "none",
        node: <SidebarExample collapsible="none" open={false} />,
      },
    ],
    variant: [
      { label: "sidebar", node: <SidebarExample variant="sidebar" /> },
      { label: "floating", node: <SidebarExample variant="floating" /> },
      { label: "inset", node: <SidebarExample variant="inset" /> },
    ],
    mobile: [
      {
        label: "Drawer lateral",
        node: <SidebarExample collapsible="offcanvas" />,
      },
    ],
  },
  tooltip: {
    "side / align": [
      { label: "top", node: <TooltipExample side="top" /> },
      { label: "bottom", node: <TooltipExample side="bottom" /> },
      { label: "left", node: <TooltipExample side="left" /> },
      { label: "right", node: <TooltipExample side="right" /> },
    ],
  },
}
