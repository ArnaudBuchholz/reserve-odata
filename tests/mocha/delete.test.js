'use strict'

const assert = require('assert')
const { handle, test, reset } = require('./handle.js')

describe('delete', () => {
  beforeEach(reset)

  test('DELETE', 'RecordSet(\'abc\')', response => {
    assert.strictEqual(response.statusCode, 204)
    return handle({ request: 'RecordSet(\'abc\')' })
      .then(response => {
        assert.strictEqual(response.statusCode, 404)
      })
  })
})
