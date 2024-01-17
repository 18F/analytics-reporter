#!/bin/bash

export ANALYTICS_UA_REPORTS_PATH=ua/reports/api.json

# Gov Wide
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Education
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/education.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Veterans Affairs
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/veterans-affairs.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# National Aeronautics and Space Administration
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/national-aeronautics-space-administration.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Justice
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/justice.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Commerce
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/commerce.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Environmental Protection Agency
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/environmental-protection-agency.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Small Business Administration
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/small-business-administration.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Energy
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/energy.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of the Interior
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/interior.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# National Archives and Records Administration
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/national-archives-records-administration.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Agriculture
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/agriculture.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Defense
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/defense.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Health and Human Services
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/health-human-services.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Housing and Urban Development
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/housing-urban-development.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Homeland Security
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/homeland-security.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Labor
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/labor.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of State
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/state.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of Transportation
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/transportation.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Department of the Treasury
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/treasury.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Agency for International Development
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/agency-international-development.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# General Services Administration
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/general-services-administration.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# National Science Foundation
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/national-science-foundation.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Nuclear Regulatory Commission
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/nuclear-regulatory-commission.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Office of Personnel Management
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/office-personnel-management.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Social Security Administration
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/social-security-administration.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Postal Service
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/postal-service.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp

# Executive Office of the President
source $ANALYTICS_UA_ROOT_PATH/deploy/envs/executive-office-president.env
$ANALYTICS_UA_ROOT_PATH/bin/analytics --debug --write-to-database --output $ANALYTICS_UA_ROOT_PATH/tmp
