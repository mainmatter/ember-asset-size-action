import { getInput, debug, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { GitHub, context } from '@actions/github';
import assetSizeReporter from 'asset-size-reporter';

import { normaliseFingerprint, diffSizes, buildOutputText } from './lib/helpers';

const repoInfo = context.repo;

let octokit;

async function run() {
  try {
    const myToken = getInput('repo-token', { required: true });
    octokit = new GitHub(myToken);
    const pullRequest = await getPullRequest();

    const prAssets = await getAssetSizes();

    await exec(`git checkout ${pullRequest.base.sha}`);

    const masterAssets = await getAssetSizes();

    console.log({prAssets, masterAssets});

    let fileDiffs = diffSizes(normaliseFingerprint(masterAssets), normaliseFingerprint(prAssets));

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

export default run;
