'use strict'

const gpf = require('gpf-js')

const mapOfJSONToSerialType = {}

const invalidType = () => { throw new Error('Invalid type') }

const checkType = type => value => {
  if (typeof value !== type) {
    invalidType()
  }
  return value
}

mapOfJSONToSerialType[gpf.serial.types.integer] = checkType('number')
mapOfJSONToSerialType[gpf.serial.types.string] = checkType('string')
mapOfJSONToSerialType[gpf.serial.types.datetime] = value => {
  try {
    const timeDigits = /\/Date\((\d+)\)\//.exec(value)[1]
    return new Date(parseInt(timeDigits, 10))
  } catch (e) {
    invalidType()
  }
}

module.exports = function fromJSONString (EntityClass, string) {
  const json = JSON.parse(string)
  const entity = {}
  const memberProperties = gpf.serial.get(EntityClass)
  Object.keys(memberProperties).forEach(member => {
    const { name, type } = memberProperties[member]
    if (Object.hasOwnProperty.call(json, name)) {
      const value = json[name]
      if (value === null) {
        entity[member] = null
      } else {
        entity[member] = mapOfJSONToSerialType[type](value)
      }
    }
  })
  return entity
}
