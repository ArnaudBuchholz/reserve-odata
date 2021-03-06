'use strict'

const assert = require('assert')
const parseUrl = require('../../parseUrl')

const scenarios = {
  $metadata: {
    metadata: true,
    set: '',
    parameters: {},
    owns$parameter: false
  },
  '$metadata?$skip=1': 0,
  '$metadata(abc)': 0,
  '$metadata/abc': 0,
  $123: 0,
  RecordSet: {
    set: 'RecordSet',
    parameters: {},
    owns$parameter: false
  },
  'RecordSet(\'abc\')': {
    set: 'RecordSet',
    key: 'abc',
    parameters: {},
    owns$parameter: false
  },
  'AppSetting(application=\'Example\',version=1,setting=\'Preview\')': {
    set: 'AppSetting',
    key: {
      application: 'Example',
      version: 1,
      setting: 'Preview'
    },
    parameters: {},
    owns$parameter: false
  },
  'RecordSet(\'123\')/Tags': {
    set: 'RecordSet',
    key: '123',
    navigationProperties: ['Tags'],
    parameters: {},
    owns$parameter: false
  },
  'RecordSet(456)/Tags/Records': {
    set: 'RecordSet',
    key: 456,
    navigationProperties: ['Tags', 'Records'],
    parameters: {},
    owns$parameter: false
  },
  'RecordSet?search=abc': {
    set: 'RecordSet',
    parameters: {
      search: 'abc'
    },
    owns$parameter: false
  },
  'RecordSet?search=123': {
    set: 'RecordSet',
    parameters: {
      search: '123'
    },
    owns$parameter: false
  },
  'RecordSet?$top=10&$skip=0': {
    set: 'RecordSet',
    parameters: {
      $skip: 0,
      $top: 10
    },
    owns$parameter: true
  },
  'RecordSet?$skip=0&$top=10': {
    set: 'RecordSet',
    parameters: {
      $skip: 0,
      $top: 10
    },
    owns$parameter: true
  },
  'RecordSet?$top=10&$skip=': 0,
  'RecordSet?$top=10&$skip=a': 0,
  'RecordSet?$top=10&$skip=-1': 0,
  'RecordSet?$top=10&$skip=-1a': 0,
  'RecordSet?$top=&$skip=0': 0,
  'RecordSet?$top=a&$skip=0': 0,
  'RecordSet?$top=-1&$skip=0': 0,
  'RecordSet?$top=-1a&$skip=0': 0,
  'RecordSet?$skip=123&$orderby=Rating asc,Priority,Category/Name desc&$top=456': {
    set: 'RecordSet',
    parameters: {
      $skip: 123,
      $top: 456,
      $orderby: [{
        property: 'Rating',
        ascending: true
      }, {
        property: 'Priority',
        ascending: true
      }, {
        property: 'Category/Name',
        ascending: false
      }]
    },
    owns$parameter: true
  },
  'RecordSet?$orderby=Rating': {
    set: 'RecordSet',
    parameters: {
      $orderby: [{
        property: 'Rating',
        ascending: true
      }]
    },
    owns$parameter: true
  },
  'RecordSet?$orderby=Category/Name desc': {
    set: 'RecordSet',
    parameters: {
      $orderby: [{
        property: 'Category/Name',
        ascending: false
      }]
    },
    owns$parameter: true
  },
  'RecordSet?$orderby=Category/Name abc': 0,
  'RecordSet?$orderby=Category/Name dec': 0,
  'RecordSet?$orderby=Category/Name ascending': 0,
  'RecordSet?$orderby=Category/Name not even close': 0,
  'RecordSet?$expand=tags,parent,children': {
    set: 'RecordSet',
    parameters: {
      $expand: ['tags', 'parent', 'children']
    },
    owns$parameter: true
  },
  'RecordSet?$select=Name,Count': {
    set: 'RecordSet',
    parameters: {
      $select: ['Name', 'Count']
    },
    owns$parameter: true
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
    },
    owns$parameter: true
  },
  'Suppliers?$filter=Address/City eq \'Redmond\'': {
    set: 'Suppliers',
    parameters: {
      $filter: {
        eq: [
          { property: 'Address/City' },
          'Redmond'
        ]
      }
    },
    owns$parameter: true
  },
  'Suppliers?$filter=Address/City ne \'London\'': {
    set: 'Suppliers',
    parameters: {
      $filter: {
        ne: [
          { property: 'Address/City' },
          'London'
        ]
      }
    },
    owns$parameter: true
  },
  'Products?$filter=Price gt 20': {
    set: 'Products',
    parameters: {
      $filter: {
        gt: [
          { property: 'Price' },
          20
        ]
      }
    },
    owns$parameter: true
  },
  'Products?$filter=Price ge 10': {
    set: 'Products',
    parameters: {
      $filter: {
        gte: [
          { property: 'Price' },
          10
        ]
      }
    },
    owns$parameter: true
  },
  'Products?$filter=Price lt 20': {
    set: 'Products',
    parameters: {
      $filter: {
        lt: [
          { property: 'Price' },
          20
        ]
      }
    },
    owns$parameter: true
  },
  'Products?$filter=Price le 100': {
    set: 'Products',
    parameters: {
      $filter: {
        lte: [
          { property: 'Price' },
          100
        ]
      }
    },
    owns$parameter: true
  },
  'Products?$filter=Price le 200 and Price gt 3.5': {
    set: 'Products',
    parameters: {
      $filter: {
        and: [{
          lte: [
            { property: 'Price' },
            200
          ]
        }, {
          gt: [
            { property: 'Price' },
            3.5
          ]
        }]
      }
    },
    owns$parameter: true
  },
  'Products?$filter=Price le 200 and Price gt 3.5 and Price ne 100': {
    set: 'Products',
    parameters: {
      $filter: {
        and: [{
          lte: [
            { property: 'Price' },
            200
          ]
        }, {
          gt: [
            { property: 'Price' },
            3.5
          ]
        }, {
          ne: [
            { property: 'Price' },
            100
          ]
        }]
      }
    },
    owns$parameter: true
  },
  'Products?$filter=Price le 3.5 or Price gt 200': {
    set: 'Products',
    parameters: {
      $filter: {
        or: [{
          lte: [
            { property: 'Price' },
            3.5
          ]
        }, {
          gt: [
            { property: 'Price' },
            200
          ]
        }]
      }
    },
    owns$parameter: true
  },
  'Products?$filter=Price le 3.5 or Price gt 200 or Price eq 100': {
    set: 'Products',
    parameters: {
      $filter: {
        or: [{
          lte: [
            { property: 'Price' },
            3.5
          ]
        }, {
          gt: [
            { property: 'Price' },
            200
          ]
        }, {
          eq: [
            { property: 'Price' },
            100
          ]
        }]
      }
    },
    owns$parameter: true
  },
  'Products?$filter=creationdate ge DateTime\'2020-11-25T02:30:17\'': {
    set: 'Products',
    parameters: {
      $filter: {
        gte: [
          { property: 'creationdate' },
          1606271417000 /* converted to time to enable comparison */
        ]
      }
    },
    owns$parameter: true
  },
  'Products?$filter=Price invalid_op 100': 0,
  'Products?$filter=Price le 3.5 or': 0,
  'Products?$filter=Price le 3.5 or Price': 0,
  'Products?$filter=Price le 3.5 or Price eq': 0
}

describe('parseUrl', () => {
  Object.keys(scenarios).forEach(url => {
    let label = url
    if (!scenarios[url]) {
      label = '(error) ' + label
    }
    it(label, () => {
      if (!scenarios[url]) {
        assert.throws(() => parseUrl(url))
      } else {
        assert.deepStrictEqual(parseUrl(url), scenarios[url])
      }
    })
  })
})
