'use strict'

const { $dpc, $set2dpc } = require('./symbols')
const entity = require('./entity')
const parseUrl = require('./parseUrl')

const handlers = {}
const methods = ['GET', 'DELETE', 'POST', 'PUT', 'MERGE']
methods.forEach(method => {
  handlers[method] = require(`./${method}`)
})

function checkMethodUrl (method, parsedUrl) {
  if (method !== 'GET') {
    if (parsedUrl.metadata) {
      throw new Error('Unsupported action')
    }
    if (parsedUrl.owns$parameter) {
      throw new Error('Unsupported parameter')
    }
  }
}

function checkEntityClass (mapping, parsedUrl) {
  if (!parsedUrl.metadata) {
    const EntityClass = mapping[$set2dpc][parsedUrl.set]
    if (!EntityClass) {
      throw new Error('Unkown entity class')
    }
    return EntityClass
  }
}

function checkMethodAndUrl (parameters) {
  const { method } = parameters.request
  const parsedUrl = parseUrl(parameters.redirect)
  checkMethodUrl(method, parsedUrl)
  const EntityClass = checkEntityClass(parameters.mapping, parsedUrl)
  return { method, parsedUrl, EntityClass }
}

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
      const { method, parsedUrl, EntityClass } = checkMethodAndUrl(parameters)
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
