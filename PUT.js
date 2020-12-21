'use strict'

const gpf = require('gpf-js')
const update = require('./update')

module.exports = update((entity, properties) => {
  const memberProperties = gpf.serial.get(entity)
  Object.keys(memberProperties).forEach(member => {
    if (!Object.hasOwnProperty.call(properties, member)) {
      properties[member] = undefined // delete
    }
  })
  return properties
})
