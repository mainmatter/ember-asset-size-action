import { getInput, debug, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { GitHub, context } from '@actions/github';
import assetSizeReporter from 'asset-size-reporter';

const repoInfo = context.repo;

async function run() {
  try {
    const pullRequest = await getPullRequest();

    const prAssets = await getAssetSizes();

    console.log(prAssets);

    await exec(`git checkout ${pullRequest.base.sha}`);

    const masterAssets = await getAssetSizes();

    console.log(masterAssets);

    setFailed("just testing");
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

  const myToken = getInput('repo-token', { required: true });
  const octokit = new GitHub(myToken);

  const { data: pullRequest } = await octokit.pulls.get({
    owner: pr.base.repo.owner.login,
    repo: pr.base.repo.name,
    pull_number: pr.number
  })

  return pullRequest;
}

export default run;

run();
