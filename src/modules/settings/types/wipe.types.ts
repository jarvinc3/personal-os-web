/** Apps that declare data branches; the identifier is the API contract. */
export const DATA_APP = {
  FINANCE: "finance",
  AI: "ai",
  NOTIFICATIONS: "notifications",
  SETTINGS: "settings",
} as const

/** Branch that restores settings instead of deleting rows. */
export const SETTINGS_DEFAULTS_BRANCH = "settings.defaults" as const

/** Branch whose wipe can be limited to one institution. */
export const FINANCE_BALANCES_BRANCH = "finance.balances" as const

export type DataBranchIncluded = {
  id: string
  count: number
}

export type DataBranch = {
  id: string
  label: string
  count: number
  includes: DataBranchIncluded[]
}

export type DataAppBranches = {
  app: string
  branches: DataBranch[]
}

export type WipeUserDataResult = {
  success: true
  requestedBranches: string[]
  appliedBranches: string[]
  counts: Record<string, number>
}
