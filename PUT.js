'use strict'

const { get, update } = require('./entity')
const { body } = require('reserve')

module.exports = async function ({ EntityClass, parsedUrl, request, response }) {
  const { key } = parsedUrl
  if (!key) {
    throw new Error('Missing key')
  }
  const entity = await get(EntityClass, request, key)
  if (!entity) {
    throw new Error('Entity not found')
  }
  await update(EntityClass, request, key, JSON.parse(await body(request)))
  response.writeHead(204, {
    'Content-Type': 'application/json',
    'Content-Length': 0
  })
  response.end()
}
