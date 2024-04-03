![Build Status](https://github.com/18F/analytics-reporter/actions/workflows/ci.yml/badge.svg?branch=master)
[![Snyk](https://snyk.io/test/github/18F/analytics-reporter/badge.svg)](https://snyk.io/test/github/18F/analytics-reporter)
[![Code Climate](https://codeclimate.com/github/18F/analytics-reporter/badges/gpa.svg)](https://codeclimate.com/github/18F/analytics-reporter)

# Analytics Reporter

A lightweight system for publishing analytics data from the Digital Analytics Program (DAP) Google Analytics 4 government-wide property.
This project uses the [Google Analytics Data API v1](https://developers.google.com/analytics/devguides/reporting/data/v1/rest) to acquire analytics data and then processes it into a flat data structure.

The project previously used the [Google Analytics Core Reporting API v3](https://developers.google.com/analytics/devguides/reporting/core/v3/)
and the [Google Analytics Real Time API v3](https://developers.google.com/analytics/devguides/reporting/realtime/v3/), also known as Universal Analytics,  which has slightly different data points. See [Upgrading from Universal Analytics](#upgrading-from-universal-analytics) for more details. The Google Analytics v3 API will be deprecated on July 1, 2024.

This is used in combination with [analytics-reporter-api](https://github.com/18F/analytics-reporter-api) to power the government analytics website, [analytics.usa.gov](https://analytics.usa.gov).

Available reports are named and described in [`api.json`](reports/api.json) and [`usa.json`](reports/usa.json). For now, they're hardcoded into the repository.

## Local development setup

### Prerequistites

* NodeJS > v20.x
* A postgres DB running and/or docker installed

### Install dependencies

```bash
npm install
```

### Linting

This repo uses Eslint and Prettier for code static analysis and formatting. Run
the linter with:

```bash
npm run lint
```

Automatically fix lint issues with:

```bash
npm run lint:fix
```

### Install git hooks

There are some git hooks provided in the `./hooks` directory to help with
common development tasks. These will checkout current NPM packages on branch
change events, and run the linter on pre-commit.

Install the provided hooks with the following command:

```bash
npm run install-git-hooks
```

### Running the unit tests

The unit tests for this repo require a local PostgreSQL database. You can run a
local DB server or create a docker container using the provided test compose
file. (Requires docker and docker-compose to be installed)

Starting a docker test DB:

```bash
docker-compose -f docker-compose.test.yml up
```

Once you have a PostgreSQL DB running locally, you can run the tests. The test
DB connection in knexfile.js has some default connection config which can be
overridden with environment variables.  If using the provided docker-compose DB
then you can avoid setting the connection details.

Run the tests (pre-test hook runs DB migrations):

```bash
npm test
```

#### Running the unit tests with code coverage reporting

If you wish to see a code coverage report after running the tests, use the
following command. This runs the DB migrations, tests, and the NYC code coverage
tool:

```bash
npm run coverage
```

### Running the integration tests

The integration tests for this repo require the google analytics credentials to
be set in the environment. This can be setup with the dotenv-cli package as
described in "Setup Environment" section above.

Note that these tests make real requests to google analytics APIs and should be
run sparingly to avoid being rate limited in our live apps which use the
same account credentials.

```bash
# Run cucumber integration tests
dotenv -e .env npm run cucumber

# Run cucumber integration tests with node debugging enabled
dotenv -e .env npm run cucumber:debug
```

The cucumber features and support files can be found in the `features` directory

### Running the application as a npm package

* To run the utility on your computer, install it through npm:

```bash
npm install -g analytics-reporter
```

### Running the application locally

To run the application locally with database reporting, you'll need a postgres
database running on port 5432. There is a docker-compose file provided in the
repo so that you can start an empty database with the command:

```bash
docker-compose up
```

#### Setup environment

See "Configuration and Google Analytics Setup" below for the required environment variables and other setup for Google Analytics auth.

It may be easiest to use the dotenv-cli package to configure the environment for the application.

Create a `.env` file using `env.example` as a template, with the correct credentials and other config values.
This file is ignored in the `.gitignore` file and should not be checked in to the repository.

#### Run the application

```bash
# running the app with no config
npm start

# running the app with dotenv-cli
dotenv -e .env npm start
```

## Configuration and Google Analytics Setup

* Enable [Google Analytics API](https://console.cloud.google.com/apis/library/analytics.googleapis.com) for your project in the Google developer dashboard.

* Create a service account for API access in the [Google developer dashboard](https://console.cloud.google.com/iam-admin/serviceaccounts).

* Go to the "KEYS" tab for your service account, create new key using "ADD KEY" button, and download the **JSON** private key file it gives you.

* Grab the generated client email address (ends with `gserviceaccount.com`) from the contents of the .json file.

* Grant that email address `Read, Analyze & Collaborate` permissions on the Google Analytics profile(s) whose data you wish to publish.

* Set environment variables for `analytics-reporter`. It needs email address of service account, and view ID in the profile you authorized it to:

```bash
export ANALYTICS_REPORT_EMAIL="YYYYYYY@developer.gserviceaccount.com"
export ANALYTICS_REPORT_IDS="XXXXXX"
```

You may wish to manage these using [`autoenv`](https://github.com/kennethreitz/autoenv). If you do, there is an `example.env` file you can copy to `.env` to get started.

To find your Google Analytics view ID:

  1. Sign in to your Analytics account.
  1. Select the Admin tab.
  1. Select an account from the dropdown in the ACCOUNT column.
  1. Select a property from the dropdown in the PROPERTY column.
  1. Select a view from the dropdown in the VIEW column.
  1. Click "View Settings"
  1. Copy the view ID.  You'll need to enter it with `ga:` as a prefix.

* You can specify your private key through environment variables either as a file path, or the contents of the key (helpful for Heroku and Heroku-like systems).

To specify a file path (useful in development or Linux server environments):

```
export ANALYTICS_KEY_PATH="/path/to/secret_key.json"
```

Alternatively, to specify the key directly (useful in a PaaS environment), paste in the contents of the JSON file's `private_key` field **directly and exactly**, in quotes, and **rendering actual line breaks** (not `\n`'s) (below example has been sanitized):

```
export ANALYTICS_KEY="-----BEGIN PRIVATE KEY-----
[contents of key]
-----END PRIVATE KEY-----
"
```

If you have multiple accounts for a profile, you can set the `ANALYTICS_CREDENTIALS` variable with a JSON encoded array of those credentials and they'll be used to authorize API requests in a round-robin style.

```
export ANALYTICS_CREDENTIALS='[
  {
    "key": "-----BEGIN PRIVATE KEY-----\n[contents of key]\n-----END PRIVATE KEY-----",
    "email": "email_1@example.com"
  },
  {
    "key": "-----BEGIN PRIVATE KEY-----\n[contents of key]\n-----END PRIVATE KEY-----",
    "email": "email_2@example.com"
  }
]'
```

* Make sure your computer or server is syncing its time with the world over NTP. Your computer's time will need to match those on Google's servers for the authentication to work.

* Test your configuration by printing a report to STDOUT:

```bash
./bin/analytics --only users
```

If you see a nicely formatted JSON file, you are all set.

* (Optional) Authorize yourself for S3 publishing.

If you plan to use this project's lightweight S3 publishing system, you'll need to add 6 more environment variables:

```
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=[your-key]
export AWS_SECRET_ACCESS_KEY=[your-secret-key]

export AWS_BUCKET=[your-bucket]
export AWS_BUCKET_PATH=[your-path]
export AWS_CACHE_TIME=0
```

There are cases where you want to use a custom  object storage server compatible with Amazon S3 APIs, like [minio](https://github.com/minio/minio), in that specific case you should set an extra env variable:

```
export AWS_S3_ENDPOINT=http://your-storage-server:port
```

## Other configuration

If you use a **single domain** for all of your analytics data, then your profile is likely set to return relative paths (e.g. `/faq`) and not absolute paths when accessing real-time reports.

You can set a default domain, to be returned as data in all real-time data point:

```
export ANALYTICS_HOSTNAME=https://konklone.com
```

This will produce points similar to the following:

```json
{
  "page": "/post/why-google-is-hurrying-the-web-to-kill-sha-1",
  "page_title": "Why Google is Hurrying the Web to Kill SHA-1",
  "active_visitors": "1",
  "domain": "https://konklone.com"
}
```

## Use

Reports are created and published using `npm start` or `./bin/analytics`

```bash
# using npm scripts
npm start

# running the app directly
./bin/analytics
```

This will run every report, in sequence, and print out the resulting JSON to STDOUT.

A report might look something like this:

```javascript
{
  "name": "devices",
  "frequency": "daily",
  "slim": true,
  "query": {
    "dimensions": [
      {
        "name": "date"
      },
      {
        "name": "deviceCategory"
      }
    ],
    "metrics": [
      {
        "name": "sessions"
      }
    ],
    "dateRanges": [
      {
        "startDate": "30daysAgo",
        "endDate": "yesterday"
      }
    ],
    "orderBys": [
      {
        "dimension": {
          "dimensionName": "date"
        },
        "desc": true
      }
    ]
  },
  "meta": {
    "name": "Devices",
    "description": "30 days of desktop/mobile/tablet visits for all sites."
  }
  "data": [
    {
      "date": "2023-12-25",
      "device": "mobile",
      "visits": "13681896"
    },
    {
      "date": "2023-12-25",
      "device": "desktop",
      "visits": "5775002"
    },
    {
      "date": "2023-12-25",
      "device": "tablet",
      "visits": "367039"
    },
   ...
  ],
  "totals": {
    "visits": 3584551745,
    "devices": {
      "mobile": 2012722956,
      "desktop": 1513968883,
      "tablet": 52313579,
      "smart tv": 5546327
    }
  },
  "taken_at": "2023-12-26T20:52:50.062Z"
}
```

### Options

* `--output` - write the report result to a provided directory. Report files will be named with the name in the report configuration.

```bash
./bin/analytics --output /path/to/data
```

* `--publish` - Publish to an S3 bucket. Requires AWS environment variables set as described above.

```bash
./bin/analytics --publish
```

* `--write-to-database` - write data to a database. Requires a postgres configuration to be set in environment variables as described below.

* `--only` - only run one or more specific reports. Multiple reports are comma separated.

```bash
./bin/analytics --only devices
./bin/analytics --only devices,today
```

* `--slim` -Where supported, use totals only (omit the `data` array). Only applies to JSON, and reports where `"slim": true`.

```bash
./bin/analytics --only devices --slim
```

* `--csv` - Formats reports as CSV instead of the default JSON format.

```bash
./bin/analytics --csv
```

* `--frequency` - Run only reports with 'frequency' value matching the provided value.

```bash
./bin/analytics --frequency=realtime
```

* `--debug` - Print debug details on STDOUT.

```bash
./bin/analytics --publish --debug
```

## Saving data to postgres

The analytics reporter can write data is pulls from Google Analytics to a
Postgres database. The postgres configuration can be set using environment
variables:

```bash
export POSTGRES_HOST = "my.db.host.com"
export POSTGRES_USER = "postgres"
export POSTGRES_PASSWORD = "123abc"
export POSTGRES_DATABASE = "analytics"
```

The database expects a particular schema which will be described in the [API
server](https://github.com/18f/analytics-reporter-api) that consumes and publishes this data.

To write reports to a database, use the `--write-to-database` option when
starting the reporter.

## Upgrading from Universal Analytics

### Background

This project previously acquired data from Google Analytics V3, also known as Universal Analytics (UA).

Google is retiring UA and is encouraging users to move to their new version Google Analytics V4 (GA4).
UA will be deprecated on July 1st 2024.

### Migration details

Some data points have been removed or added by Google as part of the move to GA4.

#### Deprecated fields

- browser_version
- has_social_referral
- exits
- exit_page

#### New fields

##### bounce_rate

The percentage of sessions that were not engaged.  GA4 defines engaged as a
session that lasts longer than 10 seconds or has multiple pageviews.

##### file_name

The page path of a downloaded file.

##### language_code

The ISO639 language setting of the user's device.  e.g. 'en-us'

##### session_default_channel_group

An enum which describes the session. Possible values:

'Direct', 'Organic Search', 'Paid Social', 'Organic Social', 'Email',
'Affiliates', 'Referral', 'Paid Search', 'Video', and 'Display'

### Deploying to Cloud.gov

The analytics reporter runs on :cloud:.gov. Please refer to the `manifest.yml`
file at the root of the repository for application information.

Ensure you're targeting the proper `org` and `space`.

```shell
cf target
```

Deploy the application with the following command.

```shell
cf push -f manifest.yml
```

Set the environmental variables based on local `.env` file.

```shell
cf set-env analytics-reporter AWS_ACCESS_KEY_ID 123abc
cf set-env analytics-reporter AWS_SECRET_ACCESS_KEY 456def
# ...
```

Restage the application to use the environment variables.

```shell
cf restage analytics-reporter
```

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
