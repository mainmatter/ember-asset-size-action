import prettyBytes from 'pretty-bytes';
import { exec } from '@actions/exec';
import assetSizeReporter from 'asset-size-reporter';
import fs from 'fs';
import semver from 'semver';

export function normaliseFingerprint(obj) {
  const normalisedObject = {};

  Object.keys(obj).forEach((key) => {
    const chunkRegex = /dist\/assets\/(chunk\.\d+)\.\w+(.\w+)/;
    const assetRegex = /dist\/assets\/([\w-]+)-\w{32}(.\w+)/;

    const match = key.match(assetRegex) || key.match(chunkRegex);

    if (match) {
      const [, fileName, extension] = match;
      normalisedObject[`${fileName}${extension}`] = obj[key];
    } else {
      console.log(`Ignoring file ${key} as it does not match known asset file pattern`);
    }
  });

  return normalisedObject;
}

export function diffSizes(baseBranch, pullRequestBranch) {
  const diffObject = {};

  const fileSizes = { ...baseBranch, ...pullRequestBranch };
  Object.keys(fileSizes).forEach((key) => {
    const newSize = pullRequestBranch[key];
    const originSize = baseBranch[key];

    // new file i.e. does not exist in origin
    if (!originSize) {
      diffObject[key] = {
        raw: newSize.raw,
        gzip: newSize.gzip,
      };
    // deleted file i.e. does not exist in new branch
    } else if (!newSize) {
      diffObject[key] = {
        raw: 0 - originSize.raw,
        gzip: 0 - originSize.gzip,
        deleted: true
      };
    } else {
      diffObject[key] = {
        raw: newSize.raw - originSize.raw,
        gzip: newSize.gzip - originSize.gzip,
      };
    }
  });

  return diffObject;
}

export async function getPullRequest(context, octokit) {
  const pr = context.payload.pull_request;

  if (!pr) {
    console.log('Could not get pull request number from context, exiting');
    return;
  }

  const { data: pullRequest } = await octokit.rest.pulls.get({
    owner: pr.base.repo.owner.login,
    repo: pr.base.repo.name,
    pull_number: pr.number,
  });

  return pullRequest;
}

export async function installDependencies() {
  if (fs.existsSync('yarn.lock')) {
    return exec('yarn --frozen-lockfile');
  }

  if (fs.existsSync('package-lock.json')) {
    const packageLock = JSON.parse(fs.readFileSync('package-lock.json'));
    let npmVersion = '';
    await exec('npm -v', {
      stdout: (data) => {
        npmVersion += data.toString();
      },
    });

    if (
      packageLock.lockfileVersion === 2
      && semver.lt(npmVersion, '7.0.0')
    ) {
      return exec('npx npm@7 ci');
    }

    return exec('npm ci');
  }

  console.warn('No package-lock.json or yarn.lock detected! We strongly recommend committing one');
  return exec('npm install');
}

export async function getAssetSizes() {
  await installDependencies();

  await exec('npx ember build -prod');

  let prAssets;

  await assetSizeReporter({
    patterns: ['dist/assets/**.js', 'dist/assets/**.css'],
    json: true,
    console: {
      log(text) {
        prAssets = JSON.parse(text);
      },
    },
    cwd: process.cwd(),
  });

  return prAssets;
}

function reportTable(data, wrapInDetails = true) {
  let table = `File | raw | gzip
--- | --- | ---
`;
  data.forEach((item) => {
    table += `${item.file}|${prettyBytes(item.raw, { signed: true })}|${prettyBytes(item.gzip, { signed: true })}\n`;
  });

  if (wrapInDetails) {
    return `<details>
  <summary>Details</summary>

${table}
</details>
`;
  }

  return table;
}

export function buildOutputText(output, showTotals) {
  const files = Object.keys(output).map((key) => ({
    file: key,
    raw: output[key].raw,
    gzip: output[key].gzip,
    deleted: output[key].deleted
  }));

  const bigger = [];
  const smaller = [];
  const same = [];
  const deleted = [];

  files.forEach((file) => {
    // the minimum change should be 10 bytes (bigger or smaller) before it is reported
    // this helps to avoid the slight jitter you sometimes find in the file sizes
    if (file.deleted) {
      deleted.push(file);
    } else if (file.raw > 10) {
      bigger.push(file);
    } else if (file.raw < -10) {
      smaller.push(file);
    } else {
      same.push(file);
    }
  });

  let outputText = '';
  const totalFiles = bigger.length + smaller.length + deleted.length + same.length;

  if (bigger.length) {
    outputText += `${bigger.length}/${totalFiles} Files got Bigger 🚨:\n\n${reportTable(bigger)}\n`;
  }

  if (smaller.length) {
    outputText += `${smaller.length}/${totalFiles} Files got Smaller 🎉:\n\n${reportTable(smaller)}\n`;
  }

  if (deleted.length) {
    outputText += `${deleted.length}/${totalFiles} Files got Deleted 🗑️:\n\n${reportTable(deleted)}\n`;
  }

  if (same.length) {
    outputText += `${same.length}/${totalFiles} Files stayed the same size 🤷‍:\n\n${reportTable(same)}\n`;
  }

  if (showTotals) {
    const totals = calculateTotals(files);
    const totalsRows = [
      { file: 'js', ...totals.js },
      { file: 'css', ...totals.css },
    ];

    outputText += `Total assets size diff📊:\n\n${reportTable(totalsRows, false)}`;
  }

  return outputText.trim();
}

function calculateTotals(files) {
  const result = {
    js: {
      raw: 0,
      gzip: 0,
    },
    css: {
      raw: 0,
      gzip: 0,
    },
  };

  files.forEach((file) => {
    if (file.file.endsWith('.js')) {
      result.js.raw += file.raw;
      result.js.gzip += file.gzip;
    }

    if (file.file.endsWith('.css')) {
      result.css.raw += file.raw;
      result.css.gzip += file.gzip;
    }
  });

  return result;
}
