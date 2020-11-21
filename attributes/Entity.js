'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator

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

Entity.read = (EntityClass, key) => EntityClass.read(key)

module.exports = Entity
