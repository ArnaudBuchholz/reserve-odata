'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('./Key')
const { mapFilterProperties } = require('../util')

class Entity extends gpf.attributes.Attribute {
  get name () {
    return this._name
  }

  get setName () {
    return this._setName
  }

  constructor (name, setName = `${name}Set`) {
    super()
    this._name = name
    this._setName = setName
  }
}

attribute(new gpf.attributes.ClassAttribute())(Entity)

const getAttribute = EntityClass => {
  const dictionary = gpf.attributes.get(EntityClass, Entity)
  if (dictionary.$attributes) {
    return dictionary.$attributes[0]
  }
}

Entity.names = EntityClass => {
  const attribute = getAttribute(EntityClass)
  if (attribute) {
    return attribute
  }
  return {
    name: EntityClass.name,
    setName: `${EntityClass.name}Set`
  }
}

Entity.get = async (EntityClass, request, key) => {
  if (EntityClass.get) {
    return EntityClass.get(request, key)
  }
  const keys = Object.keys(gpf.attributes.get(EntityClass, Key))
  let filter
  if (keys.length === 1) {
    filter = { eq: [ { property: keys[0] }, key ] }
  } else {
    filter = mapFilterProperties({
      and: Object.keys(key).map(property => {
        return { eq: [ { property }, key[property] ] }
      })
    }, EntityClass)
  }
  return (await Entity.list(EntityClass, request, filter))[0]
}

Entity.list = async (EntityClass, request, filter) => {
  if (filter && EntityClass.list.length === 1) {
    return (await EntityClass.list(request)).filter(gpf.createFilterFunction(filter))
  }
  return EntityClass.list(request, filter)
}

module.exports = Entity
