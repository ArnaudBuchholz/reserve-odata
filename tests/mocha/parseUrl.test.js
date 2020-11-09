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
  },
  'RecordSet("123")/Tags': {
    set: 'RecordSet',
    key: '123',
    navigationProperties: ['Tags']
  },
  'RecordSet("456")/Tags/Records': {
    set: 'RecordSet',
    key: '456',
    navigationProperties: ['Tags', 'Records']
  },
  'RecordSet?$top=10&$skip=0': {
    set: 'RecordSet',
    parameters: {
      $skip: 0,
      $top: 10
    }
  },
  'RecordSet?$skip=0&$top=10': {
    set: 'RecordSet',
    parameters: {
      $skip: 0,
      $top: 10
    }
  },
  'RecordSet?$skip=123&$orderby=Rating asc,Priority,Category/Name desc&$top=456': {
    set: 'RecordSet',
    parameters: {
      $skip: 123,
      $top: 456,
      $orderby: {
        Rating: true,
        Priority: true,
        'Category/Name': false
      }
    }
  },
  'RecordSet?$expand=tags,parent,children': {
    set: 'RecordSet',
    parameters: {
      $expand: ['tags', 'parent', 'children']
    }
  },
  'RecordSet?$select=Name,Count': {
    set: 'RecordSet',
    parameters: {
      $select: ['Name', 'Count']
    }
  },
  'RecordSet?$filter=Count eq 2': {
    set: 'RecordSet',
    parameters: {
      $filter: {
        eq: [
          { property: 'Count' },
          2
        ]
      }
    }
  }
}

describe('parseUrl', () => {
  Object.keys(scenarios).forEach(url => it(url, () => {
    assert.deepStrictEqual(parseUrl(url), scenarios[url])
  }))
})
