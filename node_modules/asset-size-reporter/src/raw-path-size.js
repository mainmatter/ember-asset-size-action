'use strict';

const fs = require('fs-extra');

module.exports = async path => {
  let stats = await fs.stat(path);
  return stats.size;
};
