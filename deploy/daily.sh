#!/bin/bash

export ANALYTICS_SCRIPT_NAME=daily.sh

# Government Wide
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Iterate over each agency config in deploy/envs
for filename in $ANALYTICS_ROOT_PATH/deploy/envs/*.config.sh; do
  source $filename
  $ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
  $ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv
done
