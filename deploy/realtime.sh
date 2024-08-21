#!/bin/bash

export ANALYTICS_SCRIPT_NAME=realtime.sh

$ANALYTICS_ROOT_PATH/bin/analytics-publisher --publish --frequency=realtime --slim --debug --csv --json --agenciesFile=$ANALYTICS_ROOT_PATH/deploy/agencies.json
