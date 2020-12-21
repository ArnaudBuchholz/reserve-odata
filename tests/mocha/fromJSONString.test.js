'use strict'

const assert = require('assert')
const Record = require('../Record')
const fromJSONString = require('../../fromJSONString')

const referenceTime = new Date(2020, 12, 18, 13, 30, 12, 345).getTime()

function test (EntityClass, json, expected) {
  const string = JSON.stringify(json)
  it(`${EntityClass.name} ${string}`, () => {
    const result = fromJSONString(EntityClass, string)
    const resultProperties = Object.keys(result)
    assert.strictEqual(resultProperties.length, Object.keys(expected).length)
    resultProperties.forEach(property => {
      const value = result[property]
      const expectedValue = expected[property]
      assert.strictEqual(typeof value, typeof expectedValue)
      if (value instanceof Date) {
        assert.strictEqual(value.getTime(), expectedValue.getTime())
      } else {
        assert.strictEqual(value, expectedValue)
      }
    })
  })
}

describe('fromJSONString', () => {
  test(Record, { name: 'abc' }, { name: 'abc' })
  test(Record, { number: 123 }, { notSimplyNamedNumber: 123 })
  test(Record, { modified: `/Date(${referenceTime})/` }, { modified: new Date(referenceTime) })
})
