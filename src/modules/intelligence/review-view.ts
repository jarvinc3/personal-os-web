export type ReviewView = "groups" | "messages"

export const REVIEW_VIEW_QUERY_KEY = "review"

/** Un valor desconocido en la URL no rompe la vista: cae en grupos. */
export function readReviewView(value: string | null): ReviewView {
  return value === "messages" ? "messages" : "groups"
}
