'use strict';

module.exports = {
  displayName: 'lint',
  runner: 'jest-runner-eslint',
  testMatch: [
    '<rootDir>/*.js',
    '<rootDir>/src/**/*.js',
    '<rootDir>/tests/**/*-test.js',
  ],
};
