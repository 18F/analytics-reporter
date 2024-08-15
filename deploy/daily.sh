#!/bin/bash

export ANALYTICS_SCRIPT_NAME=daily.sh

$ANALYTICS_ROOT_PATH/bin/analytics-publisher --publish --frequency=daily --slim --debug --agenciesFile=$ANALYTICS_ROOT_PATH/deploy/agencies.json
$ANALYTICS_ROOT_PATH/bin/analytics-publisher --publish --frequency=daily --slim --debug --csv --agenciesFile=$ANALYTICS_ROOT_PATH/deploy/agencies.json

