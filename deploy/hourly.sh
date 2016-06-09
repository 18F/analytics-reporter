#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

# just the one awkward 'today' report
source $HOME/envs/projects/dap-1.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# ED Reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/ed.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# NASA Reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/nasa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# DOJ Reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/doj.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# VA Reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/va.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Commerce Reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/commerce.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# EPA Reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/epa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# SBA Reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/sba.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Energy Reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/energy.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# DOI Reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/doi.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# NARA Reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/nara.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Agriculture
source $HOME/envs/projects/dap-1.env
source $HOME/envs/agriculture.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Defense
source $HOME/envs/projects/dap-1.env
source $HOME/envs/defense.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Health and Human Services
source $HOME/envs/projects/dap-2.env
source $HOME/envs/hhs.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Housing and Urban Development
source $HOME/envs/projects/dap-2.env
source $HOME/envs/hud.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Homeland Security
source $HOME/envs/projects/dap-2.env
source $HOME/envs/dhs.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Labor
source $HOME/envs/projects/dap-2.env
source $HOME/envs/labor.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of State
source $HOME/envs/projects/dap-2.env
source $HOME/envs/state.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Transportation
source $HOME/envs/projects/dap-2.env
source $HOME/envs/transportation.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of the Treasury
source $HOME/envs/projects/dap-2.env
source $HOME/envs/treasury.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Agency for International Development
source $HOME/envs/projects/dap-2.env
source $HOME/envs/usaid.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# General Services Administration
source $HOME/envs/projects/dap-2.env
source $HOME/envs/gsa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# National Science Foundation
source $HOME/envs/projects/dap-2.env
source $HOME/envs/nsf.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Nuclear Regulatory Commission
source $HOME/envs/projects/dap-2.env
source $HOME/envs/nrc.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Office of Personnel Management
source $HOME/envs/projects/dap-2.env
source $HOME/envs/opm.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Social Security Administration
source $HOME/envs/projects/dap-2.env
source $HOME/envs/ssa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# US Postal Service
source $HOME/envs/projects/dap-2.env
source $HOME/envs/postal-service.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose
