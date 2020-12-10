'use strict'

const { $set2dpc } = require('./symbols')
const Entity = require('./attributes/Entity')

module.exports = async function ({ mapping, parsedUrl, request, response }) {
  if (parsedUrl.owns$parameter) {
    throw new Error('Unsupported parameter')
  }
  const EntityClass = mapping[$set2dpc][parsedUrl.set]
  if (!EntityClass) {
    throw new Error('Unkown entity class')
  }
/*
  const deleted = await Entity.delete(EntityClass, request, parsedUrl.key)
  if (!deleted) {
    throw new Error('Not deleted')
  }
  response.writeHead(204)
  response.end()
*/
}
