#!/bin/bash

export ANALYTICS_REPORTS_PATH=reports/api.json
export ANALYTICS_SCRIPT_NAME=api.sh

# Gov Wide
$ANALYTICS_ROOT_PATH/bin/analytics --debug --write-to-database --output /tmp

# Iterate over each agency config in deploy/envs
for filename in $ANALYTICS_ROOT_PATH/deploy/envs/*.config.sh; do
  source $filename
  $ANALYTICS_ROOT_PATH/bin/analytics --debug --write-to-database --output /tmp
done
