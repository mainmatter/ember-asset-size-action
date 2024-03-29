import { getInput, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { getOctokit, context } from '@actions/github';
import path from 'path';

import {
  normaliseFingerprint,
  diffSizes,
  buildOutputText,
  getPullRequest,
  getAssetSizes,
} from './lib/helpers.mjs';

let octokit;

async function run() {
  try {
    const myToken = getInput('repo-token', { required: true });
    octokit = getOctokit(myToken);
    const pullRequest = await getPullRequest(context, octokit);

    const showTotalSizeDiff = getInput('show-total-size-diff', { required: false }) === 'yes';

    const workingDirectory = getInput('working-directory', { required: false });
    const cwd = path.join(process.cwd(), workingDirectory);

    const buildCommand = getInput('build-npm-command', { required: false });

    const prAssets = await getAssetSizes({ cwd, buildCommand });

    await exec(`git checkout ${pullRequest.base.sha}`);

    const masterAssets = await getAssetSizes({ cwd, buildCommand });

    const fileDiffs = diffSizes(normaliseFingerprint(masterAssets), normaliseFingerprint(prAssets));

    const uniqueCommentIdentifier = '_Created by [ember-asset-size-action](https://github.com/mainmatter/ember-asset-size-action/)_';
    const legacyUniqueCommentIdentifier = '_Created by [ember-asset-size-action](https://github.com/simplabs/ember-asset-size-action/)_';

    const body = `${buildOutputText(fileDiffs, showTotalSizeDiff)}\n\n${uniqueCommentIdentifier}`;

    const updateExistingComment = getInput('update-comments', { required: false });
    let existingComment = false;

    if (updateExistingComment === 'yes') {
      const { data: comments } = await octokit.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pullRequest.number,
      });
      existingComment = comments.find((comment) => comment.user.login === 'github-actions[bot]' && (comment.body.endsWith(uniqueCommentIdentifier) || comment.body.endsWith(legacyUniqueCommentIdentifier)));
    }

    try {
      if (existingComment) {
        await octokit.rest.issues.updateComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          comment_id: existingComment.id,
          body,
        });
      } else {
        await octokit.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: pullRequest.number,
          body,
        });
      }
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

export default run;

// auto-execute the run function
run();
