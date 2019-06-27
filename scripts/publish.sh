#!/bin/bash
set -euo pipefail

./build.sh
# NOTE: auth is taken care of via AzDO `npm auth` task. ENV vars would work as well.
npm publish
