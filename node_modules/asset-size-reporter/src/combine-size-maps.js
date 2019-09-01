'use strict';

module.exports = (before, after) => {
  let paths = Object.keys(before)
    .concat(Object.keys(after))
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort();

  let result = {};
  for (let path of paths) {
    result[path] = {
      before: before[path],
      after: after[path],
    };
  }

  return result;
};
