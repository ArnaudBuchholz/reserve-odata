'use strict'

const parseUrl = require('./parseUrl')
const { $set2dpc } = require('./symbols')
const Entity = require('./attributes/Entity')

module.exports = async function ({ mapping, redirect, request, response }) {
  const parsedUrl = parseUrl(redirect)
  if (!parsedUrl.key) {
    throw new Error('Missing key')
  }
  const EntityClass = mapping[$set2dpc][parsedUrl.set]
  if (!EntityClass) {
    throw new Error('Unkown entity class')
  }
  const deleted = await Entity.delete(EntityClass, request, parsedUrl.key)
  if (!deleted) {
    throw new Error('Not deleted')
  }
  response.writeHead(204)
  response.end()
}
