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

  get name () {
    return this._name
  }

  get relationshipName () {
    return `${this.from.name}_${this.name}`
  }

  get fromRoleName () {
    return `From_${this.relationshipName}`
  }

  get toRoleName () {
    return `To_${this.relationshipName}`
  }

  constructor (name, Entity, multiplicity) {
    super()
    this._name = name
    this._to = Entity
    this._multiplicity = multiplicity
  }
}

NavigationProperty.list = EntityClass => {
  const dictionary = gpf.attributes.get(EntityClass, NavigationProperty)
  return Object.keys(dictionary).map(member => dictionary[member][0])
}

attribute(new gpf.attributes.UniqueAttribute())(NavigationProperty)

module.exports = NavigationProperty
