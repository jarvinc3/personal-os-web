const PROVIDER_LABELS: Record<string, string> = {
  anthropic: "Anthropic",
  cerebras: "Cerebras",
  gemini: "Google Gemini",
  google: "Google Gemini",
  groq: "Groq",
  mistral: "Mistral",
  openai: "OpenAI",
}

/** The server sends provider ids; the screen shows a name a person reads. */
export function aiProviderLabel(name: string): string {
  const known = PROVIDER_LABELS[name.trim().toLowerCase()]
  if (known) {
    return known
  }
  const trimmed = name.trim()
  if (!trimmed) {
    return name
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}
