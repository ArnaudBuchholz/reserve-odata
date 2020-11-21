'use strict'

const { $dpc, $set2dpc } = require('./symbols')
const Entity = require('./attributes/Entity')

const handlers = {}
handlers.GET = require('./GET')
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
      mapping[$set2dpc] = mapping[$dpc].reduce((mapping, EntityClass) => {
        const { setName } = Entity.names(EntityClass)
        mapping[setName] = EntityClass
        return mapping
      }, {})
    }
    return handlers[request.method](...arguments)
  }
}
