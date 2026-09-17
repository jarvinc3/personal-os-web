import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  durationMinutesToHm,
  hm24To12Parts,
  hmToDurationMinutes,
  minuteOptionsForStep,
  snapMinute,
} from "./wheels.type.ts"

describe("minuteOptionsForStep", () => {
  it("lists every minute from 00 to 59 when step is 1", () => {
    const options = minuteOptionsForStep(1)
    assert.equal(options.length, 60)
    assert.equal(options[0]?.value, "00")
    assert.equal(options[7]?.value, "07")
    assert.equal(options[59]?.value, "59")
  })

  it("lists multiples of 5 from 00 to 55", () => {
    const options = minuteOptionsForStep(5)
    assert.deepEqual(
      options.map((option) => option.value),
      ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]
    )
  })

  it("lists multiples of 10 from 00 to 50", () => {
    const options = minuteOptionsForStep(10)
    assert.deepEqual(
      options.map((option) => option.value),
      ["00", "10", "20", "30", "40", "50"]
    )
  })
})

describe("snapMinute", () => {
  it("keeps any minute in 0-59 when step is 1", () => {
    assert.equal(snapMinute("07", 1), "07")
    assert.equal(snapMinute("59", 1), "59")
  })

  it("snaps to the nearest multiple of 5", () => {
    assert.equal(snapMinute("07", 5), "05")
    assert.equal(snapMinute("08", 5), "10")
    assert.equal(snapMinute("58", 5), "00")
  })

  it("snaps to the nearest multiple of 10", () => {
    assert.equal(snapMinute("14", 10), "10")
    assert.equal(snapMinute("16", 10), "20")
  })
})

describe("hm24To12Parts", () => {
  it("preserves exact minutes when step is 1", () => {
    assert.equal(hm24To12Parts("09:07", 1).minute, "07")
    assert.equal(hm24To12Parts("21:07", 1).h12, "09")
    assert.equal(hm24To12Parts("21:07", 1).period, "PM")
  })

  it("snaps minutes when a coarser step is requested", () => {
    assert.equal(hm24To12Parts("09:07", 5).minute, "05")
    assert.equal(hm24To12Parts("09:16", 10).minute, "20")
  })
})

describe("durationMinutesToHm", () => {
  it("splits minutes under an hour as 00:mm", () => {
    assert.equal(durationMinutesToHm(25), "00:25")
    assert.equal(durationMinutesToHm(0), "00:00")
  })

  it("splits hours and leftover minutes as HH:mm", () => {
    assert.equal(durationMinutesToHm(90), "01:30")
    assert.equal(durationMinutesToHm(120), "02:00")
    assert.equal(durationMinutesToHm(1440), "24:00")
  })
})

describe("hmToDurationMinutes", () => {
  it("reads duration hours and minutes from HH:mm", () => {
    assert.equal(hmToDurationMinutes("00:25"), 25)
    assert.equal(hmToDurationMinutes("01:30"), 90)
    assert.equal(hmToDurationMinutes("24:00"), 1440)
  })
})
