import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  CATEGORY_EMOJI_GROUPS,
  suggestCategoryEmojis,
} from "./category-emoji-catalog.ts"

function emojiForKeyword(keyword: string): string {
  for (const group of CATEGORY_EMOJI_GROUPS) {
    for (const option of group.emojis) {
      if (option.keywords.includes(keyword)) {
        return option.emoji
      }
    }
  }
  throw new Error(`No emoji found for keyword: ${keyword}`)
}

describe("suggestCategoryEmojis", () => {
  it("suggests an emoji whose keywords match the name", () => {
    const gymEmoji = emojiForKeyword("gimnasio")

    assert.ok(suggestCategoryEmojis("Gimnasio").includes(gymEmoji))
  })

  it("matches on the group label", () => {
    assert.ok(suggestCategoryEmojis("Transporte").length > 0)
  })

  it("returns nothing for a name without matches", () => {
    assert.deepEqual(suggestCategoryEmojis("xyzzy"), [])
  })

  it("returns nothing for a name that is too short", () => {
    assert.deepEqual(suggestCategoryEmojis("ab"), [])
  })
})
