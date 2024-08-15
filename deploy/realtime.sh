#!/bin/bash

export ANALYTICS_SCRIPT_NAME=realtime.sh

$ANALYTICS_ROOT_PATH/bin/analytics-publisher --publish --frequency=realtime --slim --debug --agenciesFile=$ANALYTICS_ROOT_PATH/deploy/agencies.json
$ANALYTICS_ROOT_PATH/bin/analytics-publisher --publish --frequency=realtime --slim --debug --csv --agenciesFile=$ANALYTICS_ROOT_PATH/deploy/agencies.json
