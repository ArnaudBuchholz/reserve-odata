'use strict'

const { $dpc, $set2dpc } = require('./symbols')
const entity = require('./entity')
const parseUrl = require('./parseUrl')

const handlers = {}
const methods = ['GET', 'DELETE', 'POST', 'PUT', 'MERGE']
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
      const { setName } = entity.names(EntityClass)
      mapping[setName] = EntityClass
      return mapping
    }, {})
  },
  method: methods,
  async redirect (parameters) {
    try {
      const parsedUrl = parseUrl(parameters.redirect)
      const { method } = parameters.request
      if (method !== 'GET') {
        if (parsedUrl.metadata) {
          throw new Error('Unsupported action')
        }
        if (parsedUrl.owns$parameter) {
          throw new Error('Unsupported parameter')
        }
      }
      let EntityClass
      if (!parsedUrl.metadata) {
        EntityClass = parameters.mapping[$set2dpc][parsedUrl.set]
        if (!EntityClass) {
          throw new Error('Unkown entity class')
        }
      }
      return await handlers[method]({ ...parameters, parsedUrl, EntityClass })
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
