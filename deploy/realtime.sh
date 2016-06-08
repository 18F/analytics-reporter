#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

source $HOME/envs/projects/dap-1.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
# we want just one realtime report in CSV, hardcoded for now to save on API requests
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# ED reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/ed.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# VA reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/va.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# NASA reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/nasa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# DOJ reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/doj.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Commerce reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/commerce.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv


# EPA reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/epa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# sba reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/sba.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Energy reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/energy.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# DOI reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/doi.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# NARA reports
source $HOME/envs/projects/dap-1.env
source $HOME/envs/nara.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Agriculture
source $HOME/envs/projects/dap-1.env
source $HOME/envs/agriculture.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Defense
source $HOME/envs/projects/dap-1.env
source $HOME/envs/defense.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Health and Human Services
source $HOME/envs/projects/dap-2.env
source $HOME/envs/hhs.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Housing and Urban Development
source $HOME/envs/projects/dap-2.env
source $HOME/envs/hud.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Homeland Security
source $HOME/envs/projects/dap-2.env
source $HOME/envs/dhs.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Labor
source $HOME/envs/projects/dap-2.env
source $HOME/envs/labor.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of State
source $HOME/envs/projects/dap-2.env
source $HOME/envs/state.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Transportation
source $HOME/envs/projects/dap-2.env
source $HOME/envs/transportation.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of the Treasury
source $HOME/envs/projects/dap-2.env
source $HOME/envs/treasury.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Agency for International Development
source $HOME/envs/projects/dap-2.env
source $HOME/envs/usaid.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# General Services Administration
source $HOME/envs/projects/dap-2.env
source $HOME/envs/gsa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# National Science Foundation
source $HOME/envs/projects/dap-2.env
source $HOME/envs/nsf.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Nuclear Regulatory Commission
source $HOME/envs/projects/dap-2.env
source $HOME/envs/nrc.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Office of Personnel Management
source $HOME/envs/projects/dap-2.env
source $HOME/envs/opm.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Social Security Administration
source $HOME/envs/projects/dap-2.env
source $HOME/envs/ssa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

