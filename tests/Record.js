'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Entity = require('../attributes/Entity')
const Key = require('../attributes/Key')
const Searchable = require('../attributes/Searchable')
const Sortable = require('../attributes/Sortable')
const NavigationProperty = require('../attributes/NavigationProperty')
const Tag = require('./Tag')

class Record {
  get id () {
    return this._id
  }

  get parentId () {
    return this._parentId
  }

  get name () {
    return this._name
  }

  get number () {
    return this._number
  }

  get modified () {
    return this._modified
  }

  getChildren () {
  }

  getParent () {
  }

  getTags () {
  }
}

attribute(new gpf.attributes.Serializable())(Record, 'id')
attribute(new Entity('Record'))(Record)
attribute(new Key())(Record, 'id')
attribute(new gpf.attributes.Serializable())(Record, 'parentId')
attribute(new gpf.attributes.Serializable())(Record, 'name')
attribute(new Searchable())(Record, 'name')
attribute(new Sortable())(Record, 'name')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.integer, readOnly: false }))(Record, 'number')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.datetime, readOnly: false }))(Record, 'modified')
attribute(new Sortable())(Record, 'modified')
attribute(new NavigationProperty('children', Record, '*'))(Record, 'getChildren')
attribute(new NavigationProperty('parent', Record, 1))(Record, 'getParent')
attribute(new NavigationProperty('tags', Tag, '*'))(Record, 'buildContent')

Record.read = key => {
  const record = new Record()
  record._id = key
  record._name = key.toUpperCase()
  record._number = parseInt(key, 16)
  record._modified = new Date()
  return record
}

module.exports = Record
