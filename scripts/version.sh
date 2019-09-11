#!/bin/bash
set -euo pipefail

PACKAGE_NAME=$1
NPM_RELEASE_TYPE=${2-"prerelease"}

# Get full branch name excluding refs/head from the env var SOURCE_BRANCH
SOURCE_BRANCH_NAME=${SOURCE_BRANCH/refs\/heads\/}

export GIT_SSH_COMMAND="ssh -vv -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"

# Configure git to commit as Azure Dev Ops
git config --local --add url."git@github.com:".insteadOf "https://github.com/"
git config --local user.email "Multicloud Admin"
git config --local user.name "multicloud@serverless.com"

git pull origin ${SOURCE_BRANCH_NAME}
git checkout ${SOURCE_BRANCH_NAME}
echo Checked out branch: ${SOURCE_BRANCH_NAME}

NPM_VERSION=`npm version ${NPM_RELEASE_TYPE}`
echo Set NPM version to: ${NPM_VERSION}

# Stage update to package.json files
git add package.json
git add package-lock.json

# Since there isn't a package.json at the root of repo
# and we have multiple packages within same repo
# we need to manually commit and tag in order to create unique tag names
git commit -m "release: Bumping NPM package ${PACKAGE_NAME} ${NPM_RELEASE_TYPE} to version ${NPM_VERSION} ***NO_CI***"
SHA=`git rev-parse HEAD`

git tag ${PACKAGE_NAME}-${NPM_VERSION}

git remote add authOrigin git@github.com:serverless/multicloud.git
git push authOrigin ${SOURCE_BRANCH_NAME} --tags

echo Pushed new tag: ${PACKAGE_NAME}-${NPM_VERSION} @ SHA: ${SHA:0:8}
