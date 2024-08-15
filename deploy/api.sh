#!/bin/bash

export ANALYTICS_REPORTS_PATH=reports/api.json
export ANALYTICS_SCRIPT_NAME=api.sh

$ANALYTICS_ROOT_PATH/bin/analytics-publisher --debug --write-to-database --output /tmp --agenciesFile=$ANALYTICS_ROOT_PATH/deploy/agencies.json
