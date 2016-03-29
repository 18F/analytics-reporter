#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

# JSON and CSV versions
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv

# ED Reports
source $HOME/envs/ed.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv

# VA Reports
source $HOME/envs/va.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv

# NASA Reports
source $HOME/envs/nasa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv

# DOJ Reports
source $HOME/envs/doj.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Commerce Reports
source $HOME/envs/commerce.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv

# EPA Reports
source $HOME/envs/epa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv

# SBA Reports
# source $HOME/envs/sba.env
# $HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
# $HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv

# Energy Reports
source $HOME/envs/energy.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv

# DOI Reports
source $HOME/envs/doi.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv

# NARA Reports
source $HOME/envs/nara.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv
