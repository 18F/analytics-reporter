#!/bin/bash

# Set environmental variables in cloud.gov based on the `.env` documentation.

set -e

if [ -z $APP_NAME ]
then
  # shellcheck disable=SC2016
  echo '$APP_NAME is not defined. Please rerun this script with the value in the manifest.yml under `- name:`'
  echo 'example: APP_NAME=analytics-reporter ./cg-toolkit/generate-env.sh'
  exit 1
fi

if [ ! -a .env ]
then
  echo ".env does not exist. Please read the documentation for .env file creation."
fi

# And because I do want words not lines...
# shellcheck disable=SC2013
for word in $( cat .env )
do
  if [[ $word != "export" ]]
  then
    env_var=$( echo "$word" | cut -d '=' -f 1 )
    env_value=$( echo "$word" | cut -d '=' -f 2 )
    cf set-env "$APP_NAME" "$env_var" "$env_value"
  fi
done
