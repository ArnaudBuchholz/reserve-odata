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
  'AppSetting(application=\'Example\',version=1,setting=\'Preview\')': {
    set: 'AppSetting',
    key: {
      application: 'Example',
      version: 1,
      setting: 'Preview'
    }
  },
  'RecordSet(\'123\')/Tags': {
    set: 'RecordSet',
    key: '123',
    navigationProperties: ['Tags']
  },
  'RecordSet(456)/Tags/Records': {
    set: 'RecordSet',
    key: 456,
    navigationProperties: ['Tags', 'Records']
  },
  'RecordSet?search=abc': {
    set: 'RecordSet',
    parameters: {
      search: 'abc'
    }
  },
  'RecordSet?search=123': {
    set: 'RecordSet',
    parameters: {
      search: '123'
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
      let exceptionCaught
      try {
        assert.deepStrictEqual(parseUrl(url), scenarios[url])
      } catch (e) {
        exceptionCaught = true
      }
      assert.ok(scenarios[url] || exceptionCaught)
    })
  })
})
