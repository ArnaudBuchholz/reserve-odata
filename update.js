'use strict'

const { get, update } = require('./entity')
const { body } = require('reserve')
const fromJSONString = require('./fromJSONString')

module.exports = compare => async function ({ EntityClass, parsedUrl, request, response }) {
  const { key } = parsedUrl
  if (!key) {
    throw new Error('Missing key')
  }
  const entity = await get(EntityClass, request, key)
  if (!entity) {
    throw new Error('Entity not found')
  }
  const properties = fromJSONString(EntityClass, await body(request))
  const updates = compare(entity, properties)
  const updated = await update(EntityClass, request, entity, updates)
  if (!updated) {
    throw new Error('Not updated')
  }
  response.writeHead(204, {
    'Content-Type': 'application/json',
    'Content-Length': 0
  })
  response.end()
}
