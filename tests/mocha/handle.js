'use strict'

const assert = require('assert')
const Request = require('reserve/mock/Request')
const Response = require('reserve/mock/Response')
const { check } = require('reserve/mapping')
const handler = require('../../index')

const Tag = require('../Tag')
const Record = require('../Record')
const AppSetting = require('../AppSetting')
const Value = require('../Value')

function handle ({
  request,
  classes = [Tag, Record, AppSetting, Value],
  serviceNamespace = 'test',
  useSapExtension = true,
  reset = true
}) {
  if (typeof request === 'string') {
    request = { method: 'GET', url: request }
  }
  request = new Request(request)
  const response = new Response()
  const configuration = { handler: () => { return { handler } } }
  const mapping = {
    'data-provider-classes': () => classes,
    'service-namespace': serviceNamespace,
    'use-sap-extension': useSapExtension
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

const test = (method, url, callback) => {
  if (callback === undefined) {
    callback = url
    url = method
    method = 'GET'
  } else if (url === undefined) {
    url = method
    method = 'GET'
  }
  it(`${method} ${url}`, () => handle({ request: { method, url } }).then(callback))
}

const notFound = (url) => {
  test('GET', url, response => assert.strictEqual(response.statusCode, 404))
}

const fail = (method, url) => {
  test(method, url, response => assert.strictEqual(response.statusCode, 500))
}

const reset = () => {
  [Tag, Record, AppSetting, Value].forEach(EntityClass => {
    if (EntityClass.reset) {
      EntityClass.reset()
    }
  })
}

module.exports = {
  handle,
  test,
  notFound,
  fail,
  reset
}
