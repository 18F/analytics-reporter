#!/bin/bash

# JSON and CSV versions
source $HOME/dap-1.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# ED Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/ed.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# VA Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/va.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# NASA Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/nasa.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# DOJ Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/doj.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Commerce Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/commerce.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# EPA Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/epa.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# SBA Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/sba.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Energy Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/energy.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# DOI Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/doi.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# NARA Reports
source $HOME/dap-1.env
source $HOME/deploy/envs/nara.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Department of Agriculture
source $HOME/dap-1.env
source $HOME/deploy/envs/agriculture.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Department of Defense
source $HOME/dap-1.env
source $HOME/deploy/envs/defense.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Department of Health and Human Services
source $HOME/dap-2.env
source $HOME/deploy/envs/hhs.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Department of Housing and Urban Development
source $HOME/dap-2.env
source $HOME/deploy/envs/hud.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Department of Homeland Security
source $HOME/dap-2.env
source $HOME/deploy/envs/dhs.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Department of Labor
source $HOME/dap-2.env
source $HOME/deploy/envs/labor.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Department of State
source $HOME/dap-2.env
source $HOME/deploy/envs/state.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Department of Transportation
source $HOME/dap-2.env
source $HOME/deploy/envs/transportation.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Department of the Treasury
source $HOME/dap-2.env
source $HOME/deploy/envs/treasury.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Agency for International Development
source $HOME/dap-2.env
source $HOME/deploy/envs/usaid.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# General Services Administration
source $HOME/dap-2.env
source $HOME/deploy/envs/gsa.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# National Science Foundation
source $HOME/dap-2.env
source $HOME/deploy/envs/nsf.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Nuclear Regulatory Commission
source $HOME/dap-2.env
source $HOME/deploy/envs/nrc.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Office of Personnel Management
source $HOME/dap-2.env
source $HOME/deploy/envs/opm.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Social Security Administration
source $HOME/dap-2.env
source $HOME/deploy/envs/ssa.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# US Postal Service
source $HOME/dap-2.env
source $HOME/deploy/envs/postal-service.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Executive Office of the President
source $HOME/dap-2.env
source $HOME/deploy/envs/eop.env
$HOME/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/bin/analytics --publish --frequency=daily --slim --verbose --csv
