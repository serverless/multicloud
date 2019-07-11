#!/bin/bash
set -euo pipefail

# Get full branch name excluding refs/head from the env var SOURCE_BRANCH
SOURCE_BRANCH_NAME=${SOURCE_BRANCH/refs\/head\/}

# Configure git to commit as Azure Dev Ops
git config --local user.email "Azure Pipelines"
git config --local user.name "azuredevops@microsoft.com"
NPM_VERSION=`npm version prerelease`

# Stage update to package.json files
git add package.json
git add package-lock.json

# Since there isn't a package.json at the root of repo
# we need to manually commit and tag
git commit -m "Bumping NPM package $1 prerelease to version ${NPM_VERSION} ***NO_CI***"
git tag $1-${NPM_VERSION}
git push origin HEAD:${SOURCE_BRANCH_NAME} --tags
