import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { isPushServiceUnavailableError } from './web-push-support.ts'

describe('isPushServiceUnavailableError', () => {
  it('detects AbortError from a missing browser push service', () => {
    const error = Object.assign(new Error('Registration failed - push service not available'), {
      name: 'AbortError',
    })

    assert.equal(isPushServiceUnavailableError(error), true)
  })

  it('detects the push-service message even without AbortError', () => {
    assert.equal(
      isPushServiceUnavailableError(new Error('Push service not available')),
      true,
    )
  })

  it('returns false for unrelated errors', () => {
    assert.equal(isPushServiceUnavailableError(new Error('Network request failed')), false)
    assert.equal(isPushServiceUnavailableError(null), false)
    assert.equal(isPushServiceUnavailableError('abort'), false)
  })
})
