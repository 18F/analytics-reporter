#!/bin/bash

export PATH=$PATH:/usr/local/bin
source $HOME/.bashrc

$HOME/node_modules/analytics-reporter/bin/analytics --publish --frequency=realtime --slim --verbose

# we want just one realtime report in CSV, hardcoded for now to save on API requests
$HOME/node_modules/analytics-reporter/bin/analytics --publish --only=all-pages-realtime --slim --verbose --csv
