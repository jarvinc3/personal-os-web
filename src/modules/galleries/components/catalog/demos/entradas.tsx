import Image from "next/image"
import {
  BellIcon,
  FileTextIcon,
  SearchIcon,
  StoreIcon,
  XIcon,
} from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/src/shared/components/ui/attachment"
import { Checkbox } from "@/src/shared/components/ui/checkbox"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/src/shared/components/ui/combobox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldMedia,
} from "@/src/shared/components/ui/field"
import { Input } from "@/src/shared/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { Label } from "@/src/shared/components/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/src/shared/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Switch } from "@/src/shared/components/ui/switch"
import { Textarea } from "@/src/shared/components/ui/textarea"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

const DENSITIES = ["Cómoda", "Compacta", "Amplia"]
const LABELS = ["Casa", "Trabajo", "Viaje"]
const GALLERY_ACCENT = "#0f766e"

export const entradasDemos: GalleryDemoMap = {
  input: [
    {
      label: "Normal, con error y deshabilitado",
      code: `
<div className="flex w-full max-w-sm flex-col gap-3">
  <Input
    placeholder="Nombre de la etiqueta"
    aria-label="Nombre de la etiqueta"
  />
  <Input
    defaultValue="Sin nombre"
    aria-invalid
    aria-label="Nombre con error"
  />
  <Input
    defaultValue="Cuenta archivada"
    disabled
    aria-label="Deshabilitado"
  />
</div>
`,
      node: (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Input
            placeholder="Nombre de la etiqueta"
            aria-label="Nombre de la etiqueta"
          />
          <Input
            defaultValue="Sin nombre"
            aria-invalid
            aria-label="Nombre con error"
          />
          <Input
            defaultValue="Cuenta archivada"
            disabled
            aria-label="Deshabilitado"
          />
        </div>
      ),
    },
  ],
  textarea: [
    {
      label: "Normal y deshabilitado",
      code: `
<div className="flex w-full max-w-sm flex-col gap-3">
  <Textarea
    placeholder="Notas del movimiento"
    aria-label="Notas"
    rows={3}
  />
  <Textarea
    defaultValue="Sin cambios"
    disabled
    aria-label="Deshabilitado"
  />
</div>
`,
      node: (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Textarea
            placeholder="Notas del movimiento"
            aria-label="Notas"
            rows={3}
          />
          <Textarea
            defaultValue="Sin cambios"
            disabled
            aria-label="Deshabilitado"
          />
        </div>
      ),
    },
  ],
  label: [
    {
      label: "Con un campo",
      code: `
<div className="flex w-full max-w-sm flex-col gap-1.5">
  <Label htmlFor="gallery-label-input">Comercio</Label>
  <Input id="gallery-label-input" placeholder="Mercado Central" />
</div>
`,
      node: (
        <div className="flex w-full max-w-sm flex-col gap-1.5">
          <Label htmlFor="gallery-label-input">Comercio</Label>
          <Input id="gallery-label-input" placeholder="Mercado Central" />
        </div>
      ),
    },
  ],
  field: [
    {
      label: "Vertical, con error y horizontal",
      code: `
<div className="flex w-full max-w-sm flex-col gap-4">
  <Field className="gap-1">
    <FieldLabel>Nombre</FieldLabel>
    <Input placeholder="Mercado Central" />
    <FieldDescription>Se guarda tal como lo escribes.</FieldDescription>
  </Field>
  <Field className="gap-1" data-invalid>
    <FieldLabel>Nombre</FieldLabel>
    <Input defaultValue="" placeholder="Comercio" aria-invalid />
    <FieldError>Escribe el nombre del comercio</FieldError>
  </Field>
  <Field orientation="horizontal">
    <Checkbox defaultChecked aria-label="Recordar" />
    <FieldLabel>Recordar este destino</FieldLabel>
  </Field>
</div>
`,
      node: (
        <div className="flex w-full max-w-sm flex-col gap-4">
          <Field className="gap-1">
            <FieldLabel>Nombre</FieldLabel>
            <Input placeholder="Mercado Central" />
            <FieldDescription>Se guarda tal como lo escribes.</FieldDescription>
          </Field>
          <Field className="gap-1" data-invalid>
            <FieldLabel>Nombre</FieldLabel>
            <Input defaultValue="" placeholder="Comercio" aria-invalid />
            <FieldError>Escribe el nombre del comercio</FieldError>
          </Field>
          <Field orientation="horizontal">
            <Checkbox defaultChecked aria-label="Recordar" />
            <FieldLabel>Recordar este destino</FieldLabel>
          </Field>
        </div>
      ),
    },
  ],
  checkbox: [
    {
      label: "Marcada, sin marcar y deshabilitada",
      code: `
<div className="flex flex-col gap-2">
  <div className="flex items-center gap-2">
    <Checkbox id="gallery-check-1" defaultChecked />
    <Label htmlFor="gallery-check-1">Recordar destino</Label>
  </div>
  <div className="flex items-center gap-2">
    <Checkbox id="gallery-check-2" />
    <Label htmlFor="gallery-check-2">Enviar copia</Label>
  </div>
  <div className="flex items-center gap-2">
    <Checkbox id="gallery-check-3" disabled />
    <Label htmlFor="gallery-check-3">No disponible</Label>
  </div>
</div>
`,
      node: (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id="gallery-check-1" defaultChecked />
            <Label htmlFor="gallery-check-1">Recordar destino</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="gallery-check-2" />
            <Label htmlFor="gallery-check-2">Enviar copia</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="gallery-check-3" disabled />
            <Label htmlFor="gallery-check-3">No disponible</Label>
          </div>
        </div>
      ),
    },
  ],
  "radio-group": [
    {
      label: "Elegido y deshabilitado",
      code: `
<RadioGroup defaultValue="claro" className="gap-2">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="claro" id="gallery-radio-1" />
    <Label htmlFor="gallery-radio-1">Tema claro</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="oscuro" id="gallery-radio-2" />
    <Label htmlFor="gallery-radio-2">Tema oscuro</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="sistema" id="gallery-radio-3" disabled />
    <Label htmlFor="gallery-radio-3">Sistema</Label>
  </div>
</RadioGroup>
`,
      node: (
        <RadioGroup defaultValue="claro" className="gap-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="claro" id="gallery-radio-1" />
            <Label htmlFor="gallery-radio-1">Tema claro</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="oscuro" id="gallery-radio-2" />
            <Label htmlFor="gallery-radio-2">Tema oscuro</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="sistema" id="gallery-radio-3" disabled />
            <Label htmlFor="gallery-radio-3">Sistema</Label>
          </div>
        </RadioGroup>
      ),
    },
  ],
  switch: [
    {
      label: "Encendido, apagado y deshabilitado",
      code: `
<div className="flex flex-col gap-3">
  <div className="flex items-center gap-2">
    <Switch id="gallery-switch-1" defaultChecked />
    <Label htmlFor="gallery-switch-1">Avisos</Label>
  </div>
  <div className="flex items-center gap-2">
    <Switch id="gallery-switch-2" />
    <Label htmlFor="gallery-switch-2">Resumen semanal</Label>
  </div>
  <div className="flex items-center gap-2">
    <Switch id="gallery-switch-3" disabled />
    <Label htmlFor="gallery-switch-3">No disponible</Label>
  </div>
</div>
`,
      node: (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Switch id="gallery-switch-1" defaultChecked />
            <Label htmlFor="gallery-switch-1">Avisos</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="gallery-switch-2" />
            <Label htmlFor="gallery-switch-2">Resumen semanal</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="gallery-switch-3" disabled />
            <Label htmlFor="gallery-switch-3">No disponible</Label>
          </div>
        </div>
      ),
    },
  ],
  "input-group": [
    {
      label: "Búsqueda con icono líder",
      code: `
<InputGroup className="h-10 w-full max-w-sm">
  <InputGroupAddon align="inline-start">
    <SearchIcon className="text-muted-foreground" />
  </InputGroupAddon>
  <InputGroupInput placeholder="Buscar" aria-label="Buscar" />
</InputGroup>
`,
      node: (
        <InputGroup className="h-10 w-full max-w-sm">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Buscar" aria-label="Buscar" />
        </InputGroup>
      ),
    },
    {
      label: "Campo de dato con etiqueta y error",
      code: `
<Field data-invalid className="w-full max-w-sm gap-0.5">
  <FieldLabel htmlFor="nombre" className="pl-2 text-sm text-muted-foreground">
    Nombre
  </FieldLabel>
  <InputGroup className="h-10 overflow-hidden px-1">
    <InputGroupAddon align="inline-start">
      <StoreIcon className="text-muted-foreground" />
    </InputGroupAddon>
    <InputGroupInput id="nombre" aria-invalid />
  </InputGroup>
  <FieldError>Escribe el nombre del comercio</FieldError>
</Field>
`,
      node: (
        <Field data-invalid className="w-full max-w-sm gap-0.5">
          <FieldLabel
            htmlFor="gallery-input-group-field"
            className="pl-2 text-sm text-muted-foreground"
          >
            Nombre
          </FieldLabel>
          <InputGroup className="h-10 overflow-hidden px-1">
            <InputGroupAddon align="inline-start">
              <StoreIcon className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput id="gallery-input-group-field" aria-invalid />
          </InputGroup>
          <FieldError>Escribe el nombre del comercio</FieldError>
        </Field>
      ),
    },
  ],
  select: [
    {
      label: "Normal y deshabilitado",
      code: `
<div className="flex w-full max-w-sm flex-col gap-3">
  <Select
    defaultValue="Cómoda"
    items={DENSITIES.map((name) => ({ value: name, label: name }))}
  >
    <SelectTrigger className="w-full" aria-label="Densidad">
      <SelectValue placeholder="Elige una densidad" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        {DENSITIES.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
  <Select
    defaultValue="Compacta"
    disabled
    items={DENSITIES.map((name) => ({ value: name, label: name }))}
  >
    <SelectTrigger className="w-full" aria-label="Densidad fija">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        {DENSITIES.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
</div>
`,
      node: (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Select
            defaultValue="Cómoda"
            items={DENSITIES.map((name) => ({ value: name, label: name }))}
          >
            <SelectTrigger className="w-full" aria-label="Densidad">
              <SelectValue placeholder="Elige una densidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DENSITIES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            defaultValue="Compacta"
            disabled
            items={DENSITIES.map((name) => ({ value: name, label: name }))}
          >
            <SelectTrigger className="w-full" aria-label="Densidad fija">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DENSITIES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ],
  attachment: [
    {
      label: "Terminado, en proceso y con error",
      code: `
<div className="flex w-full flex-col gap-3">
  <Attachment className="w-full">
    <AttachmentMedia>
      <FileTextIcon />
    </AttachmentMedia>
    <AttachmentContent>
      <AttachmentTitle>estado-de-cuenta.pdf</AttachmentTitle>
      <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
    </AttachmentContent>
    <AttachmentActions>
      <AttachmentAction aria-label="Quitar estado de cuenta">
        <XIcon />
      </AttachmentAction>
    </AttachmentActions>
  </Attachment>
  <Attachment className="w-full" state="uploading">
    <AttachmentMedia>
      <FileTextIcon />
    </AttachmentMedia>
    <AttachmentContent>
      <AttachmentTitle>movimientos.csv</AttachmentTitle>
      <AttachmentDescription>Subiendo · 18 KB</AttachmentDescription>
    </AttachmentContent>
  </Attachment>
  <Attachment className="w-full" state="error">
    <AttachmentMedia>
      <FileTextIcon />
    </AttachmentMedia>
    <AttachmentContent>
      <AttachmentTitle>recibo.jpg</AttachmentTitle>
      <AttachmentDescription>
        No se pudo leer el archivo
      </AttachmentDescription>
    </AttachmentContent>
  </Attachment>
</div>
`,
      node: (
        <div className="flex w-full flex-col gap-3">
          <Attachment className="w-full">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>estado-de-cuenta.pdf</AttachmentTitle>
              <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label="Quitar estado de cuenta">
                <XIcon />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
          <Attachment className="w-full" state="uploading">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>movimientos.csv</AttachmentTitle>
              <AttachmentDescription>Subiendo · 18 KB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
          <Attachment className="w-full" state="error">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>recibo.jpg</AttachmentTitle>
              <AttachmentDescription>
                No se pudo leer el archivo
              </AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        </div>
      ),
    },
  ],
  combobox: [
    {
      label: "Búsqueda con lista",
      code: `
<Combobox items={LABELS}>
  <ComboboxInput
    placeholder="Buscar etiqueta"
    aria-label="Buscar etiqueta"
    className="w-full max-w-sm"
  />
  <ComboboxContent>
    <ComboboxEmpty>Sin resultados</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
`,
      node: (
        <Combobox items={LABELS}>
          <ComboboxInput
            placeholder="Buscar etiqueta"
            aria-label="Buscar etiqueta"
            className="w-full max-w-sm"
          />
          <ComboboxContent>
            <ComboboxEmpty>Sin resultados</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ),
    },
  ],
}

const ATTACHMENT_FILE = {
  title: "estado-de-cuenta.pdf",
  description: "PDF · 2.4 MB",
}

export const entradasVariantDemos: GalleryVariantDemoMap = {
  input: {
    type: [
      { label: "text", node: <Input type="text" defaultValue="Comercio" /> },
      {
        label: "email",
        node: <Input type="email" placeholder="nombre@ejemplo.com" />,
      },
      {
        label: "password",
        node: <Input type="password" defaultValue="clave-de-ejemplo" />,
      },
      {
        label: "search",
        node: <Input type="search" placeholder="Buscar" />,
      },
      { label: "number", node: <Input type="number" defaultValue={12} /> },
    ],
    states: [
      {
        label: "normal",
        node: <Input placeholder="Nombre de la etiqueta" />,
      },
      {
        label: "invalid",
        node: <Input defaultValue="Sin nombre" aria-invalid />,
      },
      {
        label: "disabled",
        node: <Input defaultValue="Cuenta archivada" disabled />,
      },
    ],
  },
  textarea: {
    rows: [
      { label: "2", node: <Textarea rows={2} placeholder="Notas" /> },
      { label: "3", node: <Textarea rows={3} placeholder="Notas" /> },
      { label: "4", node: <Textarea rows={4} placeholder="Notas" /> },
    ],
    states: [
      { label: "normal", node: <Textarea rows={3} placeholder="Notas" /> },
      {
        label: "invalid",
        node: <Textarea rows={3} defaultValue="Sin notas" aria-invalid />,
      },
      {
        label: "disabled",
        node: <Textarea rows={3} defaultValue="Sin cambios" disabled />,
      },
    ],
  },
  label: {
    states: [
      {
        label: "normal",
        node: (
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <Label htmlFor="variant-label-normal">Comercio</Label>
            <Input id="variant-label-normal" placeholder="Mercado Central" />
          </div>
        ),
      },
      {
        label: "disabled por el control",
        node: (
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <Label htmlFor="variant-label-disabled">Comercio</Label>
            <Input
              id="variant-label-disabled"
              defaultValue="Cuenta archivada"
              disabled
            />
          </div>
        ),
      },
    ],
  },
  field: {
    orientation: [
      {
        label: "vertical",
        node: (
          <Field orientation="vertical" className="w-full max-w-sm gap-1">
            <FieldLabel htmlFor="variant-field-vertical">Nombre</FieldLabel>
            <Input id="variant-field-vertical" placeholder="Mercado Central" />
          </Field>
        ),
      },
      {
        label: "horizontal",
        node: (
          <Field orientation="horizontal" className="w-full max-w-sm">
            <Checkbox defaultChecked aria-label="Recordar" />
            <FieldLabel>Recordar este destino</FieldLabel>
          </Field>
        ),
      },
      {
        label: "responsive",
        node: (
          <div className="@container w-full max-w-sm">
            <Field orientation="responsive" className="gap-1">
              <FieldLabel htmlFor="variant-field-responsive">Nombre</FieldLabel>
              <Input
                id="variant-field-responsive"
                placeholder="Mercado Central"
              />
            </Field>
          </div>
        ),
      },
    ],
    variant: [
      {
        label: "plain",
        node: (
          <Field className="w-full max-w-sm gap-1">
            <FieldLabel htmlFor="variant-field-plain">Nombre</FieldLabel>
            <Input id="variant-field-plain" placeholder="Mercado Central" />
          </Field>
        ),
      },
      {
        label: "card",
        node: (
          <Field
            variant="card"
            orientation="horizontal"
            className="w-full max-w-sm"
          >
            <FieldMedia icon={BellIcon} color={GALLERY_ACCENT} />
            <FieldContent>
              <FieldLabel htmlFor="variant-field-card">Avisos</FieldLabel>
              <FieldDescription>
                Recibir un aviso al llegar un cobro
              </FieldDescription>
            </FieldContent>
            <Switch id="variant-field-card" defaultChecked />
          </Field>
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <Field className="w-full max-w-sm gap-1">
            <FieldLabel htmlFor="variant-field-normal">Nombre</FieldLabel>
            <Input id="variant-field-normal" placeholder="Mercado Central" />
            <FieldDescription>Se guarda tal como lo escribes.</FieldDescription>
          </Field>
        ),
      },
      {
        label: "invalid",
        node: (
          <Field className="w-full max-w-sm gap-1" data-invalid>
            <FieldLabel htmlFor="variant-field-invalid">Nombre</FieldLabel>
            <Input
              id="variant-field-invalid"
              placeholder="Comercio"
              aria-invalid
            />
            <FieldError>Escribe el nombre del comercio</FieldError>
          </Field>
        ),
      },
      {
        label: "disabled",
        node: (
          <Field className="w-full max-w-sm gap-1" data-disabled="true">
            <FieldLabel htmlFor="variant-field-disabled">Nombre</FieldLabel>
            <Input
              id="variant-field-disabled"
              defaultValue="Cuenta archivada"
              disabled
            />
          </Field>
        ),
      },
    ],
  },
  checkbox: {
    states: [
      {
        label: "checked",
        node: (
          <div className="flex items-center gap-2">
            <Checkbox id="variant-check-checked" defaultChecked />
            <Label htmlFor="variant-check-checked">Recordar destino</Label>
          </div>
        ),
      },
      {
        label: "unchecked",
        node: (
          <div className="flex items-center gap-2">
            <Checkbox id="variant-check-unchecked" />
            <Label htmlFor="variant-check-unchecked">Enviar copia</Label>
          </div>
        ),
      },
      {
        label: "indeterminate",
        node: (
          <div className="flex items-center gap-2">
            <Checkbox id="variant-check-mixed" indeterminate />
            <Label htmlFor="variant-check-mixed">Algunas categorías</Label>
          </div>
        ),
      },
      {
        label: "disabled",
        node: (
          <div className="flex items-center gap-2">
            <Checkbox id="variant-check-disabled" disabled />
            <Label htmlFor="variant-check-disabled">No disponible</Label>
          </div>
        ),
      },
    ],
  },
  "radio-group": {
    value: [
      {
        label: "controlado",
        node: (
          <RadioGroup value="claro" className="gap-2" aria-label="Tema">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="claro" id="variant-radio-controlled-1" />
              <Label htmlFor="variant-radio-controlled-1">Tema claro</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="oscuro" id="variant-radio-controlled-2" />
              <Label htmlFor="variant-radio-controlled-2">Tema oscuro</Label>
            </div>
          </RadioGroup>
        ),
      },
      {
        label: "defaultValue",
        node: (
          <RadioGroup defaultValue="oscuro" className="gap-2" aria-label="Tema">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="claro" id="variant-radio-default-1" />
              <Label htmlFor="variant-radio-default-1">Tema claro</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="oscuro" id="variant-radio-default-2" />
              <Label htmlFor="variant-radio-default-2">Tema oscuro</Label>
            </div>
          </RadioGroup>
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <RadioGroup className="gap-2" aria-label="Tema sin elegir">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="claro" id="variant-radio-normal-1" />
              <Label htmlFor="variant-radio-normal-1">Tema claro</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="oscuro" id="variant-radio-normal-2" />
              <Label htmlFor="variant-radio-normal-2">Tema oscuro</Label>
            </div>
          </RadioGroup>
        ),
      },
      {
        label: "selected",
        node: (
          <RadioGroup defaultValue="claro" className="gap-2" aria-label="Tema">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="claro" id="variant-radio-selected-1" />
              <Label htmlFor="variant-radio-selected-1">Tema claro</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="oscuro" id="variant-radio-selected-2" />
              <Label htmlFor="variant-radio-selected-2">Tema oscuro</Label>
            </div>
          </RadioGroup>
        ),
      },
      {
        label: "disabled",
        node: (
          <RadioGroup
            defaultValue="claro"
            disabled
            className="gap-2"
            aria-label="Tema deshabilitado"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="claro" id="variant-radio-disabled-1" />
              <Label htmlFor="variant-radio-disabled-1">Tema claro</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="oscuro" id="variant-radio-disabled-2" />
              <Label htmlFor="variant-radio-disabled-2">Tema oscuro</Label>
            </div>
          </RadioGroup>
        ),
      },
    ],
  },
  switch: {
    states: [
      {
        label: "on",
        node: (
          <div className="flex items-center gap-2">
            <Switch id="variant-switch-on" defaultChecked />
            <Label htmlFor="variant-switch-on">Avisos</Label>
          </div>
        ),
      },
      {
        label: "off",
        node: (
          <div className="flex items-center gap-2">
            <Switch id="variant-switch-off" />
            <Label htmlFor="variant-switch-off">Resumen semanal</Label>
          </div>
        ),
      },
      {
        label: "disabled",
        node: (
          <div className="flex items-center gap-2">
            <Switch id="variant-switch-disabled" disabled />
            <Label htmlFor="variant-switch-disabled">No disponible</Label>
          </div>
        ),
      },
    ],
  },
  "input-group": {
    align: [
      {
        label: "inline-start",
        node: (
          <InputGroup className="h-10 w-full max-w-sm">
            <InputGroupAddon align="inline-start">
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Buscar" aria-label="Buscar" />
          </InputGroup>
        ),
      },
      {
        label: "inline-end",
        node: (
          <InputGroup className="h-10 w-full max-w-sm">
            <InputGroupInput
              placeholder="Monto"
              aria-label="Monto"
              defaultValue="1850.00"
            />
            <InputGroupAddon align="inline-end">DOP</InputGroupAddon>
          </InputGroup>
        ),
      },
      {
        label: "block-start",
        node: (
          <InputGroup className="w-full max-w-sm">
            <InputGroupAddon align="block-start">Comercio</InputGroupAddon>
            <InputGroupInput
              placeholder="Mercado Central"
              aria-label="Comercio"
            />
          </InputGroup>
        ),
      },
      {
        label: "block-end",
        node: (
          <InputGroup className="w-full max-w-sm">
            <InputGroupInput
              placeholder="Mercado Central"
              aria-label="Comercio"
            />
            <InputGroupAddon align="block-end">
              Se guarda tal como lo escribes.
            </InputGroupAddon>
          </InputGroup>
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <InputGroup className="h-10 w-full max-w-sm">
            <InputGroupAddon align="inline-start">
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput placeholder="Buscar" aria-label="Buscar" />
          </InputGroup>
        ),
      },
      {
        label: "invalid",
        node: (
          <InputGroup className="h-10 w-full max-w-sm">
            <InputGroupAddon align="inline-start">
              <StoreIcon className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              defaultValue=""
              placeholder="Comercio"
              aria-label="Comercio"
              aria-invalid
            />
          </InputGroup>
        ),
      },
      {
        label: "disabled",
        node: (
          <InputGroup className="h-10 w-full max-w-sm">
            <InputGroupAddon align="inline-start">
              <StoreIcon className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              defaultValue="Cuenta archivada"
              aria-label="Comercio"
              disabled
            />
          </InputGroup>
        ),
      },
    ],
    "size (Button)": [
      {
        label: "xs",
        node: (
          <InputGroup className="h-10 w-full max-w-sm">
            <InputGroupInput placeholder="Buscar" aria-label="Buscar" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="xs">
                <SearchIcon />
                Buscar
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        ),
      },
      {
        label: "sm",
        node: (
          <InputGroup className="h-10 w-full max-w-sm">
            <InputGroupInput placeholder="Buscar" aria-label="Buscar" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="sm">
                <SearchIcon />
                Buscar
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        ),
      },
      {
        label: "icon-xs",
        node: (
          <InputGroup className="h-10 w-full max-w-sm">
            <InputGroupInput placeholder="Buscar" aria-label="Buscar" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Buscar">
                <SearchIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        ),
      },
      {
        label: "icon-sm",
        node: (
          <InputGroup className="h-10 w-full max-w-sm">
            <InputGroupInput placeholder="Buscar" aria-label="Buscar" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-sm" aria-label="Buscar">
                <SearchIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        ),
      },
    ],
  },
  select: {
    size: [
      {
        label: "sm",
        node: (
          <Select defaultValue="Cómoda">
            <SelectTrigger size="sm" aria-label="Densidad pequeña">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DENSITIES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ),
      },
      {
        label: "default",
        node: (
          <Select defaultValue="Cómoda">
            <SelectTrigger aria-label="Densidad">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DENSITIES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <Select defaultValue="Cómoda">
            <SelectTrigger aria-label="Densidad">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DENSITIES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ),
      },
      {
        label: "invalid",
        node: (
          <Select defaultValue="Cómoda">
            <SelectTrigger aria-label="Densidad con error" aria-invalid>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DENSITIES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ),
      },
      {
        label: "disabled",
        node: (
          <Select defaultValue="Compacta" disabled>
            <SelectTrigger aria-label="Densidad fija">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DENSITIES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ),
      },
    ],
  },
  attachment: {
    state: [
      {
        label: "idle",
        node: (
          <Attachment state="idle" className="w-full max-w-sm">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>recibo.jpg</AttachmentTitle>
              <AttachmentDescription>Listo para subir</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ),
      },
      {
        label: "uploading",
        node: (
          <Attachment state="uploading" className="w-full max-w-sm">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>movimientos.csv</AttachmentTitle>
              <AttachmentDescription>Subiendo · 18 KB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ),
      },
      {
        label: "processing",
        node: (
          <Attachment state="processing" className="w-full max-w-sm">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>movimientos.csv</AttachmentTitle>
              <AttachmentDescription>Leyendo el archivo</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ),
      },
      {
        label: "error",
        node: (
          <Attachment state="error" className="w-full max-w-sm">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>recibo.jpg</AttachmentTitle>
              <AttachmentDescription>
                No se pudo leer el archivo
              </AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ),
      },
      {
        label: "done",
        node: (
          <Attachment state="done" className="w-full max-w-sm">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{ATTACHMENT_FILE.title}</AttachmentTitle>
              <AttachmentDescription>
                {ATTACHMENT_FILE.description}
              </AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction aria-label="Quitar estado de cuenta">
                <XIcon />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        ),
      },
    ],
    size: [
      {
        label: "default",
        node: (
          <Attachment size="default" className="w-full max-w-sm">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{ATTACHMENT_FILE.title}</AttachmentTitle>
              <AttachmentDescription>
                {ATTACHMENT_FILE.description}
              </AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ),
      },
      {
        label: "sm",
        node: (
          <Attachment size="sm" className="w-full max-w-sm">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{ATTACHMENT_FILE.title}</AttachmentTitle>
              <AttachmentDescription>
                {ATTACHMENT_FILE.description}
              </AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ),
      },
      {
        label: "xs",
        node: (
          <Attachment size="xs" className="w-full max-w-sm">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{ATTACHMENT_FILE.title}</AttachmentTitle>
              <AttachmentDescription>
                {ATTACHMENT_FILE.description}
              </AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ),
      },
    ],
    orientation: [
      {
        label: "horizontal",
        node: (
          <Attachment orientation="horizontal" className="w-full max-w-sm">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{ATTACHMENT_FILE.title}</AttachmentTitle>
              <AttachmentDescription>
                {ATTACHMENT_FILE.description}
              </AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ),
      },
      {
        label: "vertical",
        node: (
          <Attachment orientation="vertical" className="w-40">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{ATTACHMENT_FILE.title}</AttachmentTitle>
              <AttachmentDescription>
                {ATTACHMENT_FILE.description}
              </AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ),
      },
    ],
    "variant (Media)": [
      {
        label: "icon",
        node: (
          <Attachment className="w-full max-w-sm">
            <AttachmentMedia>
              <FileTextIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{ATTACHMENT_FILE.title}</AttachmentTitle>
              <AttachmentDescription>
                {ATTACHMENT_FILE.description}
              </AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ),
      },
      {
        label: "image",
        node: (
          <Attachment className="w-full max-w-sm">
            <AttachmentMedia variant="image">
              <Image src="/images/image.png" alt="" width={40} height={40} />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>captura.png</AttachmentTitle>
              <AttachmentDescription>Imagen · 204 KB</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ),
      },
    ],
  },
  combobox: {
    mode: [
      {
        label: "single",
        node: (
          <Combobox items={LABELS}>
            <ComboboxInput
              placeholder="Buscar etiqueta"
              aria-label="Buscar etiqueta"
              className="w-full max-w-sm"
            />
            <ComboboxContent>
              <ComboboxEmpty>Sin resultados</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        ),
      },
      {
        label: "multiple con ComboboxChips",
        node: (
          <Combobox multiple defaultValue={["Casa", "Trabajo"]} items={LABELS}>
            <ComboboxChips className="w-full max-w-sm">
              <ComboboxValue>
                {(selected: string[]) =>
                  selected.map((item) => (
                    <ComboboxChip key={item}>{item}</ComboboxChip>
                  ))
                }
              </ComboboxValue>
              <ComboboxChipsInput placeholder="Agregar etiqueta" />
            </ComboboxChips>
            <ComboboxContent>
              <ComboboxEmpty>Sin resultados</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        ),
      },
    ],
    states: [
      {
        label: "closed",
        node: (
          <Combobox items={LABELS}>
            <ComboboxInput
              placeholder="Buscar etiqueta"
              aria-label="Buscar etiqueta cerrada"
              className="w-full max-w-sm"
            />
            <ComboboxContent>
              <ComboboxEmpty>Sin resultados</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        ),
      },
      {
        label: "disabled",
        node: (
          <Combobox disabled items={LABELS}>
            <ComboboxInput
              placeholder="Buscar etiqueta"
              aria-label="Buscar etiqueta deshabilitada"
              className="w-full max-w-sm"
              disabled
            />
            <ComboboxContent>
              <ComboboxEmpty>Sin resultados</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        ),
      },
    ],
  },
}
