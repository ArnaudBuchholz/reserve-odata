'use strict'

const { getOrFail, update } = require('./entity')
const { body } = require('reserve')
const fromJSONString = require('./fromJSONString')

module.exports = compare => async function ({ EntityClass, parsedUrl, request, response }) {
  const { key } = parsedUrl
  if (!key) {
    throw new Error('Missing key')
  }
  const entity = await getOrFail(EntityClass, request, key)
  const properties = fromJSONString(EntityClass, await body(request))
  const updates = compare(entity, properties)
  await update(EntityClass, request, entity, updates)
  response.writeHead(204, {
    'Content-Type': 'application/json',
    'Content-Length': 0
  })
  response.end()
}
