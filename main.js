import { getInput, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { getOctokit, context } from '@actions/github';

import {
  normaliseFingerprint,
  diffSizes,
  buildOutputText,
  getPullRequest,
  getAssetSizes,
} from './lib/helpers';

let octokit;

async function run() {
  try {
    const myToken = getInput('repo-token', { required: true });
    octokit = getOctokit(myToken);
    const pullRequest = await getPullRequest(context, octokit);

    const prAssets = await getAssetSizes();

    await exec(`git checkout ${pullRequest.base.sha}`);

    const masterAssets = await getAssetSizes();

    const fileDiffs = diffSizes(normaliseFingerprint(masterAssets), normaliseFingerprint(prAssets));

    const uniqueCommentIdentifier = '_Created by ember-asset-size-action_';
    const body = `${buildOutputText(fileDiffs)}\n\n${uniqueCommentIdentifier}`;

    const updateExistingComment = getInput('update-comments', { required: false });
    let existingComment = false;

    if (updateExistingComment) {
      const { data: comments } = await octokit.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pullRequest.number,
      });
      existingComment = comments.find(comment => comment.user.login === 'github-actions[bot]' && comment.body.endsWith(uniqueCommentIdentifier));
    }

    try {
      if (existingComment) {
        await octokit.issues.updateComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          comment_id: existingComment.id,
          body,
        });
      } else {
        await octokit.issues.createComment({
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
