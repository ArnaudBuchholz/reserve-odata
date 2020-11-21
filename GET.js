'use strict'

const { $set2dpc } = require('./symbols')
const metadata = require('./metadata')
const Entity = require('./attributes/Entity')
const NavigationProperty = require('./attributes/NavigationProperty')
const parseUrl = require('./parseUrl')
const toJSON = require('./toJSON')

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
      }
    } else {
  
    }
    // expand
    if (parsedUrl.parameters.$expand) {
        parsedUrl.parameters.$expand.forEach(navigationPropertyName => {
          const memberName = getNavigationPropertyMethodName(entities[0], navigationPropertyName) // Assuming same type for all
          entities.forEach(entity => {
            entity[navigationPropertyName] = entity[memberName]()
          })
        })
    }
    entities = entities.map(entity => toJSON(entity, mapping['service-namespace'], parsedUrl.parameters.$select))
    let result
    if (parsedUrl.key && !parsedUrl.navigationProperties) {
      result = entities[0]
    } else {
      result = { results: entities }
      // $order
      // $top && $skip
    }
    const content = JSON.stringify({
      d: result
    })
    response.writeHead(200, {
      'Content-Type': jsonContentType,
      'Content-Length': content.length
    })
    response.end(content)
}