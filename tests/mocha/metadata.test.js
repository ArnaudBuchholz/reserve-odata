'use strict'

const assert = require('assert')
const { parseStringPromise } = require('xml2js')
const handle = require('./handle.js')

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
  it('provides valid schema description', () => handle({ request: '$metadata' })
    .then(response => {
      assert.strictEqual(response.statusCode, 200)
      return parse(response.toString())
    })
    .then(xml => {
      // console.log(JSON.stringify(xml))
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
      assert.strictEqual(schema.$.Namespace.value, 'test')

      const recordEntityType = findByName(schema.EntityType, 'Record')
      assert.ok(recordEntityType)
      assert.strictEqual(recordEntityType.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')

      const recordKey = recordEntityType.Key[0]
      assert.ok(recordKey)
      assert.strictEqual(recordEntityType.Key.length, 1)
      assert.strictEqual(recordKey.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')

      const recordKeyProperty = recordKey.PropertyRef[0]
      assert.ok(recordKeyProperty)
      assert.strictEqual(recordKey.PropertyRef.length, 1)
      assert.strictEqual(recordKeyProperty.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
      assert.strictEqual(recordKeyProperty.$.Name.value, 'id')

      assert.strictEqual(recordEntityType.Property.length, 4)
      const expectedProperties = {
        id: { type: 'Edm.String' },
        name: { type: 'Edm.String' },
        number: { type: 'Edm.Int64' },
        modified: { type: 'Edm.DateTime' }
      }
      Object.keys(expectedProperties).forEach(propertyName => {
        const recordProperty = findByName(recordEntityType.Property, propertyName)
        assert.strictEqual(recordProperty.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
        assert.strictEqual(recordProperty.$.Type.value, expectedProperties[propertyName].type)
      })

      const entityContainer = schema.EntityContainer[0]
      assert.ok(entityContainer)
      assert.strictEqual(schema.EntityContainer.length, 1)
      assert.strictEqual(entityContainer.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')

      const recordEntitySet = findByName(entityContainer.EntitySet, 'RecordSet')
      assert.ok(recordEntitySet)
      assert.strictEqual(recordEntitySet.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
      assert.strictEqual(recordEntitySet.$.EntityType.value, 'test.Record')
    })
  )
})
