'use strict'

const { $dpc } = require('./symbols')
const entity = require('./entity')
const Key = require('./attributes/Key')
const Filterable = require('./attributes/Filterable')
const Sortable = require('./attributes/Sortable')
const NavigationProperty = require('./attributes/NavigationProperty')
const gpf = require('gpf-js')

const EDMX_NAMESPACE = 'http://schemas.microsoft.com/ado/2007/06/edmx'
const METADATA_NAMESPACE = 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata'
const EDM_NAMESPACE = 'http://schemas.microsoft.com/ado/2008/09/edm'
const SAP_NAMESPACE = 'http://www.sap.com/Protocols/SAPData'

const TYPES_MAPPING = {}
TYPES_MAPPING[gpf.serial.types.string] = 'Edm.String'
TYPES_MAPPING[gpf.serial.types.integer] = 'Edm.Int64'
TYPES_MAPPING[gpf.serial.types.datetime] = 'Edm.DateTime'

const xmlContentHandler = gpf.interfaces.promisify(gpf.interfaces.IXmlContentHandler)

module.exports = async ({ mapping, response }) => {
  const writer = new gpf.xml.Writer()
  const promisifiedWriter = xmlContentHandler(writer)
  const output = new gpf.stream.WritableString()
  const piped = gpf.stream.pipe(writer, output)

  const entities = mapping[$dpc]
  const serviceNamespace = mapping['service-namespace']

  await promisifiedWriter
    .startDocument()
    .startPrefixMapping('edmx', EDMX_NAMESPACE)
    .startPrefixMapping('m', METADATA_NAMESPACE)
    .startPrefixMapping('', EDM_NAMESPACE)

  let sapNavigationPropertyContentVersion
  if (mapping['use-sap-extension']) {
    await promisifiedWriter.startPrefixMapping('sap', SAP_NAMESPACE)
    sapNavigationPropertyContentVersion = {
      'sap:content-version': 1
    }
  }

  await promisifiedWriter
    .startElement('edmx:Edmx', { Version: '1.0' })
    .startElement('edmx:DataServices', { 'm:DataServiceVersion': '2.0' })
    .startElement('Schema', { Namespace: serviceNamespace })

  for await (const EntityClass of entities) {
    const { name: entityName } = entity.names(EntityClass)

    await promisifiedWriter
      .startElement('EntityType', { Name: entityName })
      .startElement('Key')

    const serialProps = gpf.serial.get(EntityClass)

    const keys = Object.keys(gpf.attributes.get(EntityClass, Key))
    for await (const member of keys) {
      await promisifiedWriter
        .startElement('PropertyRef', { Name: serialProps[member].name })
        .endElement() // PropertyRef
    }

    await promisifiedWriter.endElement() // Key

    for await (const member of Object.keys(serialProps)) {
      const serial = serialProps[member]
      let attributes = {
        Name: serial.name,
        Type: TYPES_MAPPING[serial.type],
        Nullable: !serial.required && !keys.includes(member)
      }
      if (mapping['use-sap-extension']) {
        const sortable = gpf.attributes.get(EntityClass, Sortable)
        const filterable = gpf.attributes.get(EntityClass, Filterable)
        attributes = {
          ...attributes,
          'sap:creatable': false,
          'sap:updatable': serial.readOnly === false,
          'sap:sortable': Object.prototype.hasOwnProperty.call(sortable, member),
          'sap:filterable': Object.prototype.hasOwnProperty.call(filterable, member)
        }
      }
      await promisifiedWriter
        .startElement('Property', attributes)
        .endElement() // Property
    }

    const navigationProperties = NavigationProperty.list(EntityClass)
    for await (const navigationProperty of navigationProperties) {
      await promisifiedWriter
        .startElement('NavigationProperty', {
          Name: navigationProperty.name,
          Relationship: `${serviceNamespace}.${navigationProperty.relationshipName}`,
          FromRole: navigationProperty.fromRoleName,
          ToRole: navigationProperty.toRoleName
        })
        .endElement() // NavigationProperty
    }

    await promisifiedWriter.endElement() // EntityType

    for await (const navigationProperty of navigationProperties) {
      const { name: toEntityName } = entity.names(navigationProperty.to)
      await promisifiedWriter
        .startElement('Association', {
          Name: navigationProperty.relationshipName,
          ...sapNavigationPropertyContentVersion
        })
        .startElement('End', {
          Type: `${serviceNamespace}.${entityName}`,
          Multiplicity: '1',
          Role: navigationProperty.fromRoleName
        })
        .endElement() // End
        .startElement('End', {
          Type: `${serviceNamespace}.${toEntityName}`,
          Multiplicity: `0..${navigationProperty.multiplicity}`,
          Role: navigationProperty.toRoleName
        })
        .endElement() // End

      await promisifiedWriter.endElement() // Association
    }
  }

  await promisifiedWriter.startElement('EntityContainer', {
    Name: `${serviceNamespace}_Entities`,
    'm:IsDefaultEntityContainer': true
  })

  for await (const EntityClass of entities) {
    const { name: entityName, setName: entitySetName } = entity.names(EntityClass)

    let attributes
    if (mapping['use-sap-extension']) {
      attributes = {
        'sap:creatable': entity.creatable(EntityClass),
        'sap:updatable': entity.updatable(EntityClass),
        'sap:deletable': entity.deletable(EntityClass)
      }
    }
    await promisifiedWriter
      .startElement('EntitySet', {
        Name: entitySetName,
        EntityType: `${serviceNamespace}.${entityName}`,
        ...attributes
      })
      .endElement() // EntitySet

    const navigationProperties = NavigationProperty.list(EntityClass)
    for await (const navigationProperty of navigationProperties) {
      const { setName: toEntitySetName } = entity.names(navigationProperty.to)
      await promisifiedWriter
        .startElement('AssociationSet', {
          Name: `${navigationProperty.relationshipName}Set`,
          Association: `${serviceNamespace}.${navigationProperty.relationshipName}`,
          ...sapNavigationPropertyContentVersion
        })
        .startElement('End', {
          EntitySet: entitySetName,
          Role: navigationProperty.fromRoleName
        })
        .endElement() // End
        .startElement('End', {
          EntitySet: toEntitySetName,
          Role: navigationProperty.toRoleName
        })
        .endElement() // End
        .endElement() // AssociationSet
    }
  }

  await promisifiedWriter
    .endElement() // EntityContainer
    .endElement() // Schema
    .endElement() // edmx:DataServices
    .endElement() // edmx:Edmx
    .endDocument()

  await piped

  const xml = output.toString()
  response.writeHead(200, {
    'Content-Type': 'application/xml',
    'Content-Length': xml.length
  })
  response.end(xml)
}
