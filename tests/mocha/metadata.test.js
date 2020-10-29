'use strict'

const assert = require('assert')
const handle = require('./handle.js')

describe('metadata', () => {
  it('provides entities description', handle({ request: '$metadata' })
    .then(response => {
      const xml = response.toString()
      console.log(`$metadata: ${xml}`)
      assert.strictEqual(response.statusCode, 200)
    })
  )
})
