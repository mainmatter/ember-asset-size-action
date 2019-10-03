import { getInput, debug, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { GitHub, context } from '@actions/github';
import assetSizeReporter from 'asset-size-reporter';
import prettyBytes from 'pretty-bytes';

const repoInfo = context.repo;

let octokit;

async function run() {
  try {
    const myToken = getInput('repo-token', { required: true });
    octokit = new GitHub(myToken);
    const pullRequest = await getPullRequest();

    const prAssets = await getAssetSizes();

    console.log(prAssets);

    await exec(`git checkout ${pullRequest.base.sha}`);

    const masterAssets = await getAssetSizes();

    let fileDiffs = diffSizes(normaliseFingerprint(prAssets), normaliseFingerprint(masterAssets));

    await octokit.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: pullRequest.number,
      body: buildOutputText(fileDiffs),
    });
  } catch (error) {
    setFailed(error.message);
  }
}

async function getAssetSizes() {
  await exec('npm ci');
  await exec('npx ember build -prod');

  let prAssets;

  await assetSizeReporter({
    patterns: ['dist/assets/**.js', 'dist/assets/**.css'],
    json: true,
    console: {
      log(text) {
        prAssets = JSON.parse(text);
      }
    },
    cwd: process.cwd(),
  })

  return prAssets;
}

async function getPullRequest() {
  let pr = context.payload.pull_request;

  if (!pr) {
    console.log('Could not get pull request number from context, exiting');
    return;
  }

  const { data: pullRequest } = await octokit.pulls.get({
    owner: pr.base.repo.owner.login,
    repo: pr.base.repo.name,
    pull_number: pr.number
  })

  return pullRequest;
}

function normaliseFingerprint(obj) {
  let normalisedObject = {};

  Object.keys(obj).forEach((key) => {
    let match = key.match(/dist\/assets\/([\w-]+)-\w{32}(.\w+)/);

    if(match) {
      let [, fileName, extension] = match
      normalisedObject[`${fileName}${extension}`] = obj[key];
    } else {
      console.log(`Ignoring file ${key} as it does not match known asset file pattern`);
    }
  });

  return normalisedObject;
}

function diffSizes(destination, origin) {
  let diffObject = {}
  Object.keys(destination).forEach((key) => {
    let destinationSize = destination[key];
    let originSize = origin[key];

    // new file i.e. does not exist in origin
    if (!originSize) {
      diffObject[key] = destinationSize;
    } else {
      diffObject[key] = {
        raw: destinationSize.raw - originSize.raw,
        gzip: destinationSize.gzip - originSize.gzip,
      }
    }

    // TODO cater for deleted files
  });

  return diffObject;
}

export function buildOutputText(output) {
  let files = Object.keys(output).map((key) => {
    return {
      file: key,
      raw: output[key].raw,
      gzip: output[key].gzip,
    }
  });

  let bigger = [];
  let smaller = [];
  let same = [];

  files.forEach((file) => {
    if(file.raw > 0) {
      bigger.push(file);
    } else if (file.raw < 0) {
      smaller.push(file);
    } else {
      same.push(file)
    }
  });

  let outputText = '';

  if (bigger.length) {
    outputText += `Files that got Bigger 🚨:\n\n${reportTable(bigger)}\n`
  }

  if (smaller.length) {
    outputText += `Files that got Smaller 🎉:\n\n${reportTable(smaller)}\n\n`
  }

  if (same.length) {
    outputText += `Files that stayed the same size 🤷‍:\n\n${reportTable(same)}\n\n`
  }

  return outputText;
}

function reportTable(data) {
  let table = `File | raw | gzip
--- | --- | ---
`
  data.forEach(function(item) {
    table += `${item.file}|${prettyBytes(item.raw, {signed: true})}|${prettyBytes(item.gzip, {signed: true})}\n`
  });

  return table;
}

export default run;

run();
