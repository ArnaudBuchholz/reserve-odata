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

    describe('expand', () => {
      [0, 1, 2, 5].forEach(count =>
        test(`ApplicationSettings(application='Example',version=${count},setting='Preview')?$expand=values`, response => {
          const entity = JSON.parse(response.toString()).d
          assert.strictEqual(entity.application, 'Example')
          assert.strictEqual(entity.version, count)
          assert.strictEqual(entity.setting, 'Preview')
          assert.ok(entity.__metadata)
          assert.strictEqual(entity.__metadata.type, 'test.ApplicationSetting')
          assert.strictEqual(entity.__metadata.uri, `ApplicationSettings(application='Example',version=${count},setting='Preview')`)
          const entities = entity.values
          assert.strictEqual(entities.length, count)
          entities.forEach((entity, index) => {
            assert.strictEqual(entity.id, `Example-${count}-Preview-${index}`)
            assert.strictEqual(entity.value, `Preview-${index}`)
            assert.ok(entity.__metadata)
            assert.strictEqual(entity.__metadata.type, 'test.Value')
            assert.strictEqual(entity.__metadata.uri, `Values('Example-${count}-Preview-${index}')`)
            assert.strictEqual(Object.keys(entity).length, 4)
          })
          assert.strictEqual(Object.keys(entity).length, 5)
        })
      )
    })
  })

  describe('navigation properties', () => {
    [0, 1, 2, 5].forEach(count =>
      test(`ApplicationSettings(application='Example',version=${count},setting='Preview')/values`, response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, count)
        entities.forEach((entity, index) => {
          assert.strictEqual(entity.id, `Example-${count}-Preview-${index}`)
          assert.strictEqual(entity.value, `Preview-${index}`)
          assert.ok(entity.__metadata)
          assert.strictEqual(entity.__metadata.type, 'test.Value')
          assert.strictEqual(entity.__metadata.uri, `Values('Example-${count}-Preview-${index}')`)
          assert.strictEqual(Object.keys(entity).length, 4)
        })
      })
    )
  })
})
