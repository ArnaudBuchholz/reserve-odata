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

| Option | Type / Default Value | Explanation |
|---|---|---|
| `service-namespace` | `'ODATANS'` | Service namespace |
| `use-sap-extension` | `false` | `true` to insert SAP specific information in the $metadata |
| `data-provider-classes` | function or string | Asynchronous function that returns the data provider classes |

## Data Provider Class

Each EntityClass must be decorated with specific attributes to control the way the entity is serialized.

It must also offer the following static members :

### `async EntityClass.read (keys) : object`

Might be changed thanks to a class attribute

Get an entity using its key

### `async EntityClass.list (filters, context) : []`

Might be changed thanks to a class attribute

filters might include parent entity for navigation properties
$parent
$navigationProperty
First level properties are AND gpf.typedef.filterItem

$select, $sort, $top & $skip are handled internally

Context might be filled when relative to a navigation property :
```javascript
{
  "navigationProperty": "toExample",
  "parent": {}
}
```

### `async EntityClass.create (properties) : object`

Used for create

### Update & Delete

Methods should be flagged with a specific attribute (if the attribute does not exist, then methods are forbidden)

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

### `reserve-odata/attributes/EntitySetName`

TBD

### `reserve-odata/attributes/Creatable`

Class attribute
TBD option to introduce the static method name

### `reserve-odata/attributes/Deletable`

Class attribute
TBD option to introduce the instance method name

### `reserve-odata/attributes/Updatable`

Class attribute
TBD option to introduce the instance method name

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

