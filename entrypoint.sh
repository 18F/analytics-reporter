#!/bin/bash

export PATH="$PATH:/home/vcap/deps/0/bin"
touch /home/vcap/app/creds.json
export ANALYTICS_CREDENTIALS=$(printf "%s\n" $CREDS | base64 -w 0 --decode)
node deploy/cron.js
