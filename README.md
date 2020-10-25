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
    "fs": "reserve-fs"
  },
  "mappings": [{
    "match": "\\/fs",
    "fs": "./"
  }]
}
```

* In the HTML page :
```html
<script src='/fs'></script>
```

* In JavaScript :
```javascript
fs.readdirAsync('folder')
  .then(names => names.forEach(async name => {
    const stat = await fs.statAsync('folder/' + name)
    console.log(name, stat.size, stat.ctime, stat.mtime)
  }))
```

## Options

| Option | Default Value | Explanation |
|---|---|---|
| `client-name` | `'fs'` | Name of the member added to the browser window |
| `read-only` | `false` | Forbids write methods if `true` |

All APIs are **restricted** to the scope of the path configured in the mapping. Any attempt to read or write elsewhere will lead to a `403` error.

## Supported APIs

The following APIs are supported. A promisified version of each method is provided under the same name suffixed with `Async` (for instance: `fs.readdirAsync`).

* read-only
  * [`fs.readdir`](https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback)
  * [`fs.readFile`](https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback): the returned data is converted to text
  * [`fs.stat`](https://nodejs.org/api/fs.html#fs_fs_fstat_fd_options_callback)
* read/write
  * [`fs.mkdir`](https://nodejs.org/api/fs.html#fs_fs_mkdir_path_options_callback)
  * [`fs.rmdir`](https://nodejs.org/api/fs.html#fs_fs_rmdir_path_options_callback)
  * [`fs.unlink`](https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback)
  * [`fs.writeFile`](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback): `file` must be a file name, `data` is a string
