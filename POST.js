'use strict'

const { $set2dpc } = require('./symbols')
const Entity = require('./attributes/Entity')
const { body } = require('reserve')
const toJSON = require('./toJSON')

module.exports = async function ({ mapping, parsedUrl, request, response }) {
  if (parsedUrl.owns$parameter) {
    throw new Error('Unsupported parameter')
  }
  const EntityClass = mapping[$set2dpc][parsedUrl.set]
  if (!EntityClass) {
    throw new Error('Unkown entity class')
  }
  const definition = JSON.parse(await body(request))
  const entity = Entity.create(EntityClass, request, definition)
  const d = toJSON(entity, mapping['service-namespace'])
  const content = JSON.stringify({ d })
  response.writeHead(201, {
    'Content-Type': 'application/json',
    'Content-Length': content.length
  })
  response.end(content)
}
