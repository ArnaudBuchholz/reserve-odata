'use strict'

const Request = require('reserve/mock/Request')
const Response = require('reserve/mock/Response')
const { check } = require('reserve/mapping')
const handler = require('../../index')

module.exports = function ({ request, mapping, match, redirect }) {
  if (typeof request === 'string') {
    request = { method: 'GET', url: request }
  }
  request = new Request(request)
  const response = new Response()
  const configuration = { handler: () => { return { handler } } }
  if (!mapping) {
    mapping = {
      'data-provider-factory': require('./dataProviderFactory'),
      'service-namespace': 'test'
    }
  }
  return check(configuration, mapping)
    .then(() => handler.redirect({
      configuration,
      match,
      request,
      response,
      mapping,
      redirect: redirect || request.url
    }))
    .then(() => response)
}
