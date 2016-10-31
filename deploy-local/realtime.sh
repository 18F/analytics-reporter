#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

source $HOME/Documents/projects/analytics-reporter/dap-1.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
# we want just one realtime report in CSV, hardcoded for now to save on API requests
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# ED reports
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/ed.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# VA reports
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/va.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# NASA reports
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/nasa.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# DOJ reports
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/doj.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Commerce reports
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/commerce.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv


# EPA reports
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/epa.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# sba reports
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/sba.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Energy reports
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/energy.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# DOI reports
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/doi.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# NARA reports
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/nara.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Agriculture
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/agriculture.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Defense
source $HOME/Documents/projects/analytics-reporter/dap-1.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/defense.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Health and Human Services
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/hhs.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Housing and Urban Development
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/hud.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Homeland Security
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/dhs.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Labor
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/labor.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of State
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/state.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Transportation
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/transportation.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of the Treasury
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/treasury.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Agency for International Development
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/usaid.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# General Services Administration
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/gsa.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# National Science Foundation
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/nsf.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Nuclear Regulatory Commission
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/nrc.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Office of Personnel Management
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/opm.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Social Security Administration
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/ssa.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv


# US Postal Service
source $HOME/Documents/projects/analytics-reporter/dap-2.env
source $HOME/Documents/projects/analytics-reporter/deploy-local/envs/postal-service.env
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/Documents/projects/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

