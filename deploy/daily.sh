#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

# JSON and CSV versions
$HOME/node_modules/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose
$HOME/node_modules/analytics-reporter/bin/analytics --publish --frequency=daily --slim --verbose --csv
