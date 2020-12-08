'use strict'

const assert = require('assert')
const { handle, test, reset, fail } = require('./handle.js')

describe('delete', () => {
  before(reset)

  test('DELETE', 'RecordSet(\'abc\')', response => {
    assert.strictEqual(response.statusCode, 204)
    return handle({ request: 'RecordSet(\'abc\')' })
      .then(response => {
        assert.strictEqual(response.statusCode, 404)
      })
  })

  describe('errors', () => {
    fail('DELETE', 'RecordSet')
    fail('DELETE', 'RecordSet(\'abc\')')
    fail('DELETE', 'RecordSet(\'abd\')?$expand=abc')
    fail('DELETE', 'UnknownSet(\'abc\')')
    fail('DELETE', 'ApplicationSettings(application=\'Example\',version=1,setting=\'Preview\')')
  })
})
