'use strict'

const { $set2dpc } = require('./symbols')
const metadata = require('./metadata')
const Entity = require('./attributes/Entity')
const NavigationProperty = require('./attributes/NavigationProperty')
const parseUrl = require('./parseUrl')
const toJSON = require('./toJSON')
const gpf = require('gpf-js')

const jsonContentType = 'application/json'

function getNavigationPropertyMethodName (entity, navigationPropertyName) {
  const navigationProperty = NavigationProperty.list(entity)
    .filter(candidate => candidate.name === navigationPropertyName)[0]
  return navigationProperty.getMemberName()
}

module.exports = async function ({ mapping, redirect, request, response }) {
  if (redirect.startsWith('$metadata')) {
    return metadata(...arguments)
  }
  const parsedUrl = parseUrl(redirect)
  const EntityClass = mapping[$set2dpc][parsedUrl.set]
  let entities
  let singleEntityAccess = false
  if (parsedUrl.key) {
    entities = [await Entity.read(EntityClass, request, parsedUrl.key)]
    if (parsedUrl.navigationProperties) {
      entities = parsedUrl.navigationProperties.reduce((context, navigationPropertyName, index) => {
        let filter
        if (index === parsedUrl.navigationProperties.length - 1) {
          filter = parsedUrl.parameters.$filter
        }
        const memberName = getNavigationPropertyMethodName(context[0], navigationPropertyName) // Assuming same type for all
        return context.reduce((result, entity) => result.concat(entity[memberName](filter)), [])
      }, entities)
    } else {
      singleEntityAccess = true
    }
  } else {
    entities = await Entity.find(EntityClass, request, parsedUrl.parameters.$filter)
  }
  if (parsedUrl.parameters.$expand) {
    parsedUrl.parameters.$expand.forEach(navigationPropertyName => {
      const memberName = getNavigationPropertyMethodName(entities[0], navigationPropertyName) // Assuming same type for all
      entities.forEach(entity => {
        entity[navigationPropertyName] = entity[memberName]()
      })
    })
  }
  if (!singleEntityAccess) {
    const orderby = parsedUrl.parameters.$orderby
    if (orderby) {
      debugger
      const memberProperties = gpf.serial.get(entities[0]) // Assuming same type for all
      const namedProperties = Object.keys(memberProperties).reduce((dictionary, member) => {
        const property = memberProperties[member]
        property.member = member
        dictionary[property.name] = property
        return dictionary
      }, {})
      orderby.forEach(orderItem => {
        const property = namedProperties[orderItem.property]
        orderItem.property = property.member
        if (property.type === gpf.serial.types.string) {
          orderItem.type = 'string'
        }
      })
      entities.sort(gpf.createSortFunction(parsedUrl.parameters.$orderby))
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
    'Content-Type': jsonContentType,
    'Content-Length': content.length
  })
  response.end(content)
}
