#!/bin/bash
set -euo pipefail

SOURCE_BRANCH_NAME=${$2/refs\/head\/}
echo ${SOURCE_BRANCH_NAME}
git config --local user.email "Azure Pipelines"
git config --local user.name "azuredevops@microsoft.com"
NPM_VERSION=`npm version prerelease`

git add package.json
git add package-lock.json

# Since there isn't a package.json at the root of repo
# we need to manually commit and tag
git commit -m "Bumping NPM package $1 prerelease to version ${NPM_VERSION} ***NO_CI***"
git tag $1-${NPM_VERSION}
git push origin HEAD:${SOURCE_BRANCH_NAME} --tags
