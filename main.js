import { getInput, debug, setFailed } from '@actions/core';

async function run() {
  try {
    const myInput = getInput('myInput');
    debug(`Hello ${myInput}`);
  } catch (error) {
    setFailed(error.message);
  }
}

export default run;

run();
