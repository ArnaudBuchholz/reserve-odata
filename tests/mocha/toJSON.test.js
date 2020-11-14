'use strict'

const assert = require('assert')
const Record = require('./Record')
const toJSON = require('../../toJSON')

const referenceTime = new Date(2020,10,13,22,52,0,0).getTime()

describe('toJSON', () => {
  let record

  before(() => {
    record = new Record()
    record._id = '123'
    record._name = 'Test'
    record._number = 3475
    record._modified = new Date(referenceTime)
  })

  it('generates a valid JSON representation of the record', () => {
    const json = toJSON(record)
    assert.strictEqual(record.id, '123')
    assert.strictEqual(record.name, 'Test')
    assert.strictEqual(record.number, 3475)
    assert.strictEqual(record.modified, `/Date(${referenceTime})/`)
    assert.ok(record.__metadata)
  })
})  
