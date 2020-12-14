'use strict'

const { update } = require('./entity')
const { body } = require('reserve')

module.exports = async function ({ EntityClass, parsedUrl, request, response }) {
  if (!parsedUrl.key) {
    throw new Error('Missing key')
  }
  await update(EntityClass, request, parsedUrl.key, JSON.parse(await body(request)))
  response.writeHead(204, {
    'Content-Type': 'application/json',
    'Content-Length': 0
  })
  response.end()
}
