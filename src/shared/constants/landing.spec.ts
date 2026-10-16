import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  LANDING_URL,
  RETIRED_PUBLIC_PATHS,
  landingUrl,
  resolveLandingUrl,
} from "./landing.mjs"

describe("resolveLandingUrl", () => {
  it("uses the published landing when there is no configured origin", () => {
    assert.equal(resolveLandingUrl(undefined), LANDING_URL)
    assert.equal(resolveLandingUrl(""), LANDING_URL)
    assert.equal(resolveLandingUrl("   "), LANDING_URL)
  })

  it("drops a trailing slash", () => {
    assert.equal(
      resolveLandingUrl("https://landing.example.com/"),
      "https://landing.example.com"
    )
  })

  it("rejects an origin with a path", () => {
    assert.throws(() => resolveLandingUrl("https://landing.example.com/site"))
  })

  it("rejects a value that is not an absolute URL", () => {
    assert.throws(() => resolveLandingUrl("landing.example.com"))
  })
})

describe("landingUrl", () => {
  it("resolves the landing root by default", () => {
    assert.equal(landingUrl(), `${LANDING_URL}/`)
  })

  it("resolves a path against the landing origin", () => {
    assert.equal(landingUrl("/contact"), `${LANDING_URL}/contact`)
  })
})

describe("RETIRED_PUBLIC_PATHS", () => {
  it("maps every retired path to the landing, without duplicates", () => {
    const sources = RETIRED_PUBLIC_PATHS.map(({ source }) => source)

    assert.equal(new Set(sources).size, sources.length)
    for (const { source, destination } of RETIRED_PUBLIC_PATHS) {
      assert.ok(source.startsWith("/"), `${source} no es una ruta absoluta`)
      assert.ok(
        landingUrl(destination).startsWith(`${LANDING_URL}/`),
        `${source} no apunta a la landing`
      )
    }
  })

  it("sends the old marketing path to the landing root", () => {
    const marketingPath = RETIRED_PUBLIC_PATHS.find(
      ({ source }) => source === "/landing"
    )

    assert.equal(marketingPath?.destination, "/")
  })
})
