'use strict'

const gpf = require('gpf-js')
const Entity = require('./attributes/Entity')
const Key = require('./attributes/Key')
const { mapFilterProperties } = require('./properties')

const getAttribute = EntityClass => {
  const dictionary = gpf.attributes.get(EntityClass, Entity)
  if (dictionary.$attributes) {
    return dictionary.$attributes[0]
  }
}

const names = EntityClass => {
  const attribute = getAttribute(EntityClass)
  if (attribute) {
    return attribute
  }
  return {
    name: EntityClass.name,
    setName: `${EntityClass.name}Set`
  }
}

const list = async (EntityClass, request, filter) => {
  if (filter && EntityClass.list.length === 1) {
    return (await EntityClass.list(request)).filter(gpf.createFilterFunction(filter))
  }
  return EntityClass.list(request, filter)
}

const get = async (EntityClass, request, key) => {
  if (EntityClass.get) {
    return EntityClass.get(request, key)
  }
  const keys = Object.keys(gpf.attributes.get(EntityClass, Key))
  let filter
  if (keys.length === 1) {
    filter = { eq: [{ property: keys[0] }, key] }
  } else {
    try {
      filter = mapFilterProperties({
        and: Object.keys(key).map(property => {
          return { eq: [{ property }, key[property]] }
        })
      }, EntityClass)
    } catch (e) {
      // Key not mappable to a valid filter => 404
      return
    }
  }
  return (await list(EntityClass, request, filter))[0]
}

const cudFactory = method => {
  return async (EntityClass, request, ...parameters) => {
    if (EntityClass[method]) {
      return await EntityClass[method](request, ...parameters)
    }
    throw new Error('Not implemented')
  }
}

const cudTester = method => {
  return EntityClass => !!EntityClass[method]
}

module.exports = {
  names,
  get,
  list,
  create: cudFactory('create'),
  creatable: cudTester('create'),
  update: cudFactory('update'),
  updatable: cudTester('update'),
  delete: cudFactory('delete'),
  deletable: cudTester('delete')
}
