'use strict'

const assert = require('assert')
const { handle, test, reset, fail } = require('./handle.js')

describe('update', () => {
  describe('PUT', () => {
    before(reset)

    test('PUT', 'RecordSet(\'abc\')', {
      name: 'updated',
      number: 2748
      //  modified
    }, async response => {
      assert.strictEqual(response.statusCode, 204)
      const readResponse = await handle({ request: 'RecordSet(\'abc\')' })
      assert.strictEqual(readResponse.statusCode, 200)
      const readEntity = JSON.parse(readResponse.toString()).d
      assert.strictEqual(readEntity.name, 'updated')
      assert.strictEqual(readEntity.number, 2748)
      assert.strictEqual(readEntity.modified, null)
    })

    describe('errors', () => {
      fail('PUT', '$metadata')
      fail('PUT', '123')
      fail('PUT', 'RecordSet', { name: '270F' })
      fail('PUT', 'RecordSet?$top=1', { name: '9999' })
      fail('PUT', 'UnknownSet', {})
      fail('PUT', 'Values', { id: '123' })
    })
  })

  describe('MERGE', () => {
    before(reset)

    test('MERGE', 'RecordSet(\'abc\')', {
      name: 'updated',
      number: 2748
      //  modified
    }, async response => {
      assert.strictEqual(response.statusCode, 204)
      const readResponse = await handle({ request: 'RecordSet(\'abc\')' })
      assert.strictEqual(readResponse.statusCode, 200)
      const readEntity = JSON.parse(readResponse.toString()).d
      assert.strictEqual(readEntity.name, 'updated')
      assert.strictEqual(readEntity.number, 2748)
      assert.ok(readEntity.modified.match(/\/Date\(\d+\)\//))
    })

    describe('errors', () => {
      fail('MERGE', '$metadata')
      fail('MERGE', '123')
      fail('MERGE', 'RecordSet', { name: '270F' })
      fail('MERGE', 'RecordSet?$top=1', { name: '9999' })
      fail('MERGE', 'UnknownSet', {})
      fail('MERGE', 'Values', { id: '123' })
    })
  })
})
