'use strict'

const assert = require('assert')
const { handle, test, reset, fail } = require('./handle.js')

describe('create', () => {
  before(reset)

  test('POST', 'RecordSet', {
    name: '270F'
  }, async response => {
    assert.strictEqual(response.statusCode, 201)
    const created = JSON.parse(response.toString()).d
    assert.strictEqual(created.name, '270F')
    assert.strictEqual(created.number, 9999)
    const readResponse = await handle({ request: 'RecordSet(\'270f\')' })
    assert.strictEqual(readResponse.statusCode, 200)
  })

  describe('errors', () => {
    fail('POST', '$metadata')
    fail('POST', '123')
    fail('POST', 'RecordSet', { name: '270F' }) // Already exists
    fail('POST', 'RecordSet?$top=1', { name: '9999' })
    fail('POST', 'UnknownSet', {})
    fail('POST', 'Values', { id: '123' })
  })
})
