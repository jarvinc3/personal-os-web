/**
 * Notas de usuario que alimentan la hoja «Novedades».
 *
 * Se mantiene a mano junto al `CHANGELOG.md`: mismas versiones, mismo orden
 * (la más nueva arriba), pero escritas para quien usa la app. Aquí no va el
 * changelog técnico. Cómo agregarlas: `docs/versionado.md`.
 */
export type ReleaseNotesEntry = {
  version: string
  highlights: readonly string[]
}

export const RELEASE_NOTES: readonly ReleaseNotesEntry[] = [
  {
    version: "0.42.3",
    highlights: [
      "Sin cambios visibles: actualización interna de dependencias.",
    ],
  },
  {
    version: "0.42.2",
    highlights: [
      "Sin cambios visibles: limpieza interna de dependencias y del icono del navegador.",
    ],
  },
  {
    version: "0.42.1",
    highlights: [
      "Sin cambios visibles: ajuste interno de cómo la app recuerda la última versión de Novedades que viste.",
    ],
  },
  {
    version: "0.42.0",
    highlights: [
      "La hoja «Novedades» ahora recuerda en tu perfil la última versión que viste, así que no vuelve a aparecer aunque entres desde otro dispositivo.",
    ],
  },
  {
    version: "0.41.0",
    highlights: [
      "Si una acción se reintenta por un corte de red, la app ya no la repite: si el servidor ya la había registrado, verás el mismo resultado en vez de crear un duplicado.",
    ],
  },
  {
    version: "0.40.0",
    highlights: [
      "Estreno de la hoja «Novedades»: cuando salga una versión nueva, la primera vez que abras Personal OS verás qué cambió, explicado en lenguaje corriente.",
      "La hoja aparece una sola vez por versión. Si ya la viste, no vuelve a salir.",
    ],
  },
]

/** Versión de la app que la hoja compara con la última vista. Sigue a `package.json`. */
export const LATEST_RELEASE_VERSION = RELEASE_NOTES[0].version
