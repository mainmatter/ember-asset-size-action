/* eslint-disable no-global-assign, import/extensions */
require = require('esm')(module);
module.exports = require('./main.js');

if (process.env.NODE_ENV !== 'TEST') {
  // execute the run() function
  module.exports.default();
}
