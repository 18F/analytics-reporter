#!/bin/bash

export ANALYTICS_SCRIPT_NAME=hourly.sh

# Government Wide
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Education
source $ANALYTICS_ROOT_PATH/deploy/envs/education.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# National Aeronautics and Space Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/national-aeronautics-space-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Justice
source $ANALYTICS_ROOT_PATH/deploy/envs/justice.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Veterans Affairs
source $ANALYTICS_ROOT_PATH/deploy/envs/veterans-affairs.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Commerce
source $ANALYTICS_ROOT_PATH/deploy/envs/commerce.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Environmental Protection Agency
source $ANALYTICS_ROOT_PATH/deploy/envs/environmental-protection-agency.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Small Business Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/small-business-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Energy
source $ANALYTICS_ROOT_PATH/deploy/envs/energy.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of the Interior
source $ANALYTICS_ROOT_PATH/deploy/envs/interior.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# National Archives and Records Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/national-archives-records-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Agriculture
source $ANALYTICS_ROOT_PATH/deploy/envs/agriculture.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Defense
source $ANALYTICS_ROOT_PATH/deploy/envs/defense.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Health and Human Services
source $ANALYTICS_ROOT_PATH/deploy/envs/health-human-services.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Housing and Urban Development
source $ANALYTICS_ROOT_PATH/deploy/envs/housing-urban-development.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Homeland Security
source $ANALYTICS_ROOT_PATH/deploy/envs/homeland-security.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Labor
source $ANALYTICS_ROOT_PATH/deploy/envs/labor.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of State
source $ANALYTICS_ROOT_PATH/deploy/envs/state.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of Transportation
source $ANALYTICS_ROOT_PATH/deploy/envs/transportation.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Department of the Treasury
source $ANALYTICS_ROOT_PATH/deploy/envs/treasury.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Agency for International Development
source $ANALYTICS_ROOT_PATH/deploy/envs/agency-international-development.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# General Services Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/general-services-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# National Science Foundation
source $ANALYTICS_ROOT_PATH/deploy/envs/national-science-foundation.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Nuclear Regulatory Commission
source $ANALYTICS_ROOT_PATH/deploy/envs/nuclear-regulatory-commission.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Office of Personnel Management
source $ANALYTICS_ROOT_PATH/deploy/envs/office-personnel-management.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Social Security Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/social-security-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Postal Service
source $ANALYTICS_ROOT_PATH/deploy/envs/postal-service.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug

# Executive Office of the President
source $ANALYTICS_ROOT_PATH/deploy/envs/executive-office-president.env
$ANALYTICS_ROOT_PATH/bin/analytics --publish --frequency=hourly --slim --debug
