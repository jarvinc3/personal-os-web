import type { components } from "@/src/config/api-contract/api-schema"

type AiSchemas = components["schemas"]

export type ViewSuggestion = AiSchemas["ViewSuggestionDto"]
export type ViewSuggestionsList = AiSchemas["ViewSuggestionsListDto"]
