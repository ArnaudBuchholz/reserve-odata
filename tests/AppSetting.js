'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Entity = require('../attributes/Entity')
const Key = require('../attributes/Key')
const Filterable = require('../attributes/Filterable')
const Sortable = require('../attributes/Sortable')
const NavigationProperty = require('../attributes/NavigationProperty')
const Value = require('./Value')

class AppSetting {
  get application () {
    return this._application
  }

  get version () {
    return this._version
  }

  get setting () {
    return this._setting
  }

  getValues (/* filter */) {
    const result = []
    for (let index = 0; index < this._version; ++index) {
      const value = new Value()
      value._id = `${this._application}-${this._version}-${this._setting}-${index}`
      value._value = `${this._setting}-${index}`
      result.push(value)
    }
    return result
  }

  constructor (key) {
    Object.keys(key).forEach(name => {
      this[`_${name}`] = key[name]
    }, this)
  }
}

attribute(new Entity('ApplicationSetting', 'ApplicationSettings'))(AppSetting)
attribute(new gpf.attributes.Serializable())(AppSetting, 'application')
attribute(new Key())(AppSetting, 'application')
attribute(new Filterable())(AppSetting, 'application')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.integer }))(AppSetting, 'version')
attribute(new Key())(AppSetting, 'version')
attribute(new Filterable())(AppSetting, 'version')
attribute(new Sortable())(AppSetting, 'version')
attribute(new gpf.attributes.Serializable())(AppSetting, 'setting')
attribute(new Key())(AppSetting, 'setting')
attribute(new Filterable())(AppSetting, 'setting')
attribute(new NavigationProperty('values', Value, '*'))(AppSetting, 'getValues')

AppSetting.read = (request, key) => new AppSetting(key)

module.exports = AppSetting
