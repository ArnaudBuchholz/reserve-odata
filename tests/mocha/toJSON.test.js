'use strict'

const assert = require('assert')
const Record = require('../Record')
const AppSetting = require('../AppSetting')
const toJSON = require('../../toJSON')

const referenceTime = new Date(2020, 10, 13, 22, 52, 0, 0).getTime()

describe('toJSON', () => {
  it('generates a valid JSON representation of the record', () => {
    const record = new Record('d93')
    record._modified = new Date(referenceTime)

    const json = toJSON(record, 'test')
    assert.strictEqual(json.id, 'd93')
    assert.strictEqual(json.name, 'D93')
    assert.strictEqual(json.number, 3475)
    assert.strictEqual(json.modified, `/Date(${referenceTime})/`)
    assert.ok(json.__metadata)
    assert.strictEqual(json.__metadata.type, 'test.Record')
    assert.strictEqual(json.__metadata.uri, 'RecordSet(\'d93\')')
    assert.strictEqual(Object.keys(json).length, 5)
  })

  it('supports multivaluated keys and entity set renaming', () => {
    const appSetting = new AppSetting({
      application: 'Test',
      version: 1,
      setting: 'Switch1'
    })

    const json = toJSON(appSetting, 'test')
    assert.strictEqual(json.application, 'Test')
    assert.strictEqual(json.version, 1)
    assert.strictEqual(json.setting, 'Switch1')
    assert.ok(json.__metadata)
    assert.strictEqual(json.__metadata.type, 'test.ApplicationSetting')
    assert.strictEqual(json.__metadata.uri, 'ApplicationSettings(application=\'Test\',version=1,setting=\'Switch1\')')
    assert.strictEqual(Object.keys(json).length, 4)
  })

  it('supports null date', () => {
    const record = new Record('d93')
    delete record._modified

    const json = toJSON(record, 'test')
    assert.strictEqual(json.id, 'd93')
    assert.strictEqual(json.name, 'D93')
    assert.strictEqual(json.number, 3475)
    assert.strictEqual(json.modified, null)
    assert.ok(json.__metadata)
    assert.strictEqual(json.__metadata.type, 'test.Record')
    assert.strictEqual(json.__metadata.uri, 'RecordSet(\'d93\')')
    assert.strictEqual(Object.keys(json).length, 5)
  })

  it('supports $select', () => {
    const record = new Record('d93')

    const json = toJSON(record, 'test', ['id', 'name'])
    assert.strictEqual(json.id, 'd93')
    assert.strictEqual(json.name, 'D93')
    assert.strictEqual(json.number, undefined)
    assert.strictEqual(json.modified, undefined)
    assert.ok(json.__metadata)
    assert.strictEqual(json.__metadata.type, 'test.Record')
    assert.strictEqual(json.__metadata.uri, 'RecordSet(\'d93\')')
    assert.strictEqual(Object.keys(json).length, 3)
  })

  it('supports navigationProperties (single)', () => {
    const record = new Record('d93')
    record.parent = new Record('abc')

    const json = toJSON(record, 'test')
    assert.strictEqual(Object.keys(json).length, 6)

    const parent = json.parent
    assert.strictEqual(parent.id, 'abc')
    assert.strictEqual(parent.name, 'ABC')
    assert.strictEqual(parent.number, 2748)
    assert.notStrictEqual(parent.modified, undefined)
    assert.ok(parent.__metadata)
    assert.strictEqual(parent.__metadata.type, 'test.Record')
    assert.strictEqual(parent.__metadata.uri, 'RecordSet(\'abc\')')
    assert.strictEqual(Object.keys(parent).length, 5)
  })

  it('supports navigationProperties (multiple)', () => {
    const record = new Record('d93')
    const ids = ['abc', 'abd', 'abe']
    record.children = ids.map(id => new Record(id))

    const json = toJSON(record, 'test')
    assert.strictEqual(Object.keys(json).length, 6)

    const children = json.children
    assert.ok(Array.isArray(children))
    assert.strictEqual(children.length, 3)

    ids.forEach((id, index) => {
      const child = children[index]
      assert.strictEqual(child.id, id)
      assert.strictEqual(child.name, id.toUpperCase())
      assert.strictEqual(child.number, parseInt(id, 16))
      assert.notStrictEqual(child.modified, undefined)
      assert.ok(child.__metadata)
      assert.strictEqual(child.__metadata.type, 'test.Record')
      assert.strictEqual(child.__metadata.uri, `RecordSet('${id}')`)
      assert.strictEqual(Object.keys(child).length, 5)
    })
  })
})
