'use strict'

const { $dpc, $set2dpc } = require('./symbols')
const metadata = require('./metadata')
const Entity = require('./attributes/Entity')
const parseUrl = require('./parseUrl')
const toJSON = require('./toJSON')

const jsonContentType = 'application/json'

const handlers = {}

handlers.GET = async function ({ mapping, redirect, request, response }) {
  if (redirect.startsWith('$metadata')) {
    return metadata(...arguments)
  }
  const parsedUrl = parseUrl(redirect)
  const EntityClass = mapping[$set2dpc](parsedUrl.set)
  let entities
  if (parsedUrl.key) {
    entities = [EntityClass.read(parsedUrl.key)]
    // navigationProperties
  } else {

  }
  entities = entities.map(entity => toJSON(entity, mapping['service-namespace'], parsedUrl.parameters.$select))
  // expand
  let result
  if (parsedUrl.key) {
    result = entities[0]
  }
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
