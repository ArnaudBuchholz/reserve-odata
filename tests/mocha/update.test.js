'use strict'

const assert = require('assert')
const { handle, test, reset, fail } = require('./handle.js')

describe('update', () => {
  describe('PUT', () => {
    before(reset)

    test('PUT', '/Record(\'abc\')', {
      name: 'updated',
      number: 2748
      //  modified
    }, async response => {
      assert.strictEqual(response.statusCode, 204)
      const entity = JSON.parse(response.toString())
      assert.strictEqual(entity.name, 'update')
      assert.strictEqual(entity.number, 2478)
      assert.strictEqual(entity.modified, undefined)
      const readResponse = await handle({ request: 'RecordSet(\'abc\')' })
      assert.strictEqual(readResponse.statusCode, 200)
      const readEntity = JSON.parse(readResponse.toString())
      assert.strictEqual(readEntity.name, 'update')
      assert.strictEqual(readEntity.number, 2478)
      assert.strictEqual(readEntity.modified, undefined)
    })
  })

  describe('MERGE', () => {
    before(reset)
  })
})
