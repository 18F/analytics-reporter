#!/bin/bash

export ANALYTICS_SCRIPT_NAME=daily.sh

# Government Wide
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Education
source $ANALYTICS_ROOT_PATH/deploy/envs/education.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Veterans Affairs
source $ANALYTICS_ROOT_PATH/deploy/envs/veterans-affairs.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# National Aeronautics and Space Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/national-aeronautics-space-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Justice
source $ANALYTICS_ROOT_PATH/deploy/envs/justice.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Commerce
source $ANALYTICS_ROOT_PATH/deploy/envs/commerce.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Environmental Protection Agency
source $ANALYTICS_ROOT_PATH/deploy/envs/environmental-protection-agency.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Small Business Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/small-business-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Energy
source $ANALYTICS_ROOT_PATH/deploy/envs/energy.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of the Interior
source $ANALYTICS_ROOT_PATH/deploy/envs/interior.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# National Archives and Records Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/national-archives-records-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Agriculture
source $ANALYTICS_ROOT_PATH/deploy/envs/agriculture.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Defense
source $ANALYTICS_ROOT_PATH/deploy/envs/defense.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Health and Human Services
source $ANALYTICS_ROOT_PATH/deploy/envs/health-human-services.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Housing and Urban Development
source $ANALYTICS_ROOT_PATH/deploy/envs/housing-urban-development.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Homeland Security
source $ANALYTICS_ROOT_PATH/deploy/envs/homeland-security.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Labor
source $ANALYTICS_ROOT_PATH/deploy/envs/labor.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of State
source $ANALYTICS_ROOT_PATH/deploy/envs/state.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of Transportation
source $ANALYTICS_ROOT_PATH/deploy/envs/transportation.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Department of the Treasury
source $ANALYTICS_ROOT_PATH/deploy/envs/treasury.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Agency for International Development
source $ANALYTICS_ROOT_PATH/deploy/envs/agency-international-development.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# General Services Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/general-services-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# National Science Foundation
source $ANALYTICS_ROOT_PATH/deploy/envs/national-science-foundation.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Nuclear Regulatory Commission
source $ANALYTICS_ROOT_PATH/deploy/envs/nuclear-regulatory-commission.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Office of Personnel Management
source $ANALYTICS_ROOT_PATH/deploy/envs/office-personnel-management.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Social Security Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/social-security-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Postal Service
source $ANALYTICS_ROOT_PATH/deploy/envs/postal-service.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv

# Executive Office of the President
source $ANALYTICS_ROOT_PATH/deploy/envs/executive-office-president.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=daily --slim --debug --csv
