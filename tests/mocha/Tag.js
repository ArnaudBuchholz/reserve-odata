'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('../../attributes/Key')
const Searchable = require('../../attributes/Searchable')
const Sortable = require('../../attributes/Sortable')

class Tag {
  get name () {
    return this._name
  }

  get count () {
    return this._records.length
  }

  get modified () {
    return this._modified || minDate
  }

  constructor (name) {
    this._name = name
  }
}

attribute(new gpf.attributes.Serializable())(Tag, 'name')
attribute(new Key())(Tag, 'name')
attribute(new Searchable())(Tag, 'name')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.integer, readOnly: false }))(Tag, 'count')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.datetime, readOnly: false }))(Tag, 'modified')
attribute(new Sortable())(Tag, 'modified')

module.exports = Tag
