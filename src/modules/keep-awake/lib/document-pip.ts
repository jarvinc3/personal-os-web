const PIP_BASE_STYLES = `
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--background, #f0efe9);
    color: var(--foreground, #131313);
    font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  }
  #keep-awake-pip-root {
    width: 100%;
    height: 100%;
  }
`

export function isDocumentPipSupported(): boolean {
  return typeof window !== "undefined" && "documentPictureInPicture" in window
}

export function isWakeLockSupported(nav: Navigator = navigator): boolean {
  return "wakeLock" in nav
}

/** Copy app stylesheets into the PiP document so Tailwind tokens resolve. */
export function copyStylesToPip(targetDoc: Document): void {
  document.querySelectorAll('link[rel="stylesheet"]').forEach((node) => {
    const source = node as HTMLLinkElement
    const link = targetDoc.createElement("link")
    link.rel = "stylesheet"
    link.href = source.href
    if (source.media) {
      link.media = source.media
    }
    targetDoc.head.appendChild(link)
  })

  for (const sheet of Array.from(document.styleSheets)) {
    if (sheet.href) {
      continue
    }
    try {
      const cssRules = Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join("")
      const style = targetDoc.createElement("style")
      style.textContent = cssRules
      targetDoc.head.appendChild(style)
    } catch {
      /* cross-origin / inaccessible sheet */
    }
  }

  const base = targetDoc.createElement("style")
  base.textContent = PIP_BASE_STYLES
  targetDoc.head.appendChild(base)

  // Mirror CSS variables from the opener so token colors match the app theme.
  const rootStyles = getComputedStyle(document.documentElement)
  const vars = [
    "--background",
    "--foreground",
    "--card",
    "--card-foreground",
    "--primary",
    "--primary-foreground",
    "--muted",
    "--muted-foreground",
    "--border",
    "--destructive",
    "--success",
    "--warning",
    "--font-sans",
  ]
  for (const name of vars) {
    const value = rootStyles.getPropertyValue(name).trim()
    if (value) {
      targetDoc.documentElement.style.setProperty(name, value)
    }
  }
}

export async function openDocumentPip(options?: {
  width?: number
  height?: number
}): Promise<Window> {
  if (!isDocumentPipSupported()) {
    throw new Error(
      "Tu navegador no soporta Document Picture-in-Picture (Chrome/Edge o Firefox recientes)."
    )
  }

  const pipWindow = await window.documentPictureInPicture!.requestWindow({
    width: options?.width ?? 280,
    height: options?.height ?? 168,
  })

  copyStylesToPip(pipWindow.document)
  pipWindow.document.body.style.margin = "0"

  const mount = pipWindow.document.createElement("div")
  mount.id = "keep-awake-pip-root"
  pipWindow.document.body.appendChild(mount)

  return pipWindow
}

export function getPipMountNode(pipWindow: Window): HTMLElement | null {
  return pipWindow.document.getElementById("keep-awake-pip-root")
}

export function watchVisibility(
  doc: Document,
  onVisible: () => void
): () => void {
  const handler = () => {
    if (doc.visibilityState === "visible") {
      onVisible()
    }
  }
  doc.addEventListener("visibilitychange", handler)
  return () => doc.removeEventListener("visibilitychange", handler)
}
