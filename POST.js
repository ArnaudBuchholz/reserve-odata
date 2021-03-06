'use strict'

const { create } = require('./entity')
const { body } = require('reserve')
const toJSON = require('./toJSON')
const fromJSONString = require('./fromJSONString')

module.exports = async function ({ EntityClass, mapping, request, response }) {
  const entity = await create(EntityClass, request, fromJSONString(EntityClass, await body(request)))
  const d = toJSON(entity, mapping['service-namespace'])
  const content = JSON.stringify({ d })
  response.writeHead(201, {
    'Content-Type': 'application/json',
    'Content-Length': content.length
  })
  response.end(content)
}
