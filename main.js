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

    let fileDiffs = diffSizes(normaliseFingerprint(masterAssets), normaliseFingerprint(prAssets));

    let body = buildOutputText(fileDiffs);

    try {
      await octokit.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pullRequest.number,
        body,
      });
    } catch (e) {
      console.log(`Could not create a comment automatically. This could be because github does not allow writing from actions on a fork.

See https://github.community/t5/GitHub-Actions/Actions-not-working-correctly-for-forks/td-p/35545 for more information.`);

      console.log(`Copy and paste the following into a comment yourself if you want to still show the diff:

${body}`);
    }
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
