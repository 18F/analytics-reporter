#!/bin/bash

export ANALYTICS_SCRIPT_NAME=hourly.sh

# Government Wide
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Iterate over each agency config in deploy/envs
for filename in $ANALYTICS_ROOT_PATH/deploy/envs/*.config.sh; do
  source $filename
  $ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug
done
