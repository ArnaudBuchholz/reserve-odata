'use strict'

const gpf = require('gpf-js')
const Entity = require('./attributes/Entity')
const Key = require('./attributes/Key')

const mapOfSerialTypeToJSON = {
  integer: value => value,
  string: value => `'${encodeURIComponent(value)}'`
}

function getKeys (entity) {
  const EntityClass = entity.constructor
  const serialProperties = gpf.serial.get(EntityClass)
  return Object.keys(gpf.attributes.get(EntityClass, Key)).map(name => serialProperties[name])
}

module.exports = (entity, namespace) => {
  const json = gpf.serial.toRaw(entity, (value, property) => {
    if (gpf.serial.types.datetime === property.type) {
      if (value) {
        return '/Date(' + value.getTime() + ')/'
      }
      return null
    }
    return value
  })

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

  const { name: entityName, setName: entitySetName } = Entity.names(entity.constructor)
  json.__metadata = {
    uri: `${entitySetName}(${uriKey})`,
    type: `${namespace}.${entityName}`
  }

  return json
}
