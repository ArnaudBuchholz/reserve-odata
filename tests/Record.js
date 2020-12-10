'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Entity = require('../attributes/Entity')
const Key = require('../attributes/Key')
const Searchable = require('../attributes/Searchable')
const Sortable = require('../attributes/Sortable')
const NavigationProperty = require('../attributes/NavigationProperty')
const Tag = require('./Tag')

const entities = []

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

  get notSimplyNamedNumber () {
    return this._number
  }

  get modified () {
    return this._modified
  }

  getChildren (filter) {
    if (this._number !== 0) {
      return []
    }
    const results = entities.slice(1)
    if (filter) {
      return results.filter(gpf.createFilterFunction(filter))
    }
    return results
  }

  getParent () {
    return entities[this._parentId]
  }

  getTags () {
    return []
  }

  constructor (key) {
    this._id = key
    this._name = key.toUpperCase()
    this._number = parseInt(key, 16)
    this._modified = new Date()
  }
}

attribute(new gpf.attributes.Serializable())(Record, 'id')
attribute(new Entity('Record'))(Record)
attribute(new Key())(Record, 'id')
attribute(new gpf.attributes.Serializable())(Record, 'parentId')
attribute(new gpf.attributes.Serializable())(Record, 'name')
attribute(new Searchable())(Record, 'name')
attribute(new Sortable())(Record, 'name')
attribute(new gpf.attributes.Serializable({ name: 'number', type: gpf.serial.types.integer, readOnly: false }))(Record, 'notSimplyNamedNumber')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.datetime, readOnly: false }))(Record, 'modified')
attribute(new Sortable())(Record, 'modified')
attribute(new NavigationProperty('children', Record, '*'))(Record, 'getChildren')
attribute(new NavigationProperty('parent', Record, 1))(Record, 'getParent')
attribute(new NavigationProperty('tags', Tag, '*'))(Record, 'getTags')

Record.reset = () => {
  entities.length = 0
  for (let number = 0; number < 4000; ++number) {
    const record = new Record(Number(number).toString(16))
    if (number !== 0) {
      record._parentId = 0
    }
    entities.push(record)
  }
  entities[3475]._modified = new Date('2020-04-03T00:00:00.0000Z')
}

Record.get = (request, key) => entities[parseInt(key, 16)]

Record.list = (request, filter) => {
  if (!filter) {
    return entities
  }
  return entities.filter(gpf.createFilterFunction(filter))
}

Record.delete = (request, key) => {
  const index = parseInt(key, 16)
  if (entities[index]) {
    entities[index] = undefined
    return true
  }
  return false
}

module.exports = Record
