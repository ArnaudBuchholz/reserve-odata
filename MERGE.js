'use strict'

const update = require('./update')

module.exports = update((entity, jsonBody) => Object.assign(entity, jsonBody))
