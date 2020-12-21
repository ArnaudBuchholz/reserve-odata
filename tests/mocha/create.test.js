'use strict'

const assert = require('assert')
const { handle, test, reset, fail } = require('./handle.js')

describe('create', () => {
  before(reset)

  const referenceDate = `/Date(${new Date(2020, 11, 18, 12, 54, 12, 345).getTime()})/`

  test('POST', 'RecordSet', {
    name: '270F'
  }, async response => {
    assert.strictEqual(response.statusCode, 201)
    const created = JSON.parse(response.toString()).d
    assert.strictEqual(created.name, '270F')
    assert.strictEqual(created.number, 9999)
    assert.ok(created.modified.match(/\/Date\(\d+\)\//))
    const readResponse = await handle({ request: 'RecordSet(\'270f\')' })
    assert.strictEqual(readResponse.statusCode, 200)
  })

  test('POST', 'RecordSet', {
    name: '270E',
    modified: referenceDate
  }, async response => {
    assert.strictEqual(response.statusCode, 201)
    const created = JSON.parse(response.toString()).d
    assert.strictEqual(created.name, '270E')
    assert.strictEqual(created.number, 9998)
    assert.strictEqual(created.modified, referenceDate)
    const readResponse = await handle({ request: 'RecordSet(\'270e\')' })
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
