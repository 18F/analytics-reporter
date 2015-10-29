#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

# just the one awkward 'today' report
$HOME/node_modules/analytics-reporter/bin/analytics --publish --frequency=hourly --slim --verbose
