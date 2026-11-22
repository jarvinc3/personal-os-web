import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { splitSnippet } from "@/src/modules/galleries/lib/snippet"

describe("separación del snippet en importación y uso", () => {
  it("separa una importación de una línea del uso", () => {
    const parts =
      splitSnippet(`import { Button } from "@/src/shared/components/ui/button"

<Button variant="outline">
  <PlusIcon />
  Nuevo
</Button>`)

    assert.equal(
      parts.importCode,
      'import { Button } from "@/src/shared/components/ui/button"'
    )
    assert.equal(
      parts.usageCode,
      '<Button variant="outline">\n  <PlusIcon />\n  Nuevo\n</Button>'
    )
  })

  it("separa una importación de varias líneas", () => {
    const parts = splitSnippet(`import {
  Card,
  CardHeader,
} from "@/src/shared/components/ui/card"

<Card>
  <CardHeader>Título</CardHeader>
</Card>`)

    assert.equal(
      parts.importCode,
      'import {\nCard,\nCardHeader,\n} from "@/src/shared/components/ui/card"'
    )
    assert.equal(
      parts.usageCode,
      "<Card>\n  <CardHeader>Título</CardHeader>\n</Card>"
    )
  })

  it("junta varias importaciones seguidas", () => {
    const parts = splitSnippet(`import { Card } from "@/ui/card"
import { InboxIcon } from "lucide-react"

<Card />`)

    assert.equal(
      parts.importCode,
      'import { Card } from "@/ui/card"\nimport { InboxIcon } from "lucide-react"'
    )
    assert.equal(parts.usageCode, "<Card />")
  })

  it("deja todo como uso cuando no hay importaciones", () => {
    const parts = splitSnippet('appToast.success({ text1: "Guardado" })')

    assert.equal(parts.importCode, "")
    assert.equal(parts.usageCode, 'appToast.success({ text1: "Guardado" })')
  })

  it("reconoce una importación sin llaves", () => {
    const parts = splitSnippet(`import "@/app/globals.css"

<div />`)

    assert.equal(parts.importCode, 'import "@/app/globals.css"')
    assert.equal(parts.usageCode, "<div />")
  })
})
