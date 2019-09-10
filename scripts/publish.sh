#!/bin/bash
set -eo pipefail

# NOTE: build and publish are always executed in a package (e.g core) working directory
$(pwd)/../scripts/build.sh

# set up .npmrc to authenticate with the provided token
echo "Set up .npmrc ..."
echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

# NOTE: auth is taken care of via AzDO `npm auth` task. ENV vars would work as well.
if [ -z "$1" ]; then
  echo "Publishing 'latest' to NPM...";
  npm publish --access public
else
  echo "Publishing 'prerelease' to NPM...";
  npm publish --tag=beta --access public
fi
