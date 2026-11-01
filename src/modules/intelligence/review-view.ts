/** Vista de la pestaña Revisión: grupos o cola por correo. */
export type ReviewView = "groups" | "messages"

export const REVIEW_VIEW_QUERY_KEY = "review"

export function readReviewView(value: string | null): ReviewView {
  return value === "messages" ? "messages" : "groups"
}
