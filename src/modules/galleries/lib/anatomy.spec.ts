import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  anatomyTree,
  hasAnatomyChildren,
} from "@/src/modules/galleries/lib/anatomy"

describe("árbol de composición de la galería", () => {
  it("dibuja un componente sin hijos como una sola línea", () => {
    assert.equal(anatomyTree([{ name: "Spinner" }]), "Spinner")
  })

  it("cuelga los hijos con rama y cierra con la última", () => {
    assert.equal(
      anatomyTree([
        {
          name: "Tabs",
          children: [
            { name: "TabsList", children: [{ name: "TabsTrigger" }] },
            { name: "TabsContent" },
          ],
        },
      ]),
      ["Tabs", "├── TabsList", "│   └── TabsTrigger", "└── TabsContent"].join(
        "\n"
      )
    )
  })

  it("repite niveles anidados con el mismo criterio", () => {
    assert.equal(
      anatomyTree([
        {
          name: "Accordion",
          children: [
            {
              name: "AccordionItem",
              children: [
                { name: "AccordionTrigger" },
                { name: "AccordionContent" },
              ],
            },
          ],
        },
      ]),
      [
        "Accordion",
        "└── AccordionItem",
        "    ├── AccordionTrigger",
        "    └── AccordionContent",
      ].join("\n")
    )
  })

  it("permite varias raíces, una por línea", () => {
    assert.equal(
      anatomyTree([{ name: "Card" }, { name: "CardHeader" }]),
      "Card\nCardHeader"
    )
  })

  it("distingue una raíz sin hijos de un árbol con composición", () => {
    assert.equal(hasAnatomyChildren([{ name: "Button" }]), false)
    assert.equal(
      hasAnatomyChildren([{ name: "Tabs", children: [{ name: "TabsList" }] }]),
      true
    )
  })

  it("trata una anatomía vacía como sin hijos", () => {
    assert.equal(hasAnatomyChildren([]), false)
  })
})
