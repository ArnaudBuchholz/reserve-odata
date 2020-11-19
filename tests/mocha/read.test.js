'use strict'

const assert = require('assert')
const handle = require('./handle.js')

const test = (url, callback) => it(url, () => handle({ request: url }).then(callback))

describe('read', () => {
  describe('single entity access', () => {
    test('RecordSet(\'abc\')', response => {
      assert.strictEqual(response.statusCode, 200)
      const entity = JSON.parse(response.toString()).d
      assert.strictEqual(entity.id, 'abc')
      assert.strictEqual(entity.name, 'ABC')
      assert.strictEqual(entity.number, 2748)
      assert.notStrictEqual(entity.modified, undefined)
      assert.ok(entity.__metadata)
      assert.strictEqual(entity.__metadata.type, 'test.Record')
      assert.strictEqual(entity.__metadata.uri, 'RecordSet(\'abc\')')
      assert.strictEqual(Object.keys(entity).length, 5)
    })

    test('RecordSet(\'abc\')?$select=id,name', response => {
      assert.strictEqual(response.statusCode, 200)
      const entity = JSON.parse(response.toString()).d
      assert.strictEqual(entity.id, 'abc')
      assert.strictEqual(entity.name, 'ABC')
      assert.strictEqual(entity.number, undefined)
      assert.strictEqual(entity.modified, undefined)
      assert.ok(entity.__metadata)
      assert.strictEqual(entity.__metadata.type, 'test.Record')
      assert.strictEqual(entity.__metadata.uri, 'RecordSet(\'abc\')')
      assert.strictEqual(Object.keys(entity).length, 3)
    })

    test('ApplicationSettings(application=\'Example\',version=1,setting=\'Preview\')', response => {
      assert.strictEqual(response.statusCode, 200)
      const entity = JSON.parse(response.toString()).d
      assert.strictEqual(entity.application, 'Example')
      assert.strictEqual(entity.version, 1)
      assert.strictEqual(entity.setting, 'Preview')
      assert.ok(entity.__metadata)
      assert.strictEqual(entity.__metadata.type, 'test.ApplicationSetting')
      assert.strictEqual(entity.__metadata.uri, 'ApplicationSettings(application=\'Example\',version=1,setting=\'Preview\')')
      assert.strictEqual(Object.keys(entity).length, 4)
    })
  })

  describe('navigation properties', () => {
    test('ApplicationSettings(application=\'Example\',version=1,setting=\'Preview\')/values', response => {
      assert.strictEqual(response.statusCode, 200)
      const entities = JSON.parse(response.toString()).d.results
      assert.strictEqual(entities.length, 1)
      const entity = entities[0]
      assert.strictEqual(entity.id, 'Example-1-Preview-0')
      assert.strictEqual(entity.value, 'Preview-0')
      assert.ok(entity.__metadata)
      assert.strictEqual(entity.__metadata.type, 'test.Value')
      assert.strictEqual(entity.__metadata.uri, 'Values(\'Example-1-Preview\')')
      assert.strictEqual(Object.keys(entity).length, 3)
    })
  })
})
