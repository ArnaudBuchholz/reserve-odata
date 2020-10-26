# REserve/**ODATA**
Simple [ODATA v2](https://www.odata.org/documentation/odata-version-2-0/) handler for [REserve](https://npmjs.com/package/reserve).

[![Travis-CI](https://travis-ci.org/ArnaudBuchholz/reserve-odata.svg?branch=master)](https://travis-ci.org/ArnaudBuchholz/reserve-odata#)
[![Coverage Status](https://coveralls.io/repos/github/ArnaudBuchholz/reserve-odata/badge.svg?branch=master)](https://coveralls.io/github/ArnaudBuchholz/reserve-odata?branch=master)
[![Package Quality](https://npm.packagequality.com/shield/reserve-odata.svg)](https://packagequality.com/#?package=reserve-odata)
[![Known Vulnerabilities](https://snyk.io/test/github/ArnaudBuchholz/reserve-odata/badge.svg?targetFile=package.json)](https://snyk.io/test/github/ArnaudBuchholz/reserve-odata?targetFile=package.json)
[![dependencies Status](https://david-dm.org/ArnaudBuchholz/reserve-odata/status.svg)](https://david-dm.org/ArnaudBuchholz/reserve-odata)
[![devDependencies Status](https://david-dm.org/ArnaudBuchholz/reserve-odata/dev-status.svg)](https://david-dm.org/ArnaudBuchholz/reserve-odata?type=dev)
[![reserve](https://badge.fury.io/js/reserve-odata.svg)](https://www.npmjs.org/package/reserve-odata)
[![reserve](http://img.shields.io/npm/dm/reserve-odata.svg)](https://www.npmjs.org/package/reserve-odata)
[![install size](https://packagephobia.now.sh/badge?p=reserve-odata)](https://packagephobia.now.sh/result?p=reserve-odata)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Usage

* In the mapping :
```json
{
  "handlers": {
    "odata": "reserve-odata"
  },
  "mappings": [{
    "match": "\\/api\\/odata\\/(.*)",
    "odata": "$1",
    "data-provider-factory": "./dpf.js"
  }]
}
```

## Options

| Option | Default Value | Explanation |
|---|---|---|
| `data-provider-factory` | function or string | Function that returns the IDataProvider interface |

## IDataProvider interface

### `async getEntityClasses () : []`

### `async getEntity (entitySetName, keys) : object`

Get an entity using its key

### `async getEntities (entitySetName, filters) : []`

filters might include parent entity for navigation properties
$parent
$navigationProperty
First level properties are AND gpf.typedef.filterItem

$select, $sort, $top & $skip are handled internally

## Attributes

To configure the ODATA service, one must use the [gpf.attributes.Serializable Attribute](https://arnaudbuchholz.github.io/gpf/doc/gpf.attributes.Serializable.html) as well as the following ones.

### `reserve-odata/attributes/Key`

Use it to flag the key properties of the entity

### `reserve-odata/attributes/Sortable`

Use it to flag the properties that can be sorted

### `reserve-odata/attributes/Filterable`

Use it to flag the properties that can be filtered

### `reserve-odata/attributes/Searchable`

Use it to flag the properties that can be searched

## Supported APIs

### `GET $metadata`

Returns the XML schema description

### `GET <EntitySet>`

Supports: $filter, $select, $skip, $stop, $expand

### `GET <EntitySet>(<Key values>)`

Supports: $select, $expand

### `GET <EntitySet>(<Key values>)/<navigationProperty>`

Supports: $filter, $select, $skip, $stop, $expand

### `POST <EntitySet>`

Creation

### `PUT <EntitySet>(<Key values>)`

Update

### `MERGE <EntitySet>(<Key values>)`

Differential update

