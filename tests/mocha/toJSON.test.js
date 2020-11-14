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
    const json = toJSON(record, 'test')
    assert.strictEqual(json.id, '123')
    assert.strictEqual(json.name, 'Test')
    assert.strictEqual(json.number, 3475)
    assert.strictEqual(json.modified, `/Date(${referenceTime})/`)
    assert.ok(json.__metadata)
    assert.strictEqual(json.__metadata.type, 'test.Record')
    assert.strictEqual(json.__metadata.uri, 'Record(\'123\')')
  })
})  
