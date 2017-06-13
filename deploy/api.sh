#!/bin/bash

export ANALYTICS_REPORTS_PATH=reports/api.json

# Gov Wide
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Education
source $ANALYTICS_ROOT_PATH/deploy/envs/education.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Veterans Affairs
source $ANALYTICS_ROOT_PATH/deploy/envs/veterans-affairs.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# National Aeronautics and Space Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/national-aeronautics-space-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Justice
source $ANALYTICS_ROOT_PATH/deploy/envs/justice.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Commerce
source $ANALYTICS_ROOT_PATH/deploy/envs/commerce.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Environmental Protection Agency
source $ANALYTICS_ROOT_PATH/deploy/envs/environmental-protection-agency.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Small Business Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/small-business-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Energy
source $ANALYTICS_ROOT_PATH/deploy/envs/energy.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of the Interior
source $ANALYTICS_ROOT_PATH/deploy/envs/interior.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# National Archives and Records Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/national-archives-records-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Agriculture
source $ANALYTICS_ROOT_PATH/deploy/envs/agriculture.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Defense
source $ANALYTICS_ROOT_PATH/deploy/envs/defense.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Health and Human Services
source $ANALYTICS_ROOT_PATH/deploy/envs/health-human-services.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Housing and Urban Development
source $ANALYTICS_ROOT_PATH/deploy/envs/housing-urban-development.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Homeland Security
source $ANALYTICS_ROOT_PATH/deploy/envs/homeland-security.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Labor
source $ANALYTICS_ROOT_PATH/deploy/envs/labor.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of State
source $ANALYTICS_ROOT_PATH/deploy/envs/state.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of Transportation
source $ANALYTICS_ROOT_PATH/deploy/envs/transportation.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Department of the Treasury
source $ANALYTICS_ROOT_PATH/deploy/envs/treasury.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Agency for International Development
source $ANALYTICS_ROOT_PATH/deploy/envs/agency-international-development.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# General Services Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/general-services-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# National Science Foundation
source $ANALYTICS_ROOT_PATH/deploy/envs/national-science-foundation.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Nuclear Regulatory Commission
source $ANALYTICS_ROOT_PATH/deploy/envs/nuclear-regulatory-commission.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Office of Personnel Management
source $ANALYTICS_ROOT_PATH/deploy/envs/office-personnel-management.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Social Security Administration
source $ANALYTICS_ROOT_PATH/deploy/envs/social-security-administration.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Postal Service
source $ANALYTICS_ROOT_PATH/deploy/envs/postal-service.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp

# Executive Office of the President
source $ANALYTICS_ROOT_PATH/deploy/envs/executive-office-president.env
$ANALYTICS_ROOT_PATH/bin/analytics --verbose --write-to-database --output /tmp
