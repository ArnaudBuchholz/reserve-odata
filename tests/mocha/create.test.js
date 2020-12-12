'use strict'

const assert = require('assert')
const { handle, test, reset, fail } = require('./handle.js')

describe('create', () => {
  before(reset)

  test('POST', 'RecordSet', {
    name: '270F'
  }, async response => {
    assert.strictEqual(response.statusCode, 201)
    const readResponse = await handle({ request: 'RecordSet(\'270f\')' })
    assert.strictEqual(readResponse.statusCode, 200)
  })

  describe('errors', () => {
    fail('POST', 'RecordSet?$top=1', { name: '9999' })
  })
})
