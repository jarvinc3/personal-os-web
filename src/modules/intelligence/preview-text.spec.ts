import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { cleanPreviewText } from "@/src/modules/intelligence/preview-text"

describe("limpieza de la vista previa del correo", () => {
  it("quita entidades invisibles antes del primer texto visible", () => {
    assert.equal(cleanPreviewText("&#847; &#847; &shy; 96&shy; &nbsp; "), "96")
  })

  it("decodifica entidades numéricas y con nombre", () => {
    assert.equal(
      cleanPreviewText("&lt;Hola&gt; &amp; &#161;Hasta luego!"),
      "<Hola> & ¡Hasta luego!"
    )
  })

  it("elimina espacios de ancho cero y caracteres de control", () => {
    assert.equal(
      cleanPreviewText("&#x200B;Recibo\u00a0&#8203;de pago"),
      "Recibo de pago"
    )
  })

  it("conserva los saltos de línea útiles", () => {
    assert.equal(cleanPreviewText("Línea 1\n\n\nLínea 2"), "Línea 1\n\nLínea 2")
  })

  it("devuelve vacío si no hay texto visible", () => {
    assert.equal(cleanPreviewText("&#847; &shy; &#8203;"), "")
    assert.equal(cleanPreviewText(null), "")
  })
})
