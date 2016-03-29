#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose

# we want just one realtime report in CSV, hardcoded for now to save on API requests
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# ED reports
source $HOME/envs/ed.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# VA reports
source $HOME/envs/va.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# NASA reports
source $HOME/envs/nasa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# DOJ reports
source $HOME/envs/doj.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Commerce reports
source $HOME/envs/commerce.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Use the second key from this point on
source $HOME/credentials/dap_1.env

# EPA reports
source $HOME/envs/epa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# sba reports
# source $HOME/envs/sba.env
# $HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
# $HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# Energy reports
source $HOME/envs/energy.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# DOI reports
source $HOME/envs/doi.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv

# NARA reports
source $HOME/envs/nara.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv
