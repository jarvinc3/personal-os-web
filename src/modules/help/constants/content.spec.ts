import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { HELP_FAQ_GROUPS } from "./faq.ts"
import { HELP_TERMS, HELP_TERM_CATEGORIES } from "./glossary.ts"
import { HELP_GUIDES, HELP_GUIDE_GROUPS } from "./guides.ts"
import { parseHelpText } from "../lib/help-text.ts"

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const termSlugs = new Set(HELP_TERMS.map((term) => term.slug))
const guideSlugs = new Set(HELP_GUIDES.map((guide) => guide.slug))

function collectTexts(): readonly { source: string; text: string }[] {
  const texts = HELP_TERMS.map((term) => ({
    source: `term:${term.slug}`,
    text: term.definition,
  }))
  for (const guide of HELP_GUIDES) {
    for (const step of guide.steps) {
      texts.push({ source: `guide:${guide.slug}`, text: step.body })
    }
  }
  for (const group of HELP_FAQ_GROUPS) {
    for (const question of group.questions) {
      texts.push({ source: `faq:${question.id}`, text: question.answer })
    }
  }
  return texts
}

describe("help content", () => {
  it("uses unique kebab-case slugs", () => {
    assert.equal(termSlugs.size, HELP_TERMS.length)
    assert.equal(guideSlugs.size, HELP_GUIDES.length)

    for (const term of HELP_TERMS) {
      assert.match(term.slug, KEBAB_CASE)
    }
    for (const guide of HELP_GUIDES) {
      assert.match(guide.slug, KEBAB_CASE)
    }
  })

  it("keeps every category and guide group in use", () => {
    const categoryIds = new Set(HELP_TERM_CATEGORIES.map((item) => item.id))
    for (const term of HELP_TERMS) {
      assert.ok(categoryIds.has(term.category), `unknown category ${term.slug}`)
    }
    for (const category of HELP_TERM_CATEGORIES) {
      assert.ok(
        HELP_TERMS.some((term) => term.category === category.id),
        `empty category ${category.id}`
      )
    }

    const groupIds = new Set(HELP_GUIDE_GROUPS.map((group) => group.id))
    for (const guide of HELP_GUIDES) {
      assert.ok(groupIds.has(guide.group), `unknown group ${guide.slug}`)
    }
    for (const group of HELP_GUIDE_GROUPS) {
      assert.ok(
        HELP_GUIDES.some((guide) => guide.group === group.id),
        `empty group ${group.id}`
      )
    }
  })

  it("points related terms and inline links to existing content", () => {
    for (const term of HELP_TERMS) {
      for (const related of term.related ?? []) {
        assert.notEqual(related, term.slug)
        assert.ok(termSlugs.has(related), `unknown related ${related}`)
      }
    }

    for (const { source, text } of collectTexts()) {
      for (const segment of parseHelpText(text)) {
        if (segment.kind === "term") {
          assert.ok(
            termSlugs.has(segment.slug),
            `${source} links unknown term ${segment.slug}`
          )
        }
        if (segment.kind === "guide") {
          assert.ok(
            guideSlugs.has(segment.slug),
            `${source} links unknown guide ${segment.slug}`
          )
        }
      }
    }
  })

  it("keeps FAQ groups and question ids unique", () => {
    const groupSlugs = new Set(HELP_FAQ_GROUPS.map((group) => group.slug))
    assert.equal(groupSlugs.size, HELP_FAQ_GROUPS.length)

    const questionIds = HELP_FAQ_GROUPS.flatMap((group) =>
      group.questions.map((question) => question.id)
    )
    assert.equal(new Set(questionIds).size, questionIds.length)
  })
})
