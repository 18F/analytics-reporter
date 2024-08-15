#!/bin/bash

export ANALYTICS_SCRIPT_NAME=hourly.sh

$ANALYTICS_ROOT_PATH/bin/analytics-publisher --publish --frequency=hourly --slim --debug --agenciesFile=$ANALYTICS_ROOT_PATH/deploy/agencies.json
