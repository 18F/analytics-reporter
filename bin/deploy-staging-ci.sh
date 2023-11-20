#!/bin/bash

set -e

# Log into cloud.gov
cf api api.fr.cloud.gov
cf login -u $CF_STAGING_SPACE_DEPLOYER_USERNAME -p $CF_STAGING_SPACE_DEPLOYER_PASSWORD -o gsa-opp-analytics -s analytics-dev

# Push the app
cf v3-zdt-push analytics-reporter-staging
echo "Push to Staging Complete."

cf logout
