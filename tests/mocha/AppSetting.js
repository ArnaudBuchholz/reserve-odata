'use strict'

const gpf = require('gpf-js')
const attribute = gpf.attributes.decorator
const Entity = require('../../attributes/Entity')
const Key = require('../../attributes/Key')
const Filterable = require('../../attributes/Filterable')
const Searchable = require('../../attributes/Searchable')
const Sortable = require('../../attributes/Sortable')

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

  get value () {
    return this._value
  }

  constructor (application, version, setting, value) {
    this._application = application
    this._version = version
    this._setting = setting
    this._value = value
  }
}

attribute(new gpf.attributes.Serializable())(AppSetting, 'application')
attribute(new Entity('ApplicationSetting', 'ApplicationSettings'))(AppSetting)
attribute(new Key())(AppSetting, 'application')
attribute(new Filterable())(AppSetting, 'application')
attribute(new gpf.attributes.Serializable({ type: gpf.serial.types.integer }))(AppSetting, 'version')
attribute(new Key())(AppSetting, 'version')
attribute(new Filterable())(AppSetting, 'version')
attribute(new Sortable())(AppSetting, 'version')
attribute(new gpf.attributes.Serializable())(AppSetting, 'setting')
attribute(new Key())(AppSetting, 'setting')
attribute(new Filterable())(AppSetting, 'setting')
attribute(new gpf.attributes.Serializable())(AppSetting, 'value')
attribute(new Searchable())(AppSetting, 'value')

module.exports = AppSetting
