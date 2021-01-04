'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Entity = require('../attributes/Entity')
const Key = require('../attributes/Key')
const Sortable = require('../attributes/Sortable')
const Filterable = require('../attributes/Filterable')
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
attribute(new Sortable())(Record, 'id')
attribute(new gpf.attributes.Serializable())(Record, 'parentId')
attribute(new gpf.attributes.Serializable())(Record, 'name')
attribute(new Filterable())(Record, 'name')
attribute(new Sortable())(Record, 'name')
attribute(new gpf.attributes.Serializable({ name: 'number', type: gpf.serial.types.integer, readOnly: false }))(Record, 'notSimplyNamedNumber')
attribute(new Filterable())(Record, 'notSimplyNamedNumber')
attribute(new Sortable())(Record, 'notSimplyNamedNumber')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.datetime, readOnly: false }))(Record, 'modified')
attribute(new Filterable())(Record, 'modified')
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

Record.create = (request, entity) => {
  const index = parseInt(entity.name, 16)
  if (entities[index]) {
    throw new Error('Already exist')
  }
  const record = new Record(entity.name.toLowerCase())
  if (entity.modified) {
    record._modified = entity.modified
  }
  entities[index] = record
  return record
}

Record.update = (request, entity, updates) => {
  if (updates.name === 'fail') {
    throw new Error('Unsupported')
  }
  Object.keys(updates)
    .filter(name => !['id', 'parentId'].includes(name))
    .forEach(name => {
      const value = updates[name]
      if (value === undefined) {
        delete entity[`_${name}`]
      } else {
        entity[`_${name}`] = value
      }
    })
}

Record.delete = (request, entity) => {
  const index = parseInt(entity.id, 16)
  entities[index] = undefined
}

module.exports = Record
