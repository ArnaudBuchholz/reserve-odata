'use strict'

const Request = require('reserve/mock/Request')
const Response = require('reserve/mock/Response')
const { check } = require('reserve/mapping')
const handler = require('../../index')

const Record = require('./Record')

module.exports = function ({ request }) {
  if (typeof request === 'string') {
    request = { method: 'GET', url: request }
  }
  request = new Request(request)
  const response = new Response()
  const configuration = { handler: () => { return { handler } } }
  const dataProvider = {
    async getEntityClasses () {
      return [Record]
    }
  }
  const mapping = {
    'data-provider-factory': () => dataProvider,
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
