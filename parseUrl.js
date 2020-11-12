'use strict'

const toNumber = value => {
  if (value.includes('.')) {
    return parseFloat(value)
  }
  return parseInt(value, 10)
}

const parseKey = key => {
  const match = /^(?:'([^']*)'|(\d+)|(.*))$/.exec(key)
  if (match[3]) {
    const keys = {}
    match[3].replace(/([^=]+)=(?:'([^']+)'|([^,]+))(?:,|$)/g, function (_, field, value1, value2) {
      keys[field] = value1 || toNumber(value2)
    })
    return keys
  }
  return match[1] || toNumber(match[2])
}

const toList = value => value.split(',')

function parseFilter (string) {
  const tokens = []
  string.replace(/\(|\)|\d+(\.\d*)?|'[^']+'|[\w0-9_]+(\/[\w0-9_]+)*/g, token => tokens.push(token))

  const invalidFilter = () => { throw new Error('invalid filter') }

  const operatorMapping = {
    ge: 'gte',
    le: 'lte'
  }

  function parseCondition () {
    const [property, operator, rawValue] = tokens
    tokens.splice(0, 3)
    let value
    if (rawValue.startsWith('\'')) {
      value = rawValue.substring(1, rawValue.length - 1)
    } else {
      value = toNumber(rawValue)
    }
    if (['eq', 'ne', 'gt', 'ge', 'lt', 'le'].includes(operator)) {
      return { [operatorMapping[operator] || operator]: [{ property }, value] }
    }
    invalidFilter()
  }

  function chain (parser, operator) {
    let filter
    while (tokens.length) {
      const condition = parser()
      if (!filter) {
        filter = condition
      } else if (filter[operator]) {
        filter[operator].push(condition)
      } else {
        filter = { [operator]: [filter, condition] }
      }
      if (!tokens.length || tokens[0] !== operator) {
        break
      }
      tokens.shift()
      if (!tokens.length) {
        invalidFilter()
      }
    }
    return filter
  }

  const parseAndCond = chain.bind(null, parseCondition, 'and')
  return chain(parseAndCond, 'or')
}

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
  $filter: parseFilter
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
