# Ember Asset Size

This action will calculate the diff in asset size for your main JS files and CSS files for each PR. It will then comment with the change in asset size on each PR.

## Example usage

Create a file named `.github/workflows/ember-assets.yml` in your repo and add the following:

```yaml
name: Ember Asset Sizes

on: [pull_request]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2-beta
      with:
        fetch-depth: 0
    - uses: simplabs/ember-asset-size-action@v1
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

Note: as this action requires access to the "base" commit of a PR branch we need to fetch the whole repo by adding `fetch-depth: 0` to the `actions/checkout` configuration.

If you would like to follow discussion on this problem you can find the issue on github here: https://github.com/actions/checkout/issues/93
