declare module "*.css" {}
declare module "*.sass" {}
declare module "*.scss" {}

interface DocumentPictureInPictureOptions {
  width?: number
  height?: number
  disallowReturnToOpener?: boolean
  preferInitialWindowPlacement?: boolean
}

interface DocumentPictureInPicture {
  requestWindow: (options?: DocumentPictureInPictureOptions) => Promise<Window>
  readonly window: Window | null
}

interface Window {
  documentPictureInPicture?: DocumentPictureInPicture
}
