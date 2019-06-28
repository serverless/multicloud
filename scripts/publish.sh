#!/bin/bash
set -eo pipefail

./build.sh

## configure npm to sign commit
npm config set sign-git-tag true

# NOTE: auth is taken care of via AzDO `npm auth` task. ENV vars would work as well.
if [ -z "$1" ]; then
  echo "Publishing 'latest' to NPM...";
  npm publish
else
  echo "Publishing 'prerelease' to NPM...";
  npm publish --tag=beta
fi
