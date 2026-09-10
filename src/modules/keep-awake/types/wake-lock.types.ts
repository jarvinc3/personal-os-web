export type { KeepAwakePhase } from "@/src/modules/keep-awake/lib/session-status"

export type WakeLockNavigator = Navigator & {
  wakeLock?: WakeLock
}

export type DocumentPipWindow = Window & {
  documentPictureInPicture?: DocumentPictureInPicture
}
