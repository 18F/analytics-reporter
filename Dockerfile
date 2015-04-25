##
# Dockerfile for analytics-reporter.
# https://github.com/18F/analytics-reporter
#
# For information about setting up keys, etc, see README.md.
# This Dockerfile requires the pem key to be named secret_key.pem and to be
# in the same directory, and for settings to be added to config.txt.
#
# The .env file, based off env.example, should be in this directory and include
# these lines:
#   export ANALYTICS_REPORT_IDS="ga:XXXXXX"
#   export ANALYTICS_REPORT_EMAIL="YYYYYY@developer.gserviceaccount.com"
#   export ANALYTICS_KEY_PATH="/opt/analytics/secret_key.pem"
##

FROM iojs:slim
RUN apt-get update && apt-get install -yq \
  npm

##
# Install analytics-reporter.
##
RUN npm install -g analytics-reporter

##
# Add pem key.
##
RUN mkdir /opt/analytics
COPY ./secret_key.pem /opt/analytics/secret_key.pem

##
# Add other environment variables.
##
ADD .env /opt/analytics/.env
RUN cat /opt/analytics/.env >> /root/.bashrc
