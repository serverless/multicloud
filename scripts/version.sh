#!/bin/bash
set -euo pipefail

PACKAGE_NAME=$1
NPM_RELEASE_TYPE=${2-"prerelease"}

# Get full branch name excluding refs/head from the env var SOURCE_BRANCH
SOURCE_BRANCH_NAME=${SOURCE_BRANCH/refs\/head\/}

printenv | sort

git branch
git remote -v

echo Checking out ${SOURCE_BRANCH_NAME}

# Configure git to commit as Azure Dev Ops
git config --local user.email "Azure Pipelines"
git config --local user.name "azuredevops@microsoft.com"
git checkout origin ${SOURCE_BRANCH_NAME}
git pull

NPM_VERSION=`npm version ${NPM_RELEASE_TYPE}`

echo Setting NPM version to ${NPM_VERSION}

# Stage update to package.json files
git add package.json
git add package-lock.json

# Since there isn't a package.json at the root of repo
# and we have multiple packages within same repo
# we need to manually commit and tag in order to create unique tag names
git commit -m "Bumping NPM package ${PACKAGE_NAME} prerelease to version ${NPM_VERSION} ***NO_CI***"
git tag ${PACKAGE_NAME}-${NPM_VERSION}
git push origin ${SOURCE_BRANCH_NAME} --tags
