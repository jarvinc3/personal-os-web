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
    version: "0.40.0",
    highlights: [
      "Estreno de la hoja «Novedades»: cuando salga una versión nueva, la primera vez que abras Personal OS verás qué cambió, explicado en lenguaje corriente.",
      "La hoja aparece una sola vez por versión. Si ya la viste, no vuelve a salir.",
    ],
  },
]

/** Versión de la app que la hoja compara con la última vista. Sigue a `package.json`. */
export const LATEST_RELEASE_VERSION = RELEASE_NOTES[0].version
