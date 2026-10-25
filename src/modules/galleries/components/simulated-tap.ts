import { appToast } from "@/src/shared/lib/app-toast"

/** Los toques de la galería no ejecutan la acción real (#307). */
export function simulatedTap(action: string = "La acción no se ejecuta"): void {
  appToast.info({ text1: "Toque simulado", text2: action })
}
