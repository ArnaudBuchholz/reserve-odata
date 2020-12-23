'use strict'

const gpf = require('gpf-js')
const { names } = require('./entity')
const Key = require('./attributes/Key')
const NavigationProperty = require('./attributes/NavigationProperty')

const mapOfSerialTypeToJSON = {}
mapOfSerialTypeToJSON[gpf.serial.types.integer] = value => value
mapOfSerialTypeToJSON[gpf.serial.types.string] = value => `'${encodeURIComponent(value)}'`

function getKeys (entity) {
  const EntityClass = entity.constructor
  const serialProperties = gpf.serial.get(EntityClass)
  return Object.keys(gpf.attributes.get(EntityClass, Key)).map(name => serialProperties[name])
}

module.exports = function toJSON (entity, namespace, select = []) {
  let propertiesFoundInSelect = 0
  const json = gpf.serial.toRaw(entity, (value, { name, type }) => {
    if (select.includes(name)) {
      ++propertiesFoundInSelect
    }
    if (type === gpf.serial.types.datetime) {
      if (value) {
        return '/Date(' + value.getTime() + ')/'
      }
      return null
    }
    return value
  })

  // While waiting for https://github.com/ArnaudBuchholz/gpf-js/issues/332
  if (select.length) {
    if (propertiesFoundInSelect !== select.length) {
      throw new Error('Unknown select property')
    }
    Object.keys(json).forEach(property => {
      if (!select.includes(property)) {
        delete json[property]
      }
    })
  }

  const uriKey = getKeys(entity)
    .map(property => {
      return {
        name: property.name,
        value: mapOfSerialTypeToJSON[property.type](json[property.name])
      }
    })
    .map((pair, index, keys) => keys.length === 1
      ? pair.value
      : `${pair.name}=${pair.value}`
    )
    .join(',')

  const { name: entityName, setName: entitySetName } = names(entity.constructor)
  json.__metadata = {
    uri: `${entitySetName}(${uriKey})`,
    type: `${namespace}.${entityName}`
  }

  NavigationProperty.list(entity)
    .forEach(navigationProperty => {
      const name = navigationProperty.name
      const value = entity[name]
      if (Array.isArray(value)) {
        json[name] = value.map(item => toJSON(item, namespace))
      } else if (value) {
        json[name] = toJSON(value, namespace)
      }
    })

  return json
}
