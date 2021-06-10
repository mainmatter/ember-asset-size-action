import { expect } from 'chai';
import { buildOutputText } from '../lib/helpers.mjs';

describe('Build output Text', function () {
  it('should show the correct table output for a file diff', function () {
    const diff = {
      'auto-import-fastboot.js': { raw: 221142, gzip: 76707 },
      'ember-website.js': { raw: -2995, gzip: -1013 },
      'ember-website-fastboot.js': { raw: 0, gzip: 0 },
      'vendor.js': { raw: -388401, gzip: -129560 },
      'ember-website.css': { raw: 0, gzip: 0 },
      'vendor.css': { raw: 0, gzip: 0 },
      'slightly-bigger.css': { raw: 7, gzip: 0 },
      'slightly-smaller.css': { raw: -3, gzip: 0 },
    };

    const text = buildOutputText(diff);

    expect(text).to.equal(`1/8 Files got Bigger 🚨:

<details>
  <summary>Details</summary>

File | raw | gzip
--- | --- | ---
auto-import-fastboot.js|+221 kB|+76.7 kB

</details>

2/8 Files got Smaller 🎉:

<details>
  <summary>Details</summary>

File | raw | gzip
--- | --- | ---
ember-website.js|-3 kB|-1.01 kB
vendor.js|-388 kB|-130 kB

</details>

5/8 Files stayed the same size 🤷‍:

<details>
  <summary>Details</summary>

File | raw | gzip
--- | --- | ---
ember-website-fastboot.js| 0 B| 0 B
ember-website.css| 0 B| 0 B
vendor.css| 0 B| 0 B
slightly-bigger.css|+7 B| 0 B
slightly-smaller.css|-3 B| 0 B

</details>`);
  });

  it('should include total asset sizes when provided', function () {
    const diff = {
      'auto-import-fastboot.js': { raw: 221142, gzip: 76707 },
      'ember-website.js': { raw: -2995, gzip: -1013 },
      'ember-website-fastboot.js': { raw: 0, gzip: 0 },
      'vendor.js': { raw: -388401, gzip: -129560 },
      'ember-website.css': { raw: 0, gzip: 0 },
      'vendor.css': { raw: 0, gzip: 0 },
    };

    const text = buildOutputText(diff, true);

    expect(text).to.equal(`1/6 Files got Bigger 🚨:

<details>
  <summary>Details</summary>

File | raw | gzip
--- | --- | ---
auto-import-fastboot.js|+221 kB|+76.7 kB

</details>

2/6 Files got Smaller 🎉:

<details>
  <summary>Details</summary>

File | raw | gzip
--- | --- | ---
ember-website.js|-3 kB|-1.01 kB
vendor.js|-388 kB|-130 kB

</details>

3/6 Files stayed the same size 🤷‍:

<details>
  <summary>Details</summary>

File | raw | gzip
--- | --- | ---
ember-website-fastboot.js| 0 B| 0 B
ember-website.css| 0 B| 0 B
vendor.css| 0 B| 0 B

</details>

Total assets size diff📊:

File | raw | gzip
--- | --- | ---
js|-170 kB|-53.9 kB
css| 0 B| 0 B`);
  });
});
