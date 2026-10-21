export type HelpTermCategoryId =
  | "general"
  | "dinero"
  | "productos"
  | "movimientos"
  | "planificacion"
  | "correo"

export type HelpTerm = {
  slug: string
  term: string
  category: HelpTermCategoryId
  definition: string
  aliases?: readonly string[]
  related?: readonly string[]
}

export type HelpGuideGroupId = "instalacion" | "primeros-pasos" | "apps"

export type HelpGuideStep = {
  title: string
  body: string
}

export type HelpGuide = {
  slug: string
  title: string
  summary: string
  group: HelpGuideGroupId
  steps: readonly HelpGuideStep[]
}

export type HelpFaqQuestion = {
  id: string
  question: string
  answer: string
}

export type HelpFaqGroup = {
  slug: string
  title: string
  questions: readonly HelpFaqQuestion[]
}
