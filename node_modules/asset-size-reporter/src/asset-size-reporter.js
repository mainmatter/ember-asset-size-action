'use strict';

const fs = require('fs-extra');

const createSizeMap = require('./create-size-map');
const reportSizeMap = require('./report-size-map');
const combineSizeMaps = require('./combine-size-maps');
const reportCombinedSizeMap = require('./report-combined-size-map');

module.exports = async ({ patterns, json, compare, gzip, brotli, fingerprintPattern, console, cwd }) => {
  if (gzip === undefined) {
    gzip = true;
  }

  let sizeMap = await createSizeMap(patterns, { gzip, brotli, fingerprintPattern, cwd });

  if (json) {
    console.log(JSON.stringify(sizeMap, null, 2));

  } else if (compare) {
    if (typeof compare === 'string') {
      compare = fs.readJsonSync(compare);
    }

    let combined = combineSizeMaps(compare, sizeMap);
    return reportCombinedSizeMap(combined, { console });

  } else {
    reportSizeMap(sizeMap, { console });
  }

  return { exitCode: 0 };
};
