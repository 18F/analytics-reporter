#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

source $HOME/dap-1.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
# we want just one realtime report in CSV, hardcoded for now to save on API requests
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# ED reports
source $HOME/dap-1.env
source $HOME/deploy/envs/ed.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# VA reports
source $HOME/dap-1.env
source $HOME/deploy/envs/va.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# NASA reports
source $HOME/dap-1.env
source $HOME/deploy/envs/nasa.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# DOJ reports
source $HOME/dap-1.env
source $HOME/deploy/envs/doj.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Commerce reports
source $HOME/dap-1.env
source $HOME/deploy/envs/commerce.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv


# EPA reports
source $HOME/dap-1.env
source $HOME/deploy/envs/epa.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# sba reports
source $HOME/dap-1.env
source $HOME/deploy/envs/sba.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Energy reports
source $HOME/dap-1.env
source $HOME/deploy/envs/energy.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# DOI reports
source $HOME/dap-1.env
source $HOME/deploy/envs/doi.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# NARA reports
source $HOME/dap-1.env
source $HOME/deploy/envs/nara.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Agriculture
source $HOME/dap-1.env
source $HOME/deploy/envs/agriculture.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Defense
source $HOME/dap-1.env
source $HOME/deploy/envs/defense.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Health and Human Services
source $HOME/dap-2.env
source $HOME/deploy/envs/hhs.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Housing and Urban Development
source $HOME/dap-2.env
source $HOME/deploy/envs/hud.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Homeland Security
source $HOME/dap-2.env
source $HOME/deploy/envs/dhs.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Labor
source $HOME/dap-2.env
source $HOME/deploy/envs/labor.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of State
source $HOME/dap-2.env
source $HOME/deploy/envs/state.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Transportation
source $HOME/dap-2.env
source $HOME/deploy/envs/transportation.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of the Treasury
source $HOME/dap-2.env
source $HOME/deploy/envs/treasury.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Agency for International Development
source $HOME/dap-2.env
source $HOME/deploy/envs/usaid.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# General Services Administration
source $HOME/dap-2.env
source $HOME/deploy/envs/gsa.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# National Science Foundation
source $HOME/dap-2.env
source $HOME/deploy/envs/nsf.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Nuclear Regulatory Commission
source $HOME/dap-2.env
source $HOME/deploy/envs/nrc.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Office of Personnel Management
source $HOME/dap-2.env
source $HOME/deploy/envs/opm.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Social Security Administration
source $HOME/dap-2.env
source $HOME/deploy/envs/ssa.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# US Postal Service
source $HOME/dap-2.env
source $HOME/deploy/envs/postal-service.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Executive Office of the President
source $HOME/dap-2.env
source $HOME/deploy/envs/eop.env
$HOME/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv
