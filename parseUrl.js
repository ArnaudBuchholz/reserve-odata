'use strict'

const parseKey = key => {
  const match = /^(?:'([^']*)'|"([^"]*)"|(.*))$/.exec(key)
  if (match[3]) {
    const keys = {}
    match[3].replace(/([^=]+)=(?:"([^"]+)"|'([^']+)'|([^,]+))(?:,|$)/g, function (_, field, value1, value2, value3) {
      keys[field] = value1 || value2 || value3
    })
    return keys
  }
  return match[1] || match[2]
}

const toNumber = value => parseInt(value, 10)
const toList = value => value.split(',')

const parameterParsers = {
  $top: toNumber,
  $skip: toNumber,
  $expand: toList,
  $select: toList,
  $orderby: value => value.split(',').reduce((orders, description) => {
    const [, field, order] = /([^ ]+)(?: (asc|desc))?/.exec(description)
    orders[field] = order !== 'desc'
    return orders
  }, {}),
  $filter: value => null
}

const parseParameters = parameters => parameters.split('&').reduce((map, parameter) => {
  const [, name, escapedValue] = /([^=]+)=(.*)/.exec(parameter)
  const value = decodeURIComponent(escapedValue)
  const parser = parameterParsers[name]
  if (parser) {
    map[name] = parser(value)
  } else {
    map[name] = value
  }
  return map
}, {})

module.exports = url => {
  const [, set, key, navigationProperties, parameters] = /([\w0-9_]+)(?:\(([^)]+)\))?((?:\/[\w0-9_]+)+)?(?:\?(.+))?/.exec(url)
  const parsed = { set }
  if (key) {
    parsed.key = parseKey(key)
  }
  if (navigationProperties) {
    parsed.navigationProperties = navigationProperties.split('/').slice(1)
  }
  if (parameters) {
    parsed.parameters = parseParameters(parameters)
  }
  return parsed
}
