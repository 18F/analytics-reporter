#!/bin/bash

export ANALYTICS_SCRIPT_NAME=daily.sh

$ANALYTICS_ROOT_PATH/bin/analytics-publisher --publish --frequency=daily --slim --debug --csv --json --agenciesFile=$ANALYTICS_ROOT_PATH/deploy/agencies.json

