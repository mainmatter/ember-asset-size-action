import { getInput, debug, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { GitHub, context } from '@actions/github';
import assetSizeReporter from 'asset-size-reporter';


const myToken = getInput('myToken');

const octokit = new GitHub(myToken);

const repoInfo = context.repo;

async function run() {
  console.log(repoInfo);

  try {
    await exec('npm i');
    await exec('npx ember build -prod');

    let assets;

    await assetSizeReporter({
      patterns: ['dist/assets/**.js', 'dist/assets/**.css'],
      json: true,
      console: {
        log(text) {
          assets = JSON.parse(text);
        }
      },
      cwd: process.cwd(),
    })

    console.log(assets);

    const myInput = getInput('myInput');
    debug(`Hello ${myInput}`);
  } catch (error) {
    setFailed(error.message);
  }
}

export default run;

run();
