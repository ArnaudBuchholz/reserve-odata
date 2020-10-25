# REserve/**ODATA**
ODATA handler for [REserve](https://npmjs.com/package/reserve).

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
    "odata": "$1"
  }]
}
```

## Options

| Option | Default Value | Explanation |
|---|---|---|
| `test` | `'test'` | test |

## Supported APIs
