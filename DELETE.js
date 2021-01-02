'use strict'

const { getOrFail, delete: delete_ } = require('./entity')

module.exports = async function ({ EntityClass, mapping, parsedUrl, request, response }) {
  const { key } = parsedUrl
  if (!key) {
    throw new Error('Missing key')
  }
  const entity = await getOrFail(EntityClass, request, key)
  await delete_(EntityClass, request, entity)
  response.writeHead(204)
  response.end()
}
