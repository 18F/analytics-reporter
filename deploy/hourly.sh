#!/bin/bash

export ANALYTICS_SCRIPT_NAME=hourly.sh

$ANALYTICS_ROOT_PATH/bin/analytics-publisher --publish --frequency=hourly --slim --debug --json --agenciesFile=$ANALYTICS_ROOT_PATH/deploy/agencies.json
