'use strict'

const gpf = require('gpf-js')

module.exports = function fromJSONString (EntityClass, string) {
  const json = JSON.parse(string)
  const entity = {}
  const memberProperties = gpf.serial.get(EntityClass)
  Object.keys(memberProperties).forEach(member => {
    const { name, type } = memberProperties[member]
    if (Object.hasOwnProperty.call(json, name)) {
      const value = json[name]
      if (type === gpf.serial.types.datetime) {
        const timeDigits = /\/Date\((\d+)\)\//.exec(value)[1]
        entity[member] = new Date(parseInt(timeDigits, 10))
      } else {
        entity[member] = value
      }
    }
  })
  return entity
}
