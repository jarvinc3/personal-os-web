import { useState } from "react"
import {
  BellIcon,
  FileTextIcon,
  MailIcon,
  SearchIcon,
  StoreIcon,
  XIcon,
} from "lucide-react"

import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { SwitchFieldRow } from "@/src/shared/components/forms/switch-field-row"
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
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/src/shared/components/ui/combobox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/shared/components/ui/field"
import { Input } from "@/src/shared/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
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

import type { GalleryDemoMap } from "@/src/modules/galleries/components/catalog/types"

const DENSITIES = ["Cómoda", "Compacta", "Amplia"]
const LABELS = ["Casa", "Trabajo", "Viaje"]

function FormTextFieldDemo() {
  const [name, setName] = useState("Comercio Ejemplo")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("clave-de-ejemplo")

  return (
    <div className="flex w-full flex-col gap-3">
      <FormTextField
        label="Nombre"
        value={name}
        onChange={setName}
        icon={StoreIcon}
      />
      <FormTextField
        label="Correo"
        value={email}
        onChange={setEmail}
        icon={MailIcon}
        type="email"
        placeholder="nombre@ejemplo.com"
      />
      <FormTextField
        label="Comercio"
        value=""
        onChange={() => {}}
        icon={StoreIcon}
        error="Escribe el nombre del comercio"
      />
      <FormTextField
        label="Contraseña"
        value={password}
        onChange={setPassword}
        type="password"
        revealable
      />
      <FormTextField
        label="Correo verificado"
        value="cuenta@ejemplo.com"
        onChange={() => {}}
        icon={MailIcon}
        disabled
      />
    </div>
  )
}

function SwitchFieldRowDemo() {
  const [notify, setNotify] = useState(true)
  const [digest, setDigest] = useState(false)

  return (
    <div className="flex w-full flex-col gap-3">
      <SwitchFieldRow
        label="Avisos"
        description="Recibir un aviso al llegar un cobro"
        icon={BellIcon}
        checked={notify}
        onCheckedChange={setNotify}
      />
      <SwitchFieldRow
        label="Resumen semanal"
        description="Correo con el resumen de la semana"
        icon={MailIcon}
        checked={digest}
        onCheckedChange={setDigest}
      />
      <SwitchFieldRow
        label="Avisos del sistema"
        description="No se puede cambiar en este ejemplo"
        icon={BellIcon}
        checked={false}
        onCheckedChange={() => {}}
        disabled
      />
    </div>
  )
}

export const entradasDemos: GalleryDemoMap = {
  input: [
    {
      label: "Normal, con error y deshabilitado",
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
  "switch-field-row": [
    {
      label: "Encendido, apagado y deshabilitado",
      node: <SwitchFieldRowDemo />,
    },
  ],
  "input-group": [
    {
      label: "Búsqueda con icono líder",
      node: (
        <InputGroup className="h-10 w-full max-w-sm">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Buscar" aria-label="Buscar" />
        </InputGroup>
      ),
    },
  ],
  "form-text-field": [
    {
      label: "Normal, error, contraseña y deshabilitado",
      node: <FormTextFieldDemo />,
    },
  ],
  select: [
    {
      label: "Normal y deshabilitado",
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
