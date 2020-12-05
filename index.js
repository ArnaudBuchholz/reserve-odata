'use strict'

const { $dpc, $set2dpc } = require('./symbols')
const Entity = require('./attributes/Entity')

const handlers = {}
handlers.GET = require('./GET')
handlers.POST = async function ({ redirect, request, response }) {
}
handlers.DELETE = async function ({ cache, redirect, response }) {
}

module.exports = {
  schema: {
    [$dpc]: ['function', 'string'],
    'use-sap-extension': {
      type: 'boolean',
      defaultValue: false
    },
    'service-namespace': {
      type: 'string',
      defaultValue: 'ODATANS'
    }
  },
  async validate (mapping) {
    const dpc = mapping[$dpc]
    if (typeof dpc === 'string') {
      mapping[$dpc] = await require(dpc)()
    } else {
      mapping[$dpc] = await mapping['data-provider-classes']()
    }
    mapping[$set2dpc] = mapping[$dpc].reduce((mapping, EntityClass) => {
      const { setName } = Entity.names(EntityClass)
      mapping[setName] = EntityClass
      return mapping
    }, {})
  },
  method: Object.keys(handlers),
  async redirect ({ mapping, request, response }) {
    try {
      return await handlers[request.method](...arguments)
    } catch (e) {
      response.writeHead(500, {
        'Content-Type': 'application/json',
        'Content-Length': 2
      })
      response.end('{}')
    }
  }
}
