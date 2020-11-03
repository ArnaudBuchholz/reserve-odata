'use strict'

const Request = require('reserve/mock/Request')
const Response = require('reserve/mock/Response')
const { check } = require('reserve/mapping')
const handler = require('../../index')

const Tag = require('./Tag')
const Record = require('./Record')

module.exports = function ({ request, classes = [Tag, Record], useSapExtension = true }) {
  if (typeof request === 'string') {
    request = { method: 'GET', url: request }
  }
  request = new Request(request)
  const response = new Response()
  const configuration = { handler: () => { return { handler } } }
  const mapping = {
    'data-provider-classes': () => classes,
    'service-namespace': 'test'
  }
  return check(configuration, mapping)
    .then(() => handler.redirect({
      configuration,
      match: [],
      request,
      response,
      mapping,
      redirect: request.url
    }))
    .then(() => response)
}
