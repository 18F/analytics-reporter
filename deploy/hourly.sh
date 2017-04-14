#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

# just the one awkward 'today' report
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Education
source $HOME/deploy/envs/education.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# National Aeronautics and Space Administration
source $HOME/deploy/envs/national-aeronautics-space-administration.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Justice
source $HOME/deploy/envs/justice.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Veterans Affairs
source $HOME/deploy/envs/veterans-affairs.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Commerce
source $HOME/deploy/envs/commerce.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Environmental Protection Agency
source $HOME/deploy/envs/environmental-protection-agency.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Small Business Administration
source $HOME/deploy/envs/small-business-administration.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Energy
source $HOME/deploy/envs/energy.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of the Interior
source $HOME/deploy/envs/interior.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# National Archives and Records Administration
source $HOME/deploy/envs/national-archives-records-administration.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Agriculture
source $HOME/deploy/envs/agriculture.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Defense
source $HOME/deploy/envs/defense.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Health and Human Services
source $HOME/deploy/envs/health-human-services.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Housing and Urban Development
source $HOME/deploy/envs/housing-urban-development.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Homeland Security
source $HOME/deploy/envs/homeland-security.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Labor
source $HOME/deploy/envs/labor.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of State
source $HOME/deploy/envs/state.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Transportation
source $HOME/deploy/envs/transportation.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of the Treasury
source $HOME/deploy/envs/treasury.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Agency for International Development
source $HOME/deploy/envs/agency-international-development.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# General Services Administration
source $HOME/deploy/envs/general-services-administration.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# National Science Foundation
source $HOME/deploy/envs/national-science-foundation.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Nuclear Regulatory Commission
source $HOME/deploy/envs/nuclear-regulatory-commission.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Office of Personnel Management
source $HOME/deploy/envs/office-personnel-management.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Social Security Administration
source $HOME/deploy/envs/social-security-administration.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Postal Service
source $HOME/deploy/envs/postal-service.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Executive Office of the President
source $HOME/deploy/envs/executive-office-president.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose
