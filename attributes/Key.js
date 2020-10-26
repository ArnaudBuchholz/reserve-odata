'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator

class Key extends gpf.attributes.Attribute {
}

attribute(new gpf.attributes.MemberAttribute())(Key)

module.exports = Key
