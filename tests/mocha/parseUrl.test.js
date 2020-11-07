'use strict'

const assert = require('assert')
const parseUrl = require('../../parseUrl')

const scenarios = {
  RecordSet: {
    set: 'RecordSet'
  },
  'RecordSet(\'abc\')': {
    set: 'RecordSet',
    key: 'abc'
  },
  'RecordSet("abc")': {
    set: 'RecordSet',
    key: 'abc'
  },
  'AppSetting(application="Example",version=1,setting=\'Preview\')': {
    set: 'AppSetting',
    key: {
      application: 'Example',
      version: '1',
      setting: 'Preview'
    }
  }
}

describe('parseUrl', () => {
  Object.keys(scenarios).forEach(url => it(url, () => {
    assert.deepStrictEqual(parseUrl(url), scenarios[url])
  }))
})
