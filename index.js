'use strict'

const { $dpc, $set2dpc } = require('./symbols')
const Entity = require('./attributes/Entity')
const parseUrl = require('./parseUrl')

const handlers = {}
const methods = ['GET', 'DELETE']
methods.forEach(method => {
  handlers[method] = require(`./${method}`)
})

module.exports = {
  schema: {
    'data-provider-classes': ['function', 'string'],
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
    const dpc = mapping['data-provider-classes']
    /* istanbul ignore else */
    if (typeof dpc === 'function') {
      mapping[$dpc] = await dpc()
    } else {
      mapping[$dpc] = await require(dpc)()
    }
    mapping[$set2dpc] = mapping[$dpc].reduce((mapping, EntityClass) => {
      const { setName } = Entity.names(EntityClass)
      mapping[setName] = EntityClass
      return mapping
    }, {})
  },
  method: methods,
  async redirect (parameters) {
    try {
      parameters.parsedUrl = parseUrl(parameters.redirect)
      return await handlers[parameters.request.method](parameters)
    } catch (e) {
      const { response } = parameters
      response.writeHead(500, {
        'Content-Type': 'application/json',
        'Content-Length': 2
      })
      response.end('{}')
    }
  }
}
