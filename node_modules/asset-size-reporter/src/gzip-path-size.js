'use strict';

const gzipSize = require('gzip-size');

module.exports = async (path, { level } = {}) => gzipSize.file(path, { level });
