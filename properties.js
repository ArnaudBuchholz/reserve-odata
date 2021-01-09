'use strict'

const gpf = require('gpf-js')
const Key = require('./attributes/Key')
const Filterable = require('./attributes/Filterable')
const Sortable = require('./attributes/Sortable')

function getNamedProperties (entity) {
  const memberProperties = gpf.serial.get(entity)
  return Object.keys(memberProperties).reduce((dictionary, member) => {
    const property = memberProperties[member]
    property.member = member
    dictionary[property.name] = property
    return dictionary
  }, {})
}

function mapFilterPropertiesOnItem (namedProperties, filterable, filterItem) {
  if (filterItem.property) {
    filterItem.property = namedProperties[filterItem.property].member
    if (!filterable.includes(filterItem.property)) {
      throw new Error('Filtering on non Filterable property')
    }
  }
  Object.keys(filterItem).forEach(property => {
    const value = filterItem[property]
    if (Array.isArray(value)) {
      value.forEach(mapFilterPropertiesOnItem.bind(null, namedProperties, filterable))
    }
  })
}

function mapFilterProperties (filter, EntityClass) {
  const namedProperties = getNamedProperties(EntityClass)
  const filterable = Object.keys(gpf.attributes.get(EntityClass, Key)).concat(Object.keys(gpf.attributes.get(EntityClass, Filterable)))
  if (filter) {
    mapFilterPropertiesOnItem(namedProperties, filterable, filter)
  }
  return filter
}

function mapOrderByProperties (orderby, EntityClass) {
  const namedProperties = getNamedProperties(EntityClass)
  const sortable = Object.keys(gpf.attributes.get(EntityClass, Sortable))
  orderby.forEach(orderItem => {
    const property = namedProperties[orderItem.property]
    orderItem.property = property.member
    if (!sortable.includes(orderItem.property)) {
      throw new Error('Sorting on non Sortable property')
    }
    if (property.type === gpf.serial.types.string) {
      orderItem.type = 'string'
    }
  })
  return orderby
}

module.exports = {
  mapFilterProperties,
  mapOrderByProperties
}
