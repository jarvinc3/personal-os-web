"use client"

import { GalleryDemo } from "@/src/modules/component-gallery/gallery-demo"
import {
  FormTextField,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { BellIcon, MailIcon, SearchIcon, StoreIcon } from "lucide-react"
import { useState } from "react"

/** Texto, contraseña, búsqueda y switches de formulario (#307). */
export function EntriesSection() {
  const [name, setName] = useState("Comercio Ejemplo")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("clave-de-ejemplo")
  const [search, setSearch] = useState("")
  const [notify, setNotify] = useState(true)
  const [digest, setDigest] = useState(false)

  return (
    <>
      <GalleryDemo
        name="FormTextField"
        importPath="@/src/shared/components/layout/form-blocks"
        states="normal, icono, error, contraseña con revelar, deshabilitado"
        note="Todo campo de dato lleva icono líder. La etiqueta va arriba y el error pegado al campo."
      >
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
      </GalleryDemo>

      <GalleryDemo
        name="InputGroup"
        importPath="@/src/shared/components/ui/input-group"
        states="búsqueda con icono líder"
        note="El primitivo que envuelve un campo con icono o un botón dentro."
      >
        <InputGroup className="h-10">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar"
            aria-label="Buscar"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
      </GalleryDemo>

      <GalleryDemo
        name="SwitchFieldRow"
        importPath="@/src/shared/components/layout/form-blocks"
        states="encendido, apagado, deshabilitado"
        note="Estado binario en una fila: icono a la izquierda del título y la descripción debajo."
      >
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
      </GalleryDemo>
    </>
  )
}
