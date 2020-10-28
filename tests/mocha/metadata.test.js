'use strict'

const assert = require('assert')
const handle = require('./handle.js')

describe('metadata', () => {

  it('provides entities description', handle({ request: '$metadata' })
    .then(response => {
      assert.strictEqual(response.statusCode, 200)
      const xml = response.toString()
      console.log(xml)
    })
  )
})
