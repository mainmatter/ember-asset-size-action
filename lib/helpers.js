import prettyBytes from 'pretty-bytes';

export function normaliseFingerprint(obj) {
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

export function diffSizes(baseBranch, pullRequestBranch) {
  let diffObject = {}

  Object.keys(pullRequestBranch).forEach((key) => {
    let newSize = pullRequestBranch[key];
    let originSize = baseBranch[key];

    // new file i.e. does not exist in origin
    if (!originSize) {
      diffObject[key] = {
        raw: newSize.raw,
        gzip: newSize.gzip,
      };
    } else {
      diffObject[key] = {
        raw: originSize.raw - newSize.raw,
        gzip: originSize.gzip - newSize.gzip,
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

  return outputText.trim();
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
