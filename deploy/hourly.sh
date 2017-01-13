#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

# just the one awkward 'today' report
source $HOME/dap-1.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# ED Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/ed.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# NASA Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/nasa.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# DOJ Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/doj.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# VA Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/va.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Commerce Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/commerce.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# EPA Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/epa.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# SBA Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/sba.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Energy Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/energy.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# DOI Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/doi.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# NARA Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/nara.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Agriculture
source $HOME/dap-1.env
source $HOME/deploy/envs/agriculture.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Defense
source $HOME/dap-1.env
source $HOME/deploy/envs/defense.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Health and Human Services
source $HOME/dap-2.env
source $HOME/deploy/envs/hhs.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Housing and Urban Development
source $HOME/dap-2.env
source $HOME/deploy/envs/hud.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Homeland Security
source $HOME/dap-2.env
source $HOME/deploy/envs/dhs.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Labor
source $HOME/dap-2.env
source $HOME/deploy/envs/labor.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of State
source $HOME/dap-2.env
source $HOME/deploy/envs/state.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of Transportation
source $HOME/dap-2.env
source $HOME/deploy/envs/transportation.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Department of the Treasury
source $HOME/dap-2.env
source $HOME/deploy/envs/treasury.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Agency for International Development
source $HOME/dap-2.env
source $HOME/deploy/envs/usaid.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# General Services Administration
source $HOME/dap-2.env
source $HOME/deploy/envs/gsa.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# National Science Foundation
source $HOME/dap-2.env
source $HOME/deploy/envs/nsf.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Nuclear Regulatory Commission
source $HOME/dap-2.env
source $HOME/deploy/envs/nrc.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Office of Personnel Management
source $HOME/dap-2.env
source $HOME/deploy/envs/opm.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Social Security Administration
source $HOME/dap-2.env
source $HOME/deploy/envs/ssa.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# US Postal Service
source $HOME/dap-2.env
source $HOME/deploy/envs/postal-service.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose

# Executive Office of the President
source $HOME/dap-2.env
source $HOME/deploy/envs/eop.env
$HOME/bin/analytics --publish --frequency=hourly --slim --verbose
