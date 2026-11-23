import { useState } from "react"
import {
  BellIcon,
  CopyIcon,
  EllipsisVerticalIcon,
  FileTextIcon,
  HomeIcon,
  LandmarkIcon,
  LayersIcon,
  PanelBottomIcon,
  PanelLeftIcon,
  PencilIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  StoreIcon,
  Trash2Icon,
  WalletIcon,
  XIcon,
} from "lucide-react"

import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
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
  DrawerTrigger,
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
import { Spinner } from "@/src/shared/components/ui/spinner"
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
  SidebarTrigger,
  useSidebar,
} from "@/src/shared/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/shared/components/ui/tooltip"
import { useIsMobile } from "@/src/shared/hooks/use-mobile"
import { usePicker } from "@/src/shared/hooks/use-picker"
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

const NESTED_PICKER_NONE = "none"
const NESTED_PICKER_OPEN = "anidado"
type NestedPicker = typeof NESTED_PICKER_NONE | typeof NESTED_PICKER_OPEN

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

function DrawerDemo() {
  const { open, sheetId, setOpen } = useSheetParam(SHEET_PARAM)
  const drawerOpen = open && sheetId === DRAWER_SHEET_ID

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true, DRAWER_SHEET_ID)}>
        <PanelBottomIcon />
        Abrir drawer
      </Button>
      <Drawer open={drawerOpen} onOpenChange={(next) => setOpen(next)}>
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
    {
      label: "Confirmación de producto",
      code: `
<AlertDialog>
  <AlertDialogTrigger render={<Button variant="destructive" />}>
    <Trash2Icon />
    Abrir confirmación
  </AlertDialogTrigger>
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
        onClick={confirm}
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
</AlertDialog>
`,
      node: <ConfirmCompositionExample />,
    },
    {
      label: "Mientras la acción corre",
      code: `
<AlertDialogContent>
  <AlertDialogFooter>
    <AlertDialogCancel disabled>
      <XIcon className="size-4 shrink-0" aria-hidden="true" />
      Cancelar
    </AlertDialogCancel>
    <AlertDialogAction variant="destructive" disabled>
      <Spinner data-icon="inline-start" />
      Eliminando...
    </AlertDialogAction>
  </AlertDialogFooter>
</AlertDialogContent>
`,
      node: <ConfirmCompositionExample pending />,
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
    <DropdownMenuGroup>
      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
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
            <DropdownMenuGroup>
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
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
  id: string
  variant?: "default" | "floating"
  size?: "default" | "wide"
  pending?: boolean
  title?: string
}

function SheetExample({
  id,
  variant = "default",
  size = "default",
  pending = false,
  title = "Editar comercio",
}: SheetExampleProps) {
  const { open, sheetId, setOpen } = useSheetParam(SHEET_PARAM)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true, id)}>
        <PanelBottomIcon />
        Abrir hoja
      </Button>
      <BottomSheet
        open={open && sheetId === id}
        variant={variant}
        size={size}
        pending={pending}
        onOpenChange={(next) => setOpen(next)}
        title={title}
        description="Los cambios se guardan al confirmar."
        actions={{
          submit: (
            <Button onClick={() => setOpen(false)}>
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
    </>
  )
}

type DrawerExampleProps = {
  id: string
  swipeDirection?: "down" | "up" | "left" | "right"
  showSwipeHandle?: boolean
  snapPoints?: (number | string)[]
  modal?: boolean
  disablePointerDismissal?: boolean
}

function DrawerExample({
  id,
  swipeDirection,
  showSwipeHandle = false,
  snapPoints,
  modal = true,
  disablePointerDismissal = false,
}: DrawerExampleProps) {
  const { open, sheetId, setOpen } = useSheetParam(SHEET_PARAM)
  const directionDescription = swipeDirection
    ? `Se abre hacia ${swipeDirection}.`
    : "Se abre desde el borde que toca: derecha en escritorio y abajo en móvil."
  const description = modal
    ? directionDescription
    : "No bloquea la página: el fondo sigue interactivo."

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true, id)}>
        <PanelBottomIcon />
        Abrir drawer
      </Button>
      <Drawer
        open={open && sheetId === id}
        swipeDirection={swipeDirection}
        showSwipeHandle={showSwipeHandle}
        snapPoints={snapPoints}
        modal={modal}
        disablePointerDismissal={disablePointerDismissal}
        onOpenChange={(next) => setOpen(next)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer de ejemplo</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
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
    </>
  )
}

function NestedDrawerExample({ id }: { id: string }) {
  const { open, sheetId, setOpen } = useSheetParam(SHEET_PARAM)
  const { picker, openPicker, closeHandlerFor } =
    usePicker<NestedPicker>(NESTED_PICKER_NONE)
  const isMobile = useIsMobile()

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true, id)}>
        <PanelBottomIcon />
        Abrir drawer
      </Button>
      <Drawer
        open={open && sheetId === id}
        showSwipeHandle={isMobile}
        onOpenChange={(next) => setOpen(next)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer principal</DrawerTitle>
            <DrawerDescription>
              Abre otro drawer encima: el primero queda montado detrás.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 text-sm text-muted-foreground">
            Los drawers se apilan en el orden en que se abren.
          </div>
          <DrawerFooter>
            <Drawer
              open={picker === NESTED_PICKER_OPEN}
              onOpenChange={closeHandlerFor(NESTED_PICKER_OPEN)}
            >
              <DrawerTrigger
                render={<Button variant="outline" />}
                onClick={() => openPicker(NESTED_PICKER_OPEN)}
              >
                <LayersIcon />
                Abrir drawer anidado
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Drawer anidado</DrawerTitle>
                  <DrawerDescription>
                    Se cierra solo; el drawer principal sigue abierto.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  El panel de abajo asoma como una pila.
                </div>
                <DrawerFooter>
                  <DrawerClose render={<Button variant="outline" />}>
                    Cerrar
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            <DrawerClose render={<Button variant="outline" />}>
              Cerrar
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
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
    <DropdownMenu>
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
  )
}

function ConfirmCompositionExample({ pending = false }: { pending?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        <Trash2Icon />
        Abrir confirmación
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>¿Eliminar el movimiento?</AlertDialogTitle>
          <AlertDialogDescription>
            Se quitará de la lista y del saldo de la cuenta. No se puede
            deshacer.
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
            onClick={() => simulatedTap("Eliminar movimiento")}
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
    </AlertDialog>
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
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        <Trash2Icon />
        Eliminar
      </AlertDialogTrigger>
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
  )
}

function DialogExample({
  showCloseButton = true,
}: {
  showCloseButton?: boolean
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>
        <PencilIcon />
        Renombrar
      </DialogTrigger>
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
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        <SettingsIcon />
        Ajustes rápidos
      </PopoverTrigger>
      <PopoverContent side={side} align={align}>
        <PopoverHeader>
          <PopoverTitle>Densidad de la lista</PopoverTitle>
          <PopoverDescription>Se aplica solo a esta vista.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

function TooltipExample({
  side,
}: {
  side: "top" | "bottom" | "left" | "right"
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="icon" />}>
          <PencilIcon />
          <span className="sr-only">Editar</span>
        </TooltipTrigger>
        <TooltipContent side={side}>Editar</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

type SidebarMenuButtonVariant = "default" | "outline"
type SidebarMenuButtonSize = "default" | "sm" | "lg"

function SidebarMenuSample({
  buttonVariant,
  buttonSize,
}: {
  buttonVariant?: SidebarMenuButtonVariant
  buttonSize?: SidebarMenuButtonSize
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton variant={buttonVariant} size={buttonSize} isActive>
          <HomeIcon />
          <span>Inicio</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton variant={buttonVariant} size={buttonSize}>
          <LandmarkIcon />
          <span>Finanzas</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton variant={buttonVariant} size={buttonSize}>
          <SettingsIcon />
          <span>Ajustes</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function MobileSidebarTrigger() {
  const { isMobile, setOpenMobile } = useSidebar()

  if (!isMobile) {
    return (
      <p className="text-xs text-muted-foreground">
        El drawer lateral se abre en pantallas angostas.
      </p>
    )
  }

  return (
    <Button variant="outline" onClick={() => setOpenMobile(true)}>
      <PanelLeftIcon />
      Abrir menú lateral
    </Button>
  )
}

type SidebarExampleProps = {
  collapsible?: "offcanvas" | "icon" | "none"
  variant?: "sidebar" | "floating" | "inset"
  buttonVariant?: SidebarMenuButtonVariant
  buttonSize?: SidebarMenuButtonSize
  open?: boolean
  mobile?: boolean
}

function SidebarExample({
  collapsible = "offcanvas",
  variant = "floating",
  buttonVariant,
  buttonSize,
  open = true,
  mobile = false,
}: SidebarExampleProps) {
  return (
    <div className="gallery-sidebar-embed relative flex h-96 w-full max-w-sm overflow-hidden rounded-xl border border-border/70 bg-background">
      <SidebarProvider defaultOpen={open} className="h-full min-h-0 w-full">
        <div className={mobile ? "md:hidden" : undefined}>
          <Sidebar collapsible={collapsible} variant={variant}>
            <SidebarContent>
              <SidebarMenuSample
                buttonVariant={buttonVariant}
                buttonSize={buttonSize}
              />
            </SidebarContent>
          </Sidebar>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-border/70 px-2 py-1.5">
            <SidebarTrigger />
            <span className="text-xs text-muted-foreground">Vista</span>
          </div>
          <div className="flex-1 p-3 text-xs text-muted-foreground">
            {mobile ? (
              <MobileSidebarTrigger />
            ) : (
              <p>El contenido de la vista va aquí.</p>
            )}
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}

function CommandDialogExample() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <SearchIcon />
        Abrir paleta
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
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
    </>
  )
}

export const overlaysVariantDemos: GalleryVariantDemoMap = {
  "bottom-sheet": {
    variant: [
      { label: "default", node: <SheetExample id="hoja-default" /> },
      {
        label: "floating",
        node: (
          <SheetExample
            id="hoja-flotante"
            variant="floating"
            title="Sincronización completada"
          />
        ),
      },
    ],
    size: [
      { label: "default", node: <SheetExample id="hoja-tamano-default" /> },
      {
        label: "wide",
        node: <SheetExample id="hoja-ancha" size="wide" title="Panel ancho" />,
      },
    ],
    states: [
      { label: "open", node: <SheetExample id="hoja-abierta" /> },
      { label: "pending", node: <SheetExample id="hoja-pendiente" pending /> },
      { label: "closed", node: <SheetExample id="hoja-cerrada" /> },
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
    states: [
      { label: "normal", node: <ConfirmCompositionExample /> },
      { label: "pending", node: <ConfirmCompositionExample pending /> },
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
      {
        label: "down",
        node: <DrawerExample id="drawer-abajo" swipeDirection="down" />,
      },
      {
        label: "up",
        node: <DrawerExample id="drawer-arriba" swipeDirection="up" />,
      },
      {
        label: "left",
        node: <DrawerExample id="drawer-izquierda" swipeDirection="left" />,
      },
      {
        label: "right",
        node: <DrawerExample id="drawer-derecha" swipeDirection="right" />,
      },
    ],
    modal: [
      { label: "true", node: <DrawerExample id="drawer-modal" /> },
      {
        label: "false",
        node: (
          <DrawerExample
            id="drawer-sin-modal"
            modal={false}
            disablePointerDismissal
          />
        ),
      },
    ],
    anidado: [
      {
        label: "un drawer sobre otro",
        node: <NestedDrawerExample id="drawer-anidado" />,
      },
    ],
    "showSwipeHandle / snapPoints": [
      {
        label: "con tirador",
        node: <DrawerExample id="drawer-tirador" showSwipeHandle />,
      },
      {
        label: "con puntos de anclaje y tirador",
        node: (
          <DrawerExample
            id="drawer-anclaje"
            swipeDirection="down"
            snapPoints={[0.5, 1]}
            showSwipeHandle
          />
        ),
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
      { label: "closed", node: <MenuExample /> },
      { label: "checked", node: <MenuExample checked /> },
      { label: "disabled", node: <MenuExample disabled /> },
    ],
  },
  command: {
    CommandDialog: [
      {
        label: "paleta modal con título accesible",
        node: <CommandDialogExample />,
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
        node: <SidebarExample collapsible="offcanvas" mobile />,
      },
    ],
    "variant (MenuButton)": [
      { label: "default", node: <SidebarExample buttonVariant="default" /> },
      { label: "outline", node: <SidebarExample buttonVariant="outline" /> },
    ],
    "size (MenuButton)": [
      { label: "default", node: <SidebarExample buttonSize="default" /> },
      { label: "sm", node: <SidebarExample buttonSize="sm" /> },
      { label: "lg", node: <SidebarExample buttonSize="lg" /> },
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
