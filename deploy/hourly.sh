#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

# just the one awkward 'today' report
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# ED Reports
source $HOME/envs/ed.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# NASA Reports
source $HOME/envs/nasa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# DOJ Reports
source $HOME/envs/doj.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# VA Reports
source $HOME/envs/va.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Commerce Reports
source $HOME/envs/commerce.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# EPA Reports
source $HOME/envs/epa.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# SBA Reports
source $HOME/envs/sba.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# Energy Reports
source $HOME/envs/energy.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# DOI Reports
source $HOME/envs/doi.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose

# NARA Reports
source $HOME/envs/nara.env
$HOME/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose
