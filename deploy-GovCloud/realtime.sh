#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

source $HOME/app/dap-1.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
# we want just one realtime report in CSV, hardcoded for now to save on API requests
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# ED reports
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/ed.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# VA reports
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/va.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# NASA reports
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/nasa.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# DOJ reports
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/doj.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Commerce reports
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/commerce.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv


# EPA reports
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/epa.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# sba reports
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/sba.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Energy reports
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/energy.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# DOI reports
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/doi.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# NARA reports
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/nara.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Agriculture
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/agriculture.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Defense
source $HOME/app/dap-1.env
source $HOME/app/deploy-GovCloud/envs/defense.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Health and Human Services
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/hhs.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Housing and Urban Development
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/hud.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Homeland Security
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/dhs.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Labor
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/labor.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of State
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/state.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of Transportation
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/transportation.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Department of the Treasury
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/treasury.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Agency for International Development
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/usaid.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# General Services Administration
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/gsa.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# National Science Foundation
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/nsf.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Nuclear Regulatory Commission
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/nrc.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Office of Personnel Management
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/opm.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Social Security Administration
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/ssa.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv


# US Postal Service
source $HOME/app/dap-2.env
source $HOME/app/deploy-GovCloud/envs/postal-service.env
$HOME/app/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/app/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

