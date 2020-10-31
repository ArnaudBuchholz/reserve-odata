'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Key = require('../../attributes/Key')
const Searchable = require('../../attributes/Searchable')
const Sortable = require('../../attributes/Sortable')

const minDate = new Date(0)

class Record {
  get id () {
    return this._id
  }

  get name () {
    return this._name || ''
  }

  get number () {
    return this._number || 0
  }

  get modified () {
    return this._modified || minDate
  }
}

attribute(new Key())(Record, 'id')
attribute(new gpf.attributes.Serializable())(Record, 'id')
attribute(new gpf.attributes.Serializable())(Record, 'name')
attribute(new Searchable())(Record, 'name')
attribute(new Sortable())(Record, 'name')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.integer, readOnly: false }))(Record, 'number')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.datetime, readOnly: false }))(Record, 'modified')
attribute(new Sortable())(Record, 'modified')

module.exports = Record
