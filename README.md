# Ember Asset Size

This action will calculate the diff in asset size for your main JS files and CSS files for each PR. It will then comment with the change in asset size on each PR.

## Example usage

Create a file named `.github/workflows/ember-assets.yml` in your repo and add the following:

```yaml
name: Node CI

on: [pull_request]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@master
    - uses: simplabs/ember-asset-size-action@v1
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
```
