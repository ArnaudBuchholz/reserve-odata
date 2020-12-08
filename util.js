'use strict'

const gpf = require('gpf-js')

const getNamedProperties = entity => {
  const memberProperties = gpf.serial.get(entity)
  return Object.keys(memberProperties).reduce((dictionary, member) => {
    const property = memberProperties[member]
    property.member = member
    dictionary[property.name] = property
    return dictionary
  }, {})
}

const mapFilterProperties = (filter, EntityClass) => {
  const namedProperties = getNamedProperties(EntityClass)
  function map (filterItem) {
    if (filterItem.property) {
      filterItem.property = namedProperties[filterItem.property].member
    }
    Object.keys(filterItem).forEach(property => {
      const value = filterItem[property]
      if (Array.isArray(value)) {
        value.forEach(map)
      }
    })
  }
  if (filter) {
    map(filter)
  }
  return filter
}

module.exports = {
  getNamedProperties,
  mapFilterProperties
}
