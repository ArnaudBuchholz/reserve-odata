'use strict'

const { $dpc, $set2dpc } = require('./symbols')
const metadata = require('./metadata')
const Entity = require('./attributes/Entity')
const NavigationProperty = require('./attributes/NavigationProperty')
const parseUrl = require('./parseUrl')
const toJSON = require('./toJSON')

const jsonContentType = 'application/json'

const handlers = {}

handlers.GET = async function ({ mapping, redirect, request, response }) {
  if (redirect.startsWith('$metadata')) {
    return metadata(...arguments)
  }
  const parsedUrl = parseUrl(redirect)
  const EntityClass = mapping[$set2dpc][parsedUrl.set]
  let entities
  if (parsedUrl.key) {
    entities = [await Entity.read(EntityClass, parsedUrl.key)]
    if (parsedUrl.navigationProperties) {
      debugger
      entities = parsedUrl.navigationProperties.reduce((context, navigationPropertyName, index) => {
        let filter
        if (index === parsedUrl.navigationProperties.length - 1) {
          filter = parsedUrl.parameters.$filter
        }
        const firstEntity = context[0] // Assuming same type for all
        const navigationProperty = NavigationProperty.list(firstEntity)
          .filter(candidate => candidate.name === navigationPropertyName)[0]
        const memberName = navigationProperty.getMemberName()
        return context.reduce((result, entity) => result.concat(entity[memberName](filter)), [])
      }, entities)
    }
  } else {

  }
  entities = entities.map(entity => toJSON(entity, mapping['service-namespace'], parsedUrl.parameters.$select))
  let result
  if (parsedUrl.key && !parsedUrl.navigationProperties) {
    result = entities[0]
  } else {
    result = { results: entities }
    // paging
  }
  // expand
  const content = JSON.stringify({
    d: result
  })
  response.writeHead(200, {
    'Content-Type': jsonContentType,
    'Content-Length': content.length
  })
  response.end(content)
}

handlers.POST = async function ({ redirect, request, response }) {
}

handlers.DELETE = async function ({ cache, redirect, response }) {
}

module.exports = {
  async validate (mapping) {
  },
  method: Object.keys(handlers),
  async redirect ({ mapping, redirect, request, response }) {
    if (!mapping[$dpc]) {
      mapping[$dpc] = await mapping['data-provider-classes']()
      mapping[$set2dpc] = mapping[$dpc].reduce((mapping, EntityClass) => {
        const { setName } = Entity.names(EntityClass)
        mapping[setName] = EntityClass
        return mapping
      }, {})
    }
    return handlers[request.method](...arguments)
  }
}
