'use strict';

const combineSizeMaps = require('./combine-size-maps');
const reportCombinedSizeMap = require('./report-combined-size-map');

module.exports = (sizeMap, { console }) => {
  let combined = combineSizeMaps(sizeMap, sizeMap);
  reportCombinedSizeMap(combined, { console });
};
