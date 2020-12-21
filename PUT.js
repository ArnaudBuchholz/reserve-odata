'use strict'

const gpf = require('gpf-js')
const update = require('./update')

module.exports = update((entity, properties) => {
  const memberProperties = gpf.serial.get(entity)
  Object.keys(memberProperties).forEach(member => {
    const { type } = memberProperties[member]
    if (Object.hasOwnProperty.call(properties, member)) {
      const newValue = properties[member]
      const oldValue = entity[member]
      let diff
      if (type === gpf.serial.types.datetime) {
        diff = newValue.getTime() !== oldValue.getTime()
      } else {
        diff = newValue !== oldValue
      }
      if (!diff) {
        delete properties[member]
      }
    } else {
      properties[member] = undefined // delete
    }
  })
  return properties
})
