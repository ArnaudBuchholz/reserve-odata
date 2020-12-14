'use strict'

const assert = require('assert')
const { handle, test, reset, fail } = require('./handle.js')

describe('delete', () => {
  before(reset)

  test('DELETE', 'RecordSet(\'abc\')', async response => {
    assert.strictEqual(response.statusCode, 204)
    const readResponse = await handle({ request: 'RecordSet(\'abc\')' })
    assert.strictEqual(readResponse.statusCode, 404)
  })

  describe('errors', () => {
    fail('DELETE', '$metadata')
    fail('DELETE', '123')
    fail('DELETE', 'RecordSet')
    fail('DELETE', 'RecordSet(\'abc\')')
    fail('DELETE', 'RecordSet(\'abd\')?$expand=abc')
    fail('DELETE', 'UnknownSet(\'abc\')')
    fail('DELETE', 'ApplicationSettings(application=\'Example\',version=1,setting=\'Preview\')')
  })
})
