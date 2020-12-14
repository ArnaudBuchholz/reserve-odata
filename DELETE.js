'use strict'

const { delete: delete_ } = require('./entity')

module.exports = async function ({ EntityClass, mapping, parsedUrl, request, response }) {
  if (!parsedUrl.key) {
    throw new Error('Missing key')
  }
  const deleted = await delete_(EntityClass, request, parsedUrl.key)
  if (!deleted) {
    throw new Error('Not deleted')
  }
  response.writeHead(204)
  response.end()
}
