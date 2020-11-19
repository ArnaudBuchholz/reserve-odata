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
  })
})
