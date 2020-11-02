'use strict'

const { $dpc } = require('./symbols')
const metadata = require('./metadata')
const handlers = {}

handlers.GET = async function ({ mapping, redirect, request, response }) {
  if (redirect.startsWith('$metadata')) {
    return metadata(...arguments)
  }
}

handlers.POST = async function ({ redirect, request, response }) {
}

handlers.DELETE = async function ({ cache, redirect, response }) {
}

module.exports = {
  async validate (mapping) {
  },
  method: Object.keys(handlers),
  async redirect ({ mapping, redirect, request, response }) {
    if (!mapping[$dpc]) {
      mapping[$dpc] = await mapping['data-provider-classes']()
      // check interface
    }
    return handlers[request.method](...arguments)
  }
}
