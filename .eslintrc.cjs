module.exports = {
  env: {
    node: true,
  },
  extends: 'airbnb-base',
  rules: {
    'consistent-return': 0,
    'no-console': 0,
    'import/extensions': 0,
  },
  ignorePatterns: ['dist/*.js'],
  overrides: [
    // node files
    {
      files: [
        'test/**/*.mjs',
      ],
      env: {
        node: true,
        mocha: true,
      },
      rules: {
        'prefer-arrow-callback': 0,
        'func-names': 0,
      },
    },
  ],
};
