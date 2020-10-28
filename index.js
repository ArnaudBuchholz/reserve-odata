'use strict'

const { $dataProvider } = require('./symbols')
const metadata = require('./metadata')
const handlers = {}

handlers.GET = async ({ mapping, redirect, request, response }) => {
  if (redirect.startsWith('$metadata')) {
    metadata(...arguments)
  }
}

handlers.POST = async ({ redirect, request, response }) => {
}

handlers.DELETE = async ({ cache, redirect, response }) => {
}

module.exports = {
  async validate (mapping) {
  },
  method: Object.keys(handlers),
  async redirect ({ mapping, redirect, request, response }) {
    if (!mapping[$dataProvider]) {
      mapping[$dataProvider] = mapping['data-provider-factory']()
      // check interface
    }
    return handlers[request.method](...arguments)
  }
}
