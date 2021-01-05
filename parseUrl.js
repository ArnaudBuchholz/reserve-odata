'use strict'

const toNumber = value => {
  if (value.includes('.')) {
    return parseFloat(value)
  }
  return parseInt(value, 10)
}

const toPositiveNumber = value => {
  if (!value.match(/^\d+$/)) {
    throw new Error('Invalid positive number')
  }
  return toNumber(value)
}

const toList = value => value.split(',')

const filterTokenizer = /\(|\)|\d+(\.\d*)?|'[^']+'|DateTime'[^']*'|[\w0-9_]+(\/[\w0-9_]+)*/g
const filterValueParser = /^(?:'([^']*)'|DateTime'(\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d)'|(\d+(?:\.\d*)?))$/
const filterOperatorMapping = { ge: 'gte', le: 'lte' }
const invalidFilter = () => { throw new Error('invalid filter') }
const filterValueConverters = [
  string => string,
  datetime => new Date(`${datetime}.000Z`).getTime(),
  toNumber
]

function parseFilterCondition (tokens) {
  const [property, operator, rawValue] = tokens
  tokens.splice(0, 3)
  const parsedValue = filterValueParser.exec(rawValue)
  if (!parsedValue) {
    invalidFilter()
  }
  let value
  filterValueConverters.every((convert, index) => {
    const capturedValue = parsedValue[index + 1]
    if (capturedValue !== undefined) {
      value = convert(capturedValue)
      return false
    }
    return true
  })
  if (['eq', 'ne', 'gt', 'ge', 'lt', 'le'].includes(operator)) {
    return { [filterOperatorMapping[operator] || operator]: [{ property }, value] }
  }
  invalidFilter()
}

function parseFilterChain (parser, operator, tokens) {
  let filter
  while (tokens.length) {
    const condition = parser(tokens)
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
const parseFilterAndCond = parseFilterChain.bind(null, parseFilterCondition, 'and')
const parseFilterOrCond = parseFilterChain.bind(null, parseFilterAndCond, 'or')

function parseFilter (string) {
  const tokens = []
  string.replace(filterTokenizer, token => tokens.push(token))
  return parseFilterOrCond(tokens)
}

const parameterParsers = {
  $top: toPositiveNumber,
  $skip: toPositiveNumber,
  $expand: toList,
  $select: toList,
  $orderby: value => value.split(',').reduce((orders, description, index) => {
    const [, field, order] = /^([^ ]+)(| asc| desc)?$/.exec(description)
    orders.push({
      property: field,
      ascending: order !== ' desc'
    })
    return orders
  }, []),
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

module.exports = url => {
  const [, set, key, navigationProperties, rawParameters] = /^((?:\$metadata|[\w0-9_]+))(?:\(([^)]+)\))?((?:\/[\w0-9_]+)+)?(?:\?(.+))?/.exec(url)
  const parameters = (rawParameters && parseParameters(rawParameters)) || {}
  const owns$parameter = Object.keys(parameters).some(parameter => parameter.startsWith('$'))
  if (set === '$metadata') {
    if (key || navigationProperties) {
      throw new Error('Invalid URL')
    }
    if (owns$parameter) {
      throw new Error('Invalid parameter')
    }
    return {
      metadata: true,
      set: '',
      parameters,
      owns$parameter
    }
  }
  const parsed = { set, parameters, owns$parameter }
  if (key) {
    parsed.key = parseKey(key)
  }
  if (navigationProperties) {
    parsed.navigationProperties = navigationProperties.split('/').slice(1)
  }
  return parsed
}
