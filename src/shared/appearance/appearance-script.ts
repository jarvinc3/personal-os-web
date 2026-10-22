import {
  APPEARANCE_CACHE_VERSION,
  APPEARANCE_STORAGE_KEY,
} from "@/src/shared/appearance/appearance-cache"
import { APPEARANCE_STYLES } from "@/src/shared/appearance/style-registry"

const STORAGE_KEY_JSON = JSON.stringify(APPEARANCE_STORAGE_KEY)
const STYLE_IDS_JSON = JSON.stringify(
  APPEARANCE_STYLES.map((style) => style.id)
)

/**
 * Se ejecuta antes del primer pintado: aplica estilo y color guardados para que
 * la apariencia no parpadee mientras React monta la app.
 */
export const APPEARANCE_SCRIPT = `(function () {
  try {
    var raw = localStorage.getItem(${STORAGE_KEY_JSON});
    if (!raw) { return; }
    var cached = JSON.parse(raw);
    if (!cached || cached.version !== ${APPEARANCE_CACHE_VERSION}) { return; }
    var styles = ${STYLE_IDS_JSON};
    if (styles.indexOf(cached.style) === -1) { return; }
    var color = cached.primaryColor;
    if (typeof color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(color)) { return; }
    var foreground = cached.primaryForeground;
    if (foreground !== "#000000" && foreground !== "#FFFFFF") { return; }
    var root = document.documentElement;
    root.setAttribute("data-style", cached.style);
    root.style.setProperty("--primary", color);
    root.style.setProperty("--primary-foreground", foreground);
    root.style.setProperty("--ring", color);
  } catch (error) {
    /* La caché es opcional: sin ella se usa la apariencia por defecto. */
  }
})();`
