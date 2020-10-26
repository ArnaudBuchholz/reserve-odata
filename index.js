'use strict'

const handlers = {}

handlers.GET = async ({ redirect, request, response }) => {
}

handlers.POST = async ({ redirect, request, response }) => {
}

handlers.DELETE = async ({ cache, redirect, response }) => {
}

module.exports = {
  async validate (mapping) {
  },
  method: Object.keys(handlers),
  async redirect ({ mapping, match, redirect, request, response }) {
  }
}
