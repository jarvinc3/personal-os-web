import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  mergeOptimisticSheetParam,
  readPickerKey,
  resolvePickerNavigation,
  resolveSheetNavigation,
} from "./sheet-navigation.ts"

const path = "/finance/products"

function params(query = "") {
  return new URLSearchParams(query)
}

describe("resolveSheetNavigation", () => {
  it("opens the first sheet with push", () => {
    const result = resolveSheetNavigation({
      pathname: path,
      searchParams: params(),
      key: "institution-sheet",
      open: true,
      wasPushed: false,
    })
    assert.deepEqual(result, {
      action: "push",
      url: "/finance/products?sheet=institution-sheet",
    })
  })

  it("opens a sheet with sheetId", () => {
    const result = resolveSheetNavigation({
      pathname: path,
      searchParams: params(),
      key: "account-sheet",
      open: true,
      id: "acc-1",
      wasPushed: false,
    })
    assert.deepEqual(result, {
      action: "push",
      url: "/finance/products?sheet=account-sheet&sheetId=acc-1",
    })
  })

  it("replaces when switching sheets and drops the previous id", () => {
    const result = resolveSheetNavigation({
      pathname: path,
      searchParams: params("sheet=institution-options-sheet"),
      key: "account-sheet",
      open: true,
      id: "acc-1",
      wasPushed: true,
    })
    assert.deepEqual(result, {
      action: "replace",
      url: "/finance/products?sheet=account-sheet&sheetId=acc-1",
    })
  })

  it("replaces sheetId on the same sheet", () => {
    const result = resolveSheetNavigation({
      pathname: path,
      searchParams: params("sheet=account-sheet&sheetId=acc-1"),
      key: "account-sheet",
      open: true,
      id: "acc-2",
      wasPushed: true,
    })
    assert.deepEqual(result, {
      action: "replace",
      url: "/finance/products?sheet=account-sheet&sheetId=acc-2",
    })
  })

  it("is a noop when the same sheet is already open without a new id", () => {
    const result = resolveSheetNavigation({
      pathname: path,
      searchParams: params("sheet=account-sheet&sheetId=acc-1"),
      key: "account-sheet",
      open: true,
      wasPushed: true,
    })
    assert.deepEqual(result, { action: "noop" })
  })

  it("clears sheetId when forcing create on the same sheet", () => {
    const result = resolveSheetNavigation({
      pathname: path,
      searchParams: params("sheet=transaction-sheet&sheetId=tx-1"),
      key: "transaction-sheet",
      open: true,
      id: null,
      wasPushed: true,
    })
    assert.deepEqual(result, {
      action: "replace",
      url: "/finance/products?sheet=transaction-sheet",
    })
  })

  it("closes a pushed sheet with back", () => {
    const result = resolveSheetNavigation({
      pathname: path,
      searchParams: params("sheet=institution-sheet"),
      key: "institution-sheet",
      open: false,
      wasPushed: true,
    })
    assert.deepEqual(result, { action: "back" })
  })

  it("closes a pushed sheet with replace when the sheet must keep the entry", () => {
    const navigation = resolveSheetNavigation({
      pathname: path,
      searchParams: params("sheet=account-sheet&sheetId=acc-1"),
      key: "account-sheet",
      open: false,
      wasPushed: true,
      closeMode: "replace",
    })
    assert.deepEqual(navigation, {
      action: "replace",
      url: "/finance/products",
    })
  })

  it("keeps unrelated query params when the pushed sheet closes with replace", () => {
    const navigation = resolveSheetNavigation({
      pathname: "/intelligence",
      searchParams: params(
        "intelligence-view=review&sheet=intelligence-message&sheetId=m-1"
      ),
      key: "intelligence-message",
      open: false,
      wasPushed: true,
      closeMode: "replace",
    })
    assert.deepEqual(navigation, {
      action: "replace",
      url: "/intelligence?intelligence-view=review",
    })
  })

  it("closes a deep-linked sheet with replace and keeps other params", () => {
    const result = resolveSheetNavigation({
      pathname: "/finance/sync",
      searchParams: params("success=true&sheet=oauth-gmail-result"),
      key: "oauth-gmail-result",
      open: false,
      wasPushed: false,
    })
    assert.deepEqual(result, {
      action: "replace",
      url: "/finance/sync?success=true",
    })
  })

  it("drops the picker when another sheet opens", () => {
    const result = resolveSheetNavigation({
      pathname: path,
      searchParams: params("sheet=account-sheet&picker=currency"),
      key: "category-sheet",
      open: true,
      wasPushed: true,
    })
    assert.deepEqual(result, {
      action: "replace",
      url: "/finance/products?sheet=category-sheet",
    })
  })

  it("removes the picker when closing a deep link", () => {
    const result = resolveSheetNavigation({
      pathname: path,
      searchParams: params("sheet=account-sheet&picker=currency"),
      key: "account-sheet",
      open: false,
      wasPushed: false,
    })
    assert.deepEqual(result, {
      action: "replace",
      url: "/finance/products",
    })
  })

  it("removes sheetId when closing a deep link", () => {
    const result = resolveSheetNavigation({
      pathname: "/finance/transactions",
      searchParams: params("sheet=transaction-sheet&sheetId=tx-1"),
      key: "transaction-sheet",
      open: false,
      wasPushed: false,
    })
    assert.deepEqual(result, {
      action: "replace",
      url: "/finance/transactions",
    })
  })

  it("is a noop when closing a sheet that is not the active one", () => {
    const result = resolveSheetNavigation({
      pathname: path,
      searchParams: params("sheet=card-sheet&sheetId=c-1"),
      key: "account-sheet",
      open: false,
      wasPushed: true,
    })
    assert.deepEqual(result, { action: "noop" })
  })

  it("preserves unrelated query params when opening", () => {
    const result = resolveSheetNavigation({
      pathname: "/finance/sync",
      searchParams: params("success=true"),
      key: "email-source-sheet",
      open: true,
      id: "src-1",
      wasPushed: false,
    })
    assert.deepEqual(result, {
      action: "push",
      url: "/finance/sync?success=true&sheet=email-source-sheet&sheetId=src-1",
    })
  })
})

describe("resolvePickerNavigation", () => {
  it("opens the picker on top of the sheet and keeps it", () => {
    const result = resolvePickerNavigation({
      pathname: path,
      searchParams: params("sheet=account-sheet&sheetId=acc-1"),
      key: "currency",
      open: true,
      wasPushed: false,
    })
    assert.deepEqual(result, {
      action: "push",
      url: "/finance/products?sheet=account-sheet&sheetId=acc-1&picker=currency",
    })
  })

  it("closes only the picker", () => {
    const result = resolvePickerNavigation({
      pathname: path,
      searchParams: params("sheet=account-sheet&picker=currency"),
      key: "currency",
      open: false,
      wasPushed: false,
    })
    assert.deepEqual(result, {
      action: "replace",
      url: "/finance/products?sheet=account-sheet",
    })
  })

  it("closes a pushed picker with back", () => {
    const result = resolvePickerNavigation({
      pathname: path,
      searchParams: params("sheet=account-sheet&picker=currency"),
      key: "currency",
      open: false,
      wasPushed: true,
    })
    assert.deepEqual(result, { action: "back" })
  })

  it("replaces one picker with another", () => {
    const result = resolvePickerNavigation({
      pathname: path,
      searchParams: params("sheet=account-sheet&picker=color"),
      key: "currency",
      open: true,
      wasPushed: true,
    })
    assert.deepEqual(result, {
      action: "replace",
      url: "/finance/products?sheet=account-sheet&picker=currency",
    })
  })

  it("is a noop when the picker is already open or another one is", () => {
    assert.deepEqual(
      resolvePickerNavigation({
        pathname: path,
        searchParams: params("sheet=account-sheet&picker=currency"),
        key: "currency",
        open: true,
        wasPushed: true,
      }),
      { action: "noop" }
    )
    assert.deepEqual(
      resolvePickerNavigation({
        pathname: path,
        searchParams: params("sheet=account-sheet&picker=color"),
        key: "currency",
        open: false,
        wasPushed: true,
      }),
      { action: "noop" }
    )
  })
})

describe("readPickerKey", () => {
  it("reads the picker and stays null without one", () => {
    assert.equal(
      readPickerKey(params("sheet=account-sheet&picker=currency")),
      "currency"
    )
    assert.equal(readPickerKey(params("sheet=account-sheet")), null)
  })
})

describe("mergeOptimisticSheetParam", () => {
  const key = "card-sheet"
  const closed = { sheetKey: null, sheetId: null }
  const openCard = { sheetKey: key, sheetId: "c-1" }

  it("uses the URL when there is no optimistic state", () => {
    const result = mergeOptimisticSheetParam(key, openCard, null)
    assert.deepEqual(result, {
      open: true,
      sheetId: "c-1",
      dropOptimistic: false,
    })
  })

  it("keeps the optimistic open view until the URL catches up", () => {
    const result = mergeOptimisticSheetParam(key, closed, {
      open: true,
      sheetId: "c-1",
      from: closed,
    })
    assert.deepEqual(result, {
      open: true,
      sheetId: "c-1",
      dropOptimistic: false,
    })
  })

  it("drops optimistic state once the URL matches the target", () => {
    const result = mergeOptimisticSheetParam(key, openCard, {
      open: true,
      sheetId: "c-1",
      from: closed,
    })
    assert.deepEqual(result, {
      open: true,
      sheetId: "c-1",
      dropOptimistic: true,
    })
  })

  it("closes immediately while the URL still shows the previous sheet", () => {
    const result = mergeOptimisticSheetParam(key, openCard, {
      open: false,
      sheetId: "c-1",
      from: openCard,
    })
    assert.deepEqual(result, {
      open: false,
      sheetId: "c-1",
      dropOptimistic: false,
    })
  })

  it("yields to the URL after back or another sheet", () => {
    const result = mergeOptimisticSheetParam(key, closed, {
      open: true,
      sheetId: "c-1",
      from: openCard,
    })
    assert.deepEqual(result, {
      open: false,
      sheetId: null,
      dropOptimistic: true,
    })
  })
})
