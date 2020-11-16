'use strict'

const { $dpc, $set2dpc } = require('./symbols')
const metadata = require('./metadata')
const Entity = require('./attributes/Entity')
const parseUrl = require('./parseUrl')

const handlers = {}

handlers.GET = async function ({ mapping, redirect, request, response }) {
  if (redirect.startsWith('$metadata')) {
    return metadata(...arguments)
  }
  const parsedUrl = parseUrl(redirect)
  const EntityClass = mapping[$set2dpc](parsedUrl.set)
  if (parsedUrl.key) {

    // navigationProperties
  } else {
    
  }
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
