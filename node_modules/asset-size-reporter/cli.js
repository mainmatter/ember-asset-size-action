#!/usr/bin/env node

'use strict';

const meow = require('meow');
const assetSizeReporter = require('.');

let help = `
	Usage
	  $ asset-size-reporter <pattern>...
	  $ asset-size-reporter <pattern>... --json
	  $ asset-size-reporter <pattern>... --compare=<path>

	Options
	  --json                   Output asset size report as JSON
	  --compare=<path>         Compare asset sizes to previous JSON report
	  --gzip, --no-gzip        Enable/Disable gzip size reporting 
	  --brotli                 Enable brotli size reporting
	  --fingerprint=<pattern>  Regular expression for filtering out fingerprints in paths (first match group is dropped)

	Examples
    $ asset-size-reporter "dist/*.js"

    dist/bar.js: 13.6 kB / gzip 1.20 kB
    dist/foo.js: 42.3 kB / gzip 2.32 kB

    Total: 55.9 kB / gzip 3.52 kB
`;

let cli = meow(help, {
  flags: {
    json: {
      type: 'boolean',
    },
    compare: {
      type: 'string',
    },
    gzip: {
      type: 'boolean',
    },
    brotli: {
      type: 'boolean',
    },
    fingerprint: {
      type: 'string',
    },
  },
});

let options = {
  patterns: cli.input,
  json: cli.flags.json,
  compare: cli.flags.compare,
  gzip: cli.flags.gzip,
  brotli: cli.flags.brotli,
  fingerprintPattern: cli.flags.fingerprint,

  console,
  cwd: process.cwd(),
};

assetSizeReporter(options).then(({ exitCode }) => {
  process.exit(exitCode);
});
