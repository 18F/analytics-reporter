#!/bin/bash

export ANALYTICS_REPORTS_PATH=reports/api.json

# Gov Wide
$HOME/bin/analytics --verbose --write-to-database --output /tmp

# Department of Education
source $HOME/deploy/envs/education.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/education

# Department of Veterans Affairs
source $HOME/deploy/envs/veterans-affairs.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/veterans-affairs

# National Aeronautics and Space Administration
source $HOME/deploy/envs/national-aeronautics-space-administration.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/national-aeronautics-space-administration

# Department of Justice
source $HOME/deploy/envs/justice.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/justice

# Department of Commerce
source $HOME/deploy/envs/commerce.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/commerce

# Environmental Protection Agency
source $HOME/deploy/envs/environmental-protection-agency.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/environmental-protection-agency

# Small Business Administration
source $HOME/deploy/envs/small-business-administration.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/small-business-administration

# Department of Energy
source $HOME/deploy/envs/energy.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/energy

# Department of the Interior
source $HOME/deploy/envs/interior.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/interior

# National Archives and Records Administration
source $HOME/deploy/envs/national-archives-records-administration.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/national-archives-records-administration

# Department of Agriculture
source $HOME/deploy/envs/agriculture.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/agriculture

# Department of Defense
source $HOME/deploy/envs/defense.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/defense

# Department of Health and Human Services
source $HOME/deploy/envs/health-human-services.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/health-human-services

# Department of Housing and Urban Development
source $HOME/deploy/envs/housing-urban-development.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/housing-urban-development

# Department of Homeland Security
source $HOME/deploy/envs/homeland-security.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/homeland-security

# Department of Labor
source $HOME/deploy/envs/labor.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/labor

# Department of State
source $HOME/deploy/envs/state.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/state

# Department of Transportation
source $HOME/deploy/envs/transportation.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/transportation

# Department of the Treasury
source $HOME/deploy/envs/treasury.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/treasury

# Agency for International Development
source $HOME/deploy/envs/agency-international-development.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/agency-international-development

# General Services Administration
source $HOME/deploy/envs/general-services-administration.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/general-services-administration

# National Science Foundation
source $HOME/deploy/envs/national-science-foundation.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/national-science-foundation

# Nuclear Regulatory Commission
source $HOME/deploy/envs/nuclear-regulatory-commission.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/nuclear-regulatory-commission

# Office of Personnel Management
source $HOME/deploy/envs/office-personnel-management.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/office-personnel-management

# Social Security Administration
source $HOME/deploy/envs/social-security-administration.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/social-security-administration

# Postal Service
source $HOME/deploy/envs/postal-service.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/postal-service

# Executive Office of the President
source $HOME/deploy/envs/executive-office-president.env
$HOME/bin/analytics --verbose --write-to-database --output /tmp/executive-office-president
