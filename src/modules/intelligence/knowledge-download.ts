type DownloadJsonInput = {
  filename: string
  payload: unknown
}

/** Browser-only download of a JSON snapshot built by the caller. */
export function downloadJson({ filename, payload }: DownloadJsonInput): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
