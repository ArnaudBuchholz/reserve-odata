'use strict'

const assert = require('assert')
const { parseStringPromise } = require('xml2js')
const handle = require('./handle.js')
const Tag = require('./Tag')

const getLocalName = name => {
  if (name.includes(':')) {
    return name.split(':')[1]
  }
  return name
}

const parse = xmlString => parseStringPromise(xmlString, {
  xmlns: true,
  explicitChildren: true,
  preserveChildrenOrder: true,
  tagNameProcessors: [getLocalName],
  attrNameProcessors: [getLocalName]
})

const findByName = (array, name) => array.filter(node => node.$.Name.value === name)[0]

describe('metadata', () => {
  function checkStructure (xml, namespace = 'test') {
    const edmx = xml.Edmx
    assert.ok(edmx)
    assert.strictEqual(edmx.$ns.uri, 'http://schemas.microsoft.com/ado/2007/06/edmx')
    assert.strictEqual(edmx.$.Version.value, '1.0')

    const dataServices = edmx.DataServices[0]
    assert.ok(dataServices)
    assert.strictEqual(edmx.DataServices.length, 1)
    assert.strictEqual(dataServices.$ns.uri, 'http://schemas.microsoft.com/ado/2007/06/edmx')
    const $dataServiceVersion = dataServices.$.DataServiceVersion
    assert.strictEqual($dataServiceVersion.uri, 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata')
    assert.strictEqual($dataServiceVersion.value, '2.0')

    const schema = dataServices.Schema[0]
    assert.ok(schema)
    assert.strictEqual(dataServices.Schema.length, 1)
    assert.strictEqual(schema.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
    assert.strictEqual(schema.$.Namespace.value, namespace)

    const entityContainer = schema.EntityContainer[0]
    assert.ok(entityContainer)
    assert.strictEqual(schema.EntityContainer.length, 1)
    assert.strictEqual(entityContainer.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
  }

  function checkEntity ({
    xml,
    name,
    nameSet = `${name}Set`,
    properties = {},
    namespace = 'test'
  }) {
    const schema = xml.Edmx.DataServices[0].Schema[0]

    const entityType = findByName(schema.EntityType, name)
    assert.ok(entityType)
    assert.strictEqual(entityType.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')

    const keys = entityType.Key.reduce((array, key) => {
      assert.strictEqual(key.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
      const keyProperty = key.PropertyRef[0]
      assert.ok(keyProperty)
      assert.strictEqual(key.PropertyRef.length, 1)
      assert.strictEqual(keyProperty.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
      const keyPropertyName = keyProperty.$.Name.value
      assert.ok(!array.includes(keyPropertyName))
      array.push(keyPropertyName)
      return array
    }, [])

    let keyCount = 0
    assert.strictEqual(entityType.Property.length, Object.keys(properties).length)
    Object.keys(properties).forEach(propertyName => {
      const { key, type } = properties[propertyName]
      const recordProperty = findByName(entityType.Property, propertyName)
      assert.strictEqual(recordProperty.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
      assert.strictEqual(recordProperty.$.Type.value, type)
      if (key) {
        ++keyCount
        assert.ok(keys.includes(propertyName))
      }
    })
    assert.strictEqual(keys.length, keyCount)

    const entityContainer = schema.EntityContainer[0]

    const entitySet = findByName(entityContainer.EntitySet, nameSet)
    assert.ok(entitySet)
    assert.strictEqual(entitySet.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
    assert.strictEqual(entitySet.$.EntityType.value, `${namespace}.${name}`)
  }

  it('describes ODATA schema (Tag only)', () => handle({
    request: '$metadata',
    classes: [Tag],
    serviceNamespace: 'TAG_ONLY',
    useSapExtension: false
  })
    .then(response => {
      assert.strictEqual(response.statusCode, 200)
      return parse(response.toString())
    })
    .then(xml => {
      checkStructure(xml, 'TAG_ONLY')
      checkEntity({
        xml,
        name: 'Tag',
        properties: {
          name: { type: 'Edm.String', key: true },
          count: { type: 'Edm.Int64' },
          modified: { type: 'Edm.DateTime' }
        },
        namespace: 'TAG_ONLY'
      })
    })
  )

  it('describes ODATA schema', () => handle({ request: '$metadata' })
    .then(response => {
      assert.strictEqual(response.statusCode, 200)
      // console.log(response.toString())
      return parse(response.toString())
    })
    .then(xml => {
      // console.log(JSON.stringify(xml))
      checkStructure(xml)
      checkEntity({
        xml,
        name: 'Tag',
        properties: {
          name: { type: 'Edm.String', key: true },
          count: { type: 'Edm.Int64' },
          modified: { type: 'Edm.DateTime' }
        }
      })
      checkEntity({
        xml,
        name: 'Record',
        properties: {
          id: { type: 'Edm.String', key: true },
          parentId: { type: 'Edm.String' },
          name: { type: 'Edm.String' },
          number: { type: 'Edm.Int64' },
          modified: { type: 'Edm.DateTime' }
        }
      })
    })
  )
})
