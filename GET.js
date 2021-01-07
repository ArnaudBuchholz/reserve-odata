'use strict'

const metadata = require('./metadata')
const { get, list } = require('./entity')
const NavigationProperty = require('./attributes/NavigationProperty')
const toJSON = require('./toJSON')
const { mapFilterProperties, mapOrderByProperties } = require('./properties')
const gpf = require('gpf-js')

function getNavigationProperty (entity, navigationPropertyName) {
  const navigationProperty = NavigationProperty.list(entity)
    .filter(candidate => candidate.name === navigationPropertyName)[0]
  return navigationProperty
}

async function resolveNavigationProperties (parsedUrl, entity) {
  let singleEntityAccess
  const entities = parsedUrl.navigationProperties.reduce((context, navigationPropertyName, index) => {
    const navigationProperty = getNavigationProperty(context[0], navigationPropertyName) // Assuming same type for all
    const memberName = navigationProperty.getMemberName()
    let filter
    if (index === parsedUrl.navigationProperties.length - 1) {
      filter = mapFilterProperties(parsedUrl.parameters.$filter, navigationProperty.to)
    }
    singleEntityAccess = navigationProperty.multiplicity !== '*'
    return context.reduce((result, entity) => result.concat(entity[memberName](filter)), [])
  }, [entity])
  return {
    entities,
    singleEntityAccess
  }
}

async function getEntity (request, parsedUrl, EntityClass) {
  const entity = await get(EntityClass, request, parsedUrl.key)
  if (!entity) {
    return {}
  }
  if (parsedUrl.navigationProperties) {
    return resolveNavigationProperties(parsedUrl, entity)
  }
  return {
    entities: [entity],
    singleEntityAccess: true
  }
}

async function getEntities (request, parsedUrl, EntityClass) {
  if (parsedUrl.key) {
    return getEntity(request, parsedUrl, EntityClass)
  }
  return {
    entities: await list(EntityClass, request, mapFilterProperties(parsedUrl.parameters.$filter, EntityClass)),
    singleEntityAccess: false
  }
}

async function expand (parsedUrl, entities) {
  if (parsedUrl.parameters.$expand) {
    for (const navigationPropertyName of parsedUrl.parameters.$expand) {
      const memberName = getNavigationProperty(entities[0], navigationPropertyName).getMemberName() // Assuming same type for all
      for (const entity of entities) {
        entity[navigationPropertyName] = await entity[memberName]()
      }
    }
  }
}

function orderAndPage (parsedUrl, entities) {
  const orderby = parsedUrl.parameters.$orderby
  if (orderby) {
    entities = [].concat(entities).sort(gpf.createSortFunction(mapOrderByProperties(orderby, entities[0]))) // Assuming same type for all
  }
  if (parsedUrl.parameters.$skip) {
    entities = entities.slice(parsedUrl.parameters.$skip)
  }
  if (parsedUrl.parameters.$top) {
    entities = entities.slice(0, parsedUrl.parameters.$top)
  }
  return entities
}

function send (response, statusCode, d) {
  const stringified = JSON.stringify({ d })
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': stringified.length
  })
  response.end(stringified)
}

module.exports = async function ({ EntityClass, mapping, parsedUrl, request, response }) {
  if (parsedUrl.metadata) {
    return metadata(...arguments)
  }
  let { entities, singleEntityAccess } = await getEntities(request, parsedUrl, EntityClass)
  if (singleEntityAccess === undefined) {
    return send(response, 404)
  }
  await expand(parsedUrl, entities)
  if (!singleEntityAccess) {
    entities = orderAndPage(parsedUrl, entities)
  }
  entities = entities.map(entity => toJSON(entity, mapping['service-namespace'], parsedUrl.parameters.$select))
  let d
  if (singleEntityAccess) {
    d = entities[0]
  } else {
    d = { results: entities }
  }
  send(response, 200, d)
}
