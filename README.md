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
    "data-provider-classes": "./dpc.js"
  }]
}
```

## Options

| Option | Type / Default Value | Explanation |
|---|---|---|
| `service-namespace` | `'ODATANS'` | Service namespace |
| `use-sap-extension` | `false` | `true` to insert SAP specific information in the `$metadata` |
| `data-provider-classes` | function or string | Asynchronous function (or module exporting an asynchronous function) returning the list of **data provider classes** (see below) |

## Data Provider Class

Entities definition and records are made available through JavaScript **classes**.
The class not only defines the entity structure *(name and members)* but also it gives information about linked entities *(through navigation properties)*. Last but not least, it contains methods to manipulate the entities.

**IMPORTANT NOTE** : No **synchronization mechanism** is in place to ensure that **concurrent operations** *(read, create, update or delete)* return **consistent results**. For instance, if the delete implementation takes time, it is possible to do a concurrent read that will return the entity while it is being deleted.

### *(optional)* `async EntityClass.get (request, key) : object`

Retreives one entity based on its key.

Depending on the entity definition, there might be **one** or **multiple** fields in the key :
* When only one field is composing the key, the key **value** is passed.
* Otherwise, a **dictionary** mapping each property composing the key to the expected value is passed.

If a [falsy value](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) is returned, the entity is considered not existing.

This method is optional : when not defined, the handler will use `EntityClass.list`

### `async EntityClass.list (request, filters) : []`
### *or* `async EntityClass.list (request) : []`

Retreives all entities or a filtered list, expected result is an object array.

Based on the method [signature](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length), the filters might be either **passed** or **applied internally** after getting all entities.

Filters definition is based on the structure [gpf.typedef.filterItem](https://arnaudbuchholz.github.io/gpf/doc/gpf.typedef.html#.filterItem__anchor) and refer to **class properties** *(rather than ODATA properties)*.

**NOTE** : the `contains` operator is **not implemented**.

This method is used for most `READ` operations. The following [ODATA parameters](https://www.odata.org/documentation/odata-version-2-0/uri-conventions/) are handled internally :
* `$select` for attributes selection
* `$sort` for sorting entries
* `$top` and `$skip` for paging

### *(optional)* `async EntityClass.create (request, properties) : object`

Creates a new entity, it **must** return the created entity.

The `properties` parameter is a **dictionary** containing the **deserialized values** indexed by their **class properties** *(rather than ODATA properties)*.

Besides basic type checking done upon deserializing the properties, **no validation** is applied before calling the method.

This method is optional : when not defined, the entity set is **not creatable** and any creation attempt will fail.

### `async EntityClass.update (request, entity, updates)`

Updates an existing entity.

The `updates` parameter is a dictionary listing the **class properties that are updated** *(rather than ODATA properties)*. Wheter the client call uses `PUT` or `MERGE`, only the **relevant** updates are passed to this method.

When the client call uses `PUT` and a property is missing, the `updates` parameter associate the class property to `undefined`.

Besides basic type checking done upon deserializing the updates, **no validation** is applied before calling the method.

This method is optional : when not defined, the entity set is **not updatable** and any update attempt will fail.

### `async EntityClass.delete (request, key)`

Deletes an existing entity.

This method is optional : when not defined, the entity set is **not deletable** and any delete attempt will fail.

## Attributes

To change the way entities are exposed through the ODATA service, several attributes (or [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)) must be used.

First, the [gpf.attributes.Serializable Attribute](https://arnaudbuchholz.github.io/gpf/doc/gpf.attributes.Serializable.html) decides which properties are exposed by defining their ODATA name and type.

The types are mapped as detailled below :

| [gpf.serial.types](https://arnaudbuchholz.github.io/gpf/doc/gpf.serial.html#.types__anchor) | [OData type](https://www.odata.org/documentation/odata-version-2-0/overview) |
|---|---|
| string | Edm.String |
| integer | Edm.Int64 |
| datetime | Edm.DateTime |

Then, the following attributes can be used to provide additional information.

### `reserve-odata/attributes/Entity (name, [setName])`

Can be used to define the entity name as well as the entity set name.

### `reserve-odata/attributes/Key ()`

Specifies which properties are composing the key of the entity.

### `reserve-odata/attributes/Sortable ()`

Can be used to flag a sortable property.

### `reserve-odata/attributes/Filterable ()`

Can be used to flag a filterable property.

## Supported APIs

### `GET $metadata`

Returns the **XML schema description**.

### `GET <EntitySet>`

Returns entities.

Supports: `$filter`, `$sort`, `$select`, `$skip`, `$stop`, `$expand`

### `GET <EntitySet>(<Key values>)`

Returns **one** entity.

Supports: `$select`, `$expand`

### `GET <EntitySet>(<Key values>)/<navigationProperty>`

Returns **one or multiple** entities.

Supports: `$filter`, `$sort`, `$select`, `$skip`, `$stop`, `$expand`

### `POST <EntitySet>`

Creates a new entity.

### `PUT <EntitySet>(<Key values>)`

Updates an entity.

### `MERGE <EntitySet>(<Key values>)`

Updates an entity using differential update.

## Examples

The code is fully tested, the mocha suite provides examples for each feature :

* [Record](https://github.com/ArnaudBuchholz/reserve-odata/blob/master/tests/Record.js)
* [Tag](https://github.com/ArnaudBuchholz/reserve-odata/blob/master/tests/Tag.js)
* [AppSetting](https://github.com/ArnaudBuchholz/reserve-odata/blob/master/tests/AppSetting.js)
* [Value](https://github.com/ArnaudBuchholz/reserve-odata/blob/master/tests/Value.js)
