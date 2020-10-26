'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator

class Sortable extends gpf.attributes.Attribute {
}

attribute(new gpf.attributes.MemberAttribute())(Sortable)

module.exports = Sortable
