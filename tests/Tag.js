'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('../attributes/Key')
const Sortable = require('../attributes/Sortable')

class Tag {
  get name () {
    return this._name
  }

  get count () {
    return 0
  }

  get modified () {
    return this._modified
  }

  constructor (name) {
    this._name = name
    this._modified = new Date()
  }
}

attribute(new gpf.attributes.Serializable())(Tag, 'name')
attribute(new Key())(Tag, 'name')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.integer, readOnly: false }))(Tag, 'count')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.datetime, readOnly: false }))(Tag, 'modified')
attribute(new Sortable())(Tag, 'modified')

const entities = [
  new Tag('new'),
  new Tag('obsolete')
]

Tag.list = request => {
  return entities
}

module.exports = Tag
