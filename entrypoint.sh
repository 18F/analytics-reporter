#!/bin/bash

export PATH="$PATH:/home/vcap/deps/0/bin"
echo $ANALYTICS_CREDENTIALS
node deploy/cron.js

