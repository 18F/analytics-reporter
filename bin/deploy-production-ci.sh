#!/bin/bash

set -e

# Log into cloud.gov
cf api api.fr.cloud.gov
cf login -u $CF_USERNAME -p $CF_PASSWORD -o gsa-opp-analytics -s analytics-dev
# cf login -u $CF_PRODUCTION_SPACE_DEPLOYER_USERNAME -p $CF_PRODUCTION_SPACE_DEPLOYER_PASSWORD -o gsa-opp-analytics -s analytics-dev

# Push the app
cf v3-zdt-push analytics-reporter
echo "Push to Production Complete."

cf logout
