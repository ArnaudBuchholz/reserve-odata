'use strict'

const assert = require('assert')
const { test, notFound, fail, reset } = require('./handle.js')

describe('read', () => {
  function isRecord (entity, key) {
    let id
    let number
    if (typeof key === 'string') {
      id = key
      number = parseInt(id, 16)
    } else {
      id = Number(key).toString(16)
      number = key
    }
    assert.strictEqual(entity.id, id)
    if (number !== 0) {
      assert.strictEqual(entity.parentId, 0)
    }
    assert.strictEqual(entity.name, id.toUpperCase())
    assert.strictEqual(entity.number, number)
    assert.strictEqual(typeof entity.modified, 'string')
    assert.ok(entity.modified.match(/\/Date\(\d+\)\//))
    assert.ok(entity.__metadata)
    assert.strictEqual(entity.__metadata.type, 'test.Record')
    assert.strictEqual(entity.__metadata.uri, `RecordSet('${id}')`)
    if (number === 0) {
      assert.strictEqual(Object.keys(entity).length, 5)
    } else {
      assert.strictEqual(Object.keys(entity).length, 6)
    }
  }

  function isApplicationSetting (entity, { application, version, setting }) {
    assert.strictEqual(entity.application, application)
    assert.strictEqual(entity.version, version)
    assert.strictEqual(entity.setting, setting)
    assert.ok(entity.__metadata)
    assert.strictEqual(entity.__metadata.type, 'test.ApplicationSetting')
    assert.strictEqual(entity.__metadata.uri, `ApplicationSettings(application='${application}',version=${version},setting='${setting}')`)
  }

  function isValue (entity, { application, version, setting, index }) {
    assert.strictEqual(entity.id, `${application}-${version}-${setting}-${index}`)
    assert.strictEqual(entity.value, `${setting}-${index}`)
    assert.ok(entity.__metadata)
    assert.strictEqual(entity.__metadata.type, 'test.Value')
    assert.strictEqual(entity.__metadata.uri, `Values('${application}-${version}-${setting}-${index}')`)
    assert.strictEqual(Object.keys(entity).length, 4)
  }

  before(reset)

  describe('single entity', () => {
    test('RecordSet(\'abc\')', response => {
      assert.strictEqual(response.statusCode, 200)
      const entity = JSON.parse(response.toString()).d
      isRecord(entity, 'abc')
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
      isApplicationSetting(entity, {
        application: 'Example',
        version: 1,
        setting: 'Preview'
      })
    })

    test('TagSet(\'new\')', response => {
      assert.strictEqual(response.statusCode, 200)
      const entity = JSON.parse(response.toString()).d
      assert.strictEqual(entity.name, 'new')
      assert.strictEqual(entity.count, 0)
    })

    describe('expand', () => {
      [0, 1, 2, 5].forEach(count =>
        test(`ApplicationSettings(application='Example',version=${count},setting='Preview')?$expand=values`, response => {
          const entity = JSON.parse(response.toString()).d
          isApplicationSetting(entity, {
            application: 'Example',
            version: count,
            setting: 'Preview'
          })
          const entities = entity.values
          assert.strictEqual(entities.length, count)
          entities.forEach((entity, index) => {
            isValue(entity, {
              application: 'Example',
              version: count,
              setting: 'Preview',
              index
            })
          })
          assert.strictEqual(Object.keys(entity).length, 5)
        })
      )
    })

    describe('errors', () => {
      notFound('RecordSet(\'9999\')')
      notFound('RecordSet(whatever=\'abc\')')
      notFound('ApplicationSettings(whatever=\'9999\')')
      fail('UnknownSet(\'9999\')')
      fail('RecordSet(\'abc\')?$expand=not_a_navigation_property')
      fail('RecordSet(\'abc\')?$select=not_a_property')
    })
  })

  describe('entity set', () => {
    test('RecordSet', response => {
      assert.strictEqual(response.statusCode, 200)
      const entities = JSON.parse(response.toString()).d.results
      assert.strictEqual(entities.length, 4000)
      isRecord(entities[0], 0)
      isRecord(entities[3475], 3475)
    })

    describe('paging', () => {
      test('RecordSet?$top=10&$skip=0', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 10)
        isRecord(entities[0], 0)
        isRecord(entities[9], 9)
      })

      test('RecordSet?$top=50&$skip=10', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 50)
        isRecord(entities[0], 10)
        isRecord(entities[49], 59)
      })

      test('RecordSet?$top=10&$skip=10000', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 0)
      })

      describe('errors', () => {
        fail('RecordSet?$top=&$skip=0')
        fail('RecordSet?$top=10&$skip=-1')
        fail('RecordSet?$top=a1&$skip=0')
        fail('RecordSet?$top=10&$skip=125-')
      })
    })

    describe('filtering', () => {
      test('RecordSet?$filter=id eq \'abc\'', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 1)
        isRecord(entities[0], 'abc')
      })

      test('RecordSet?$filter=id eq \'abc\' or id eq \'aaa\'', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 2)
        isRecord(entities[0], 'aaa')
        isRecord(entities[1], 'abc')
      })

      test('RecordSet?$filter=number eq 3475', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 1)
        isRecord(entities[0], 3475)
      })

      test('RecordSet?$filter=modified lt DateTime\'2020-04-03T12:00:00\'', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 1)
        isRecord(entities[0], 3475)
      })

      test('RecordSet?$filter=number gt 5000', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 0)
      })

      test('RecordSet?$filter=modified gt DateTime\'3020-04-03T12:00:00\'', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 0)
      })

      test('RecordSet?$filter=id eq \'abc\' and number eq 1234 or id eq \'aaa\' and number eq 4567', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 0)
      })

      describe('errors', () => {
        fail('RecordSet?$filter=parentId eq 0')
        fail('RecordSet?$filter=id eq')
        fail('RecordSet?$filter=not_a_property eq \'abc\'')
      })
    })

    describe('ordering', () => {
      test('RecordSet?$orderby=modified&$top=1', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 1)
        isRecord(entities[0], 3475)
      })

      test('RecordSet?$orderby=id desc&$filter=id eq \'abc\' or id eq \'aaa\'', response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, 2)
        isRecord(entities[0], 'abc')
        isRecord(entities[1], 'aaa')
      })

      describe('errors', () => {
        fail('RecordSet?$orderby=parentId')
        fail('RecordSet?$orderby=not_a_property')
        fail('RecordSet?$orderby=id dec')
      })
    })
  })

  describe('navigation properties', () => {
    [0, 1, 2, 5].forEach(count =>
      test(`ApplicationSettings(application='Example',version=${count},setting='Preview')/values`, response => {
        assert.strictEqual(response.statusCode, 200)
        const entities = JSON.parse(response.toString()).d.results
        assert.strictEqual(entities.length, count)
        entities.forEach((entity, index) => {
          isValue(entity, {
            application: 'Example',
            version: count,
            setting: 'Preview',
            index
          })
        })
      })
    )

    test('RecordSet(\'abc\')/parent', response => {
      assert.strictEqual(response.statusCode, 200)
      const entity = JSON.parse(response.toString()).d
      isRecord(entity, 0)
    })

    test('RecordSet(\'abc\')/children', response => {
      assert.strictEqual(response.statusCode, 200)
      const entities = JSON.parse(response.toString()).d.results
      assert.strictEqual(entities.length, 0)
    })

    test('RecordSet(\'abc\')/tags', response => {
      assert.strictEqual(response.statusCode, 200)
      const entities = JSON.parse(response.toString()).d.results
      assert.strictEqual(entities.length, 0)
    })

    test('RecordSet(\'abc\')/parent/children?$orderby=number&$top=10', response => {
      assert.strictEqual(response.statusCode, 200)
      const entities = JSON.parse(response.toString()).d.results
      assert.strictEqual(entities.length, 10)
      isRecord(entities[0], 1)
    })

    describe('errors', () => {
      fail('RecordSet(\'abc\')/ancestor')
      fail('RecordSet(\'abc\')/parent/descendants')
    })
  })

  describe('combining', () => {
    test('RecordSet(\'abc\')/parent/children?$orderby=id asc&$filter=id eq \'abc\' or id eq \'aaa\'&$top=1&$skip=0', response => {
      assert.strictEqual(response.statusCode, 200)
      const entities = JSON.parse(response.toString()).d.results
      assert.strictEqual(entities.length, 1)
      isRecord(entities[0], 'aaa')
    })
  })
})
