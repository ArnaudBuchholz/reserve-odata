'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Entity = require('../attributes/Entity')
const Key = require('../attributes/Key')
const Sortable = require('../attributes/Sortable')

class Value {
  get id () {
    return this._id
  }

  get value () {
    return this._value
  }

  get modified () {
    return this._modified
  }
}

attribute(new Entity('Value', 'Values'))(Value)
attribute(new gpf.attributes.Serializable())(Value, 'id')
attribute(new Key())(Value, 'id')
attribute(new gpf.attributes.Serializable())(Value, 'value')
attribute(new Sortable())(Value, 'value')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.datetime, readOnly: false }))(Value, 'modified')
attribute(new Sortable())(Value, 'modified')

module.exports = Value
