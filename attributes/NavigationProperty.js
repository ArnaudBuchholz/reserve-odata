'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator

class NavigationProperty extends gpf.attributes.Attribute {
  get from () {
    return this.getClassConstructor()
  }

  get to () {
    return this._to
  }

  get multiplicity () {
    return this._multiplicity
  }

  get principal () {
    return this._principal
  }

  get dependent () {
    return this._dependent
  }

  on (mapping) {
    this._principal = Object.keys(mapping)[0]
    this._dependent = mapping[this._principal]
    return this
  }

  get name () {
    return `to${this._to.name}`
  }

  get relationshipName () {
    return `${this.from.name}To${this.to.name}`
  }

  get fromRoleName () {
    return `FromRole_${this.from.name}To${this.to.name}`
  }

  get toRoleName () {
    return `ToRole_${this.from.name}To${this.to.name}`
  }

  constructor (Entity, multiplicity = '*') {
    super()
    this._to = Entity
    this._multiplicity = multiplicity
    this._principal = ''
    this._dependent = ''
  }
}

NavigationProperty.list = EntityClass => {
  const dictionary = gpf.attributes.get(EntityClass, NavigationProperty)
  return Object.keys(dictionary).map(name => dictionary[name][0])
}

attribute(new gpf.attributes.UniqueAttribute())(NavigationProperty)

module.exports = NavigationProperty
