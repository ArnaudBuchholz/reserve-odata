'use strict'

const metadata = require('./metadata')
const { get, list } = require('./entity')
const NavigationProperty = require('./attributes/NavigationProperty')
const toJSON = require('./toJSON')
const { getNamedProperties, mapFilterProperties } = require('./properties')
const gpf = require('gpf-js')

function getNavigationProperty (entity, navigationPropertyName) {
  const navigationProperty = NavigationProperty.list(entity)
    .filter(candidate => candidate.name === navigationPropertyName)[0]
  return navigationProperty
}

async function getEntities (request, parsedUrl, EntityClass) {
  let entities
  let singleEntityAccess = false
  if (parsedUrl.key) {
    const entity = await get(EntityClass, request, parsedUrl.key)
    if (!entity) {
      return {}
    }
    entities = [entity]
    if (parsedUrl.navigationProperties) {
      entities = parsedUrl.navigationProperties.reduce((context, navigationPropertyName, index) => {
        const navigationProperty = getNavigationProperty(context[0], navigationPropertyName) // Assuming same type for all
        const memberName = navigationProperty.getMemberName()
        let filter
        if (index === parsedUrl.navigationProperties.length - 1) {
          filter = mapFilterProperties(parsedUrl.parameters.$filter, navigationProperty.to)
        }
        singleEntityAccess = navigationProperty.multiplicity !== '*'
        return context.reduce((result, entity) => result.concat(entity[memberName](filter)), [])
      }, entities)
    } else {
      singleEntityAccess = true
    }
  } else {
    entities = await list(EntityClass, request, mapFilterProperties(parsedUrl.parameters.$filter, EntityClass))
  }
  return {
    entities,
    singleEntityAccess
  }
}

module.exports = async function ({ EntityClass, mapping, parsedUrl, request, response }) {
  if (parsedUrl.metadata) {
    return metadata(...arguments)
  }
  let { entities, singleEntityAccess } = await getEntities(request, parsedUrl, EntityClass)
  if (singleEntityAccess === undefined) {
    response.writeHead(404, {
      'Content-Type': 'application/json',
      'Content-Length': 2
    })
    response.end('{}')
    return
  }
  if (parsedUrl.parameters.$expand) {
    parsedUrl.parameters.$expand.forEach(navigationPropertyName => {
      const memberName = getNavigationProperty(entities[0], navigationPropertyName).getMemberName() // Assuming same type for all
      entities.forEach(entity => {
        entity[navigationPropertyName] = entity[memberName]()
      })
    })
  }
  if (!singleEntityAccess) {
    const orderby = parsedUrl.parameters.$orderby
    if (orderby) {
      const namedProperties = getNamedProperties(entities[0]) // Assuming same type for all
      orderby.forEach(orderItem => {
        const property = namedProperties[orderItem.property]
        orderItem.property = property.member
        if (property.type === gpf.serial.types.string) {
          orderItem.type = 'string'
        }
      })
      entities = [].concat(entities).sort(gpf.createSortFunction(parsedUrl.parameters.$orderby))
    }
    if (parsedUrl.parameters.$skip) {
      entities = entities.slice(parsedUrl.parameters.$skip)
    }
    if (parsedUrl.parameters.$top) {
      entities = entities.slice(0, parsedUrl.parameters.$top)
    }
  }
  entities = entities.map(entity => toJSON(entity, mapping['service-namespace'], parsedUrl.parameters.$select))
  let d
  if (singleEntityAccess) {
    d = entities[0]
  } else {
    d = { results: entities }
  }
  const content = JSON.stringify({ d })
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': content.length
  })
  response.end(content)
}
