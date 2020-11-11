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

function parseFilter (string) {
  const tokens = []
  string.replace(/\(|\)|\d+|[\w0-9_]+/g, token => tokens.push(token))

  const invalidFilter = () => { throw new Error('invalid filter') }

  // filter -> or_cond or or_cond
  // or_cond -> and_cond and and_cond
  // and_cond -> field operator value

  function parseCondition () {
    const [property, operator, rawValue] = tokens
    tokens.splice(0, 3)
    if (operator === 'eq') {
      return { [operator]: [{ property }, parseInt(rawValue, 10)]}
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
      if (!tokens.length) {
        break
      }
      if (tokens[0] !== operator) {
        invalidFilter()
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
