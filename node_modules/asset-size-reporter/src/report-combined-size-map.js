'use strict';

const { basename, dirname } = require('path');
const chalk = require('chalk');

const prettyBytes = require('./pretty-bytes');
const sumSizes = require('./sum-sizes');

module.exports = (combined, { console }) => {
  let sumAfter = { raw: 0, gzip: null, brotli: null };
  let sumBefore = { raw: 0, gzip: null, brotli: null };

  for (let path of Object.keys(combined)) {
    let after = combined[path].after;
    let before = combined[path].before;

    if (after !== undefined) {
      sumAfter = sumSizes(sumAfter, after);
    }

    if (before !== undefined) {
      sumBefore = sumSizes(sumBefore, before);
    }

    let output = formatLine(path, before, after);

    console.log(output);
  }

  let output = formatLine('Total', sumBefore, sumAfter);
  console.log();
  console.log(output);

  return { exitCode: sumAfter.raw > sumBefore.raw ? 1 : 0 };
};

function formatLine(path, before, after) {
  let added = before === undefined;
  let deleted = after === undefined;

  let output = path === 'Total'
    ? chalk`{bold Total}{dim :} `
    : formatPathPrefix(path, { deleted });

  if (deleted) {
    // file was deleted
    output += formatDiff(before.raw);
    if (before.gzip !== null) {
      output += chalk` {dim /} ${formatDiff(before.gzip)} {dim gzip}`;
    }
    output += ` (deleted file)`;

    output = chalk.gray(output);

  } else if (added) {
    // file was added
    output += formatDiff(after.raw);
    if (after.gzip !== null) {
      output += chalk` {dim /} ${formatDiff(after.gzip)} {dim gzip}`;
    }
    output += ` (new file)`;

    output = chalk.blue(output);

  } else {
    // file was modified
    output += formatDiff(before.raw, after.raw);
    if (before.gzip !== null && after.gzip !== null) {
      output += chalk` {dim /} ${formatDiff(before.gzip, after.gzip)} {dim gzip}`;
    }

    if (before.raw > after.raw) {
      output = chalk.green(output);
    } else if (before.raw < after.raw) {
      output = chalk.red(output);
    }
  }

  return output;
}

function formatPathPrefix(path, { deleted } = {}) {
  let dir = dirname(path);
  let base = basename(path);
  return chalk`${deleted ? '[' : ''}{dim ${dir}/}${base}${deleted ? ']' : ''}{dim :} `;
}

function formatDiff(before, after = before) {
  if (before === after) {
    return chalk.bold(prettyBytes(after));
  }

  return chalk`{dim ${prettyBytes(before)} ->} {bold ${prettyBytes(after)}} ({bold ${prettyBytes(after - before, { signed: true })}})`;
}
