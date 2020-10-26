'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator

class Filterable extends gpf.attributes.Attribute {
}

attribute(new gpf.attributes.MemberAttribute())(Filterable)

module.exports = Filterable
