'use strict'

const assert = require('assert')
const { handle, test, reset, fail } = require('./handle.js')

describe('update', () => {
  const referenceDate = `/Date(${new Date(2020, 11, 22, 23, 57, 12, 345).getTime()})/`

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

    test('PUT', 'RecordSet(\'abc\')', {
      name: 'updated',
      number: 2748,
      modified: referenceDate
    }, async response => {
      assert.strictEqual(response.statusCode, 204)
      const readResponse = await handle({ request: 'RecordSet(\'abc\')' })
      assert.strictEqual(readResponse.statusCode, 200)
      const readEntity = JSON.parse(readResponse.toString()).d
      assert.strictEqual(readEntity.name, 'updated')
      assert.strictEqual(readEntity.number, 2748)
      assert.strictEqual(readEntity.modified, referenceDate)
    })

    describe('errors', () => {
      fail('PUT', '$metadata')
      fail('PUT', '123')
      fail('PUT', 'RecordSet(\'abc\')', { name: 'fail' })
      fail('PUT', 'RecordSet', { name: '270F' })
      fail('PUT', 'RecordSet?$top=1', { name: '9999' })
      fail('PUT', 'RecordSet(\'not_existing\')', { name: 'create?' })
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

    test('MERGE', 'RecordSet(\'abc\')', {
      modified: referenceDate
    }, async response => {
      assert.strictEqual(response.statusCode, 204)
      const readResponse = await handle({ request: 'RecordSet(\'abc\')' })
      assert.strictEqual(readResponse.statusCode, 200)
      const readEntity = JSON.parse(readResponse.toString()).d
      assert.strictEqual(readEntity.name, 'updated')
      assert.strictEqual(readEntity.number, 2748)
      assert.strictEqual(readEntity.modified, referenceDate)
    })

    describe('errors', () => {
      fail('MERGE', '$metadata')
      fail('MERGE', '123')
      fail('MERGE', 'RecordSet(\'abc\')', { name: 'fail' })
      fail('MERGE', 'RecordSet', { name: '270F' })
      fail('MERGE', 'RecordSet?$top=1', { name: '9999' })
      fail('MERGE', 'RecordSet(\'not_existing\')', { name: 'create?' })
      fail('MERGE', 'UnknownSet', {})
      fail('MERGE', 'Values', { id: '123' })
    })
  })
})
