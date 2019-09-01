
asset-size-reporter
==============================================================================

Generic asset size comparison and reporting tool


Installation
------------------------------------------------------------------------------

```bash
npm install -g asset-size-reporter
```


Usage
------------------------------------------------------------------------------

Print asset sizes to the console:

```
$ asset-size-reporter "dist/*.js"

dist/bar.js: 13.6 kB / 1.20 kB gzip 
dist/foo.js: 42.3 kB / 2.32 kB gzip 

Total: 55.9 kB / 3.52 kB gzip 
```

Write asset size report to a JSON file:

```
$ asset-size-reporter "dist/*.js" --json > asset-size-report.json
```

Compare asset sizes to a previous reports:

```
$ asset-size-reporter "dist/*.js" --compare=previous.json

dist/bar.js: 13.6 kB -> 13.8 kB (+213 Byte) / 1.20 kB -> 1.21 kB (+25 Byte) gzip 
dist/baz.js: 11.2 kB / 1.04 kB gzip (new file) 
[dist/foo.js]: 42.3 kB / 2.32 kB gzip (deleted file) 

Total: 55.9 kB -> 25.0 kB (-30.9 kB) / 3.52 kB -> 2.25 kB (-1.27 kB) gzip 
```


Configuration
------------------------------------------------------------------------------

Instead of defining the asset search paths on the command line it is also
possible to create an `asset-size-reporter.config.json` file that contains
the configuration.

Possible configuration options are:

- `patterns` – `string[]` – An array of `glob` patterns that describe what files
  should be considered by the asset-size-reporter

  ```json
  {
    "patterns": [
      "dist/*.css",
      "dist/*.js",
      "!dist/tests.js"
    ]
  }
  ```

- `gzip` – `boolean|number` – Turn gzip reporting on/off or set a specific
  gzip compression level (default: `true`)

- `brotli` – `boolean|number` – Turn brotli reporting on/off or set a specific
  brotli compression level (default: `false`)


License
------------------------------------------------------------------------------

ember-test-selectors is developed by and &copy;
[simplabs GmbH](http://simplabs.com) and contributors. It is released under the
[MIT License](https://github.com/simplabs/ember-simple-auth/blob/master/LICENSE).
