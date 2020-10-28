'use strict'

const Record = require('./Record')

module.exports = () => {
  return {
    async getEntityClasses () {
      return [Record]
    }
  }
}
