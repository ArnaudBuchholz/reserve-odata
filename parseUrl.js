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

module.exports = url => {
  const match = /(\w+)(?:\(([^)]+)\))?/.exec(url)
  const parsed = {
    set: match[1]
  }
  if (match[2]) {
    parsed.key = parseKey(match[2])
  }
  return parsed
}
