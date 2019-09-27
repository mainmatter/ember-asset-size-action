import { getInput, debug, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { GitHub, context } from '@actions/github';
import assetSizeReporter from 'asset-size-reporter';

const repoInfo = context.repo;

const myToken = getInput('repo-token', { required: true });
const octokit = new GitHub(myToken);

async function run() {
  try {
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
    let [, fileName, extension] = key.match(/dist\/assets\/([\w-]+)-\w{32}(.\w+)/);

    normalisedObject[`${fileName}${extension}`] = obj[key];
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

function buildOutputText(output) {
  let files = Object.keys(output);

  let bigger = '';
  let smaller = '';
  let same = '';

  files.forEach((file) => {
    let changeLine = `${file}\traw: ${output[file].raw}\tgzip: ${output[file].gzip}\n`;

    if(output[file].raw > 0) {
      bigger += changeLine;
    } else if (output[file].raw < 0) {
      smaller += changeLine;
    } else {
      same += changeLine;
    }
  });

  let outputText = '';

  if (bigger) {
    outputText += `Files that got Bigger 🚨:\n${bigger}\n`
  }

  if (smaller) {
    outputText += `Files that got Smaller 🎉:\n${smaller}\n`
  }

  if (same) {
    outputText += `Files that stayed the same size 🤷‍:\n${same}\n`
  }

  return outputText;
}

export default run;

run();
