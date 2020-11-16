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

  function checkEntitiesCount (xml, count) {
    const schema = xml.Edmx.DataServices[0].Schema[0]
    assert.strictEqual(schema.EntityType.length, count)
    const entityContainer = schema.EntityContainer[0]
    assert.strictEqual(entityContainer.EntitySet.length, count)
  }

  function checkEntity ({
    xml,
    name,
    nameSet = `${name}Set`,
    properties,
    navigationProperties = {},
    namespace = 'test'
  }) {
    const schema = xml.Edmx.DataServices[0].Schema[0]

    const entityType = findByName(schema.EntityType, name)
    assert.ok(entityType)
    assert.strictEqual(entityType.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')

    const entityTypeKey = entityType.Key[0]
    assert.strictEqual(entityType.Key.length, 1)
    assert.strictEqual(entityTypeKey.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
    const keys = entityTypeKey.PropertyRef.reduce((array, keyProperty) => {
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
        assert.strictEqual(recordProperty.$.Nullable.value, 'false')
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

    const navigationPropertiesCount = Object.keys(navigationProperties).length
    if (navigationPropertiesCount) {
      Object.keys(navigationProperties).forEach(navigationPropertyName => {
        const { target, targetSet, multiplicity } = navigationProperties[navigationPropertyName]
        const navigationProperty = findByName(entityType.NavigationProperty, navigationPropertyName)
        assert.ok(navigationProperty)
        assert.strictEqual(navigationProperty.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
        const nsRelationship = navigationProperty.$.Relationship.value
        const fromRole = navigationProperty.$.FromRole.value
        const toRole = navigationProperty.$.ToRole.value
        assert.ok(nsRelationship.startsWith(`${namespace}.`))
        const relationship = nsRelationship.substring(`${namespace}.`.length)

        const association = findByName(schema.Association, relationship)
        assert.ok(association)
        assert.strictEqual(association.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
        association.End.forEach(associationEnd => {
          assert.strictEqual(associationEnd.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
          if (associationEnd.$.Role.value === fromRole) {
            assert.strictEqual(associationEnd.$.Type.value, `${namespace}.${name}`)
            assert.strictEqual(associationEnd.$.Multiplicity.value, '1')
          } else if (associationEnd.$.Role.value === toRole) {
            assert.strictEqual(associationEnd.$.Type.value, `${namespace}.${target}`)
            assert.strictEqual(associationEnd.$.Multiplicity.value, `0..${multiplicity}`)
          } else {
            assert.ok(false)
          }
        })

        const associationSet = findByName(entityContainer.AssociationSet, `${relationship}Set`)
        assert.ok(associationSet)
        assert.strictEqual(associationSet.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
        assert.strictEqual(associationSet.$.Association.value, `${namespace}.${relationship}`)
        associationSet.End.forEach(associationSetEnd => {
          assert.strictEqual(associationSetEnd.$ns.uri, 'http://schemas.microsoft.com/ado/2008/09/edm')
          if (associationSetEnd.$.Role.value === fromRole) {
            assert.strictEqual(associationSetEnd.$.EntitySet.value, `${nameSet}`)
          } else if (associationSetEnd.$.Role.value === toRole) {
            assert.strictEqual(associationSetEnd.$.EntitySet.value, `${targetSet}`)
          } else {
            assert.ok(false)
          }
        })
      })
      assert.strictEqual(entityType.NavigationProperty.length, Object.keys(navigationProperties).length)
    } else {
      assert.ok(!entityType.NavigationProperty)
    }
  }

  it('describes ODATA schema (Tag only)', () => handle({
    request: '$metadata',
    classes: [Tag],
    serviceNamespace: 'TAG_ONLY',
    useSapExtension: false
  })
    .then(response => {
      assert.strictEqual(response.statusCode, 200)
      // console.log(response.toString())
      return parse(response.toString())
    })
    .then(xml => {
      // console.log(JSON.stringify(xml))
      checkStructure(xml, 'TAG_ONLY')
      checkEntitiesCount(xml, 1)
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
      checkEntitiesCount(xml, 4)
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
        },
        navigationProperties: {
          children: { target: 'Record', targetSet: 'RecordSet', multiplicity: '*' },
          parent: { target: 'Record', targetSet: 'RecordSet', multiplicity: '1' },
          tags: { target: 'Tag', targetSet: 'TagSet', multiplicity: '*' }
        }
      })
      checkEntity({
        xml,
        name: 'ApplicationSetting',
        nameSet: 'ApplicationSettings',
        properties: {
          application: { type: 'Edm.String', key: true },
          version: { type: 'Edm.Int64', key: true },
          setting: { type: 'Edm.String', key: true }
        },
        navigationProperties: {
          values: { target: 'Value', targetSet: 'Values', multiplicity: '*' }
        }
      })
      checkEntity({
        xml,
        name: 'Value',
        nameSet: 'Values',
        properties: {
          id: { type: 'Edm.String', key: true },
          value: { type: 'Edm.String' },
          modified: { type: 'Edm.DateTime' }
        }
      })
    })
  )
})
