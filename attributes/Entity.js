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

module.exports = Entity
