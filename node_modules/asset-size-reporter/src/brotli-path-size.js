'use strict';

const execa = require('execa');
const Counter = require('passthrough-counter');

module.exports = async (path, { level } = {}) => new Promise((resolve, reject) => {
  let counter = new Counter();

  let promise = execa('brotli', ['-c', `-${level !== undefined ? level : 'Z'}`, '-k', path]);

  let stream = promise.stdout;
  stream.on('error', reject);
  stream.pipe(counter).once('finish', () => {
    stream.end();

    promise
      .then(() => resolve(counter.length))
      .catch(reject);
  });
});
