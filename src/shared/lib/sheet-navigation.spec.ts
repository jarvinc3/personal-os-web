import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveSheetNavigation } from "./sheet-navigation.ts"

const path = "/finance/accounts"

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
      url: "/finance/accounts?sheet=institution-sheet",
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
      url: "/finance/accounts?sheet=account-sheet&sheetId=acc-1",
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
      url: "/finance/accounts?sheet=account-sheet&sheetId=acc-1",
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
      url: "/finance/accounts?sheet=account-sheet&sheetId=acc-2",
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
      url: "/finance/accounts?sheet=transaction-sheet",
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

  it("closes a deep-linked sheet with replace and keeps other params", () => {
    const result = resolveSheetNavigation({
      pathname: "/finance/sync",
      searchParams: params("success=true&sheet=connect-gmail-sheet"),
      key: "connect-gmail-sheet",
      open: false,
      wasPushed: false,
    })
    assert.deepEqual(result, {
      action: "replace",
      url: "/finance/sync?success=true",
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
