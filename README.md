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

The process for adding features to this project is described in
[Development and deployment process](docs/development_and_deployment_process.md).

## Local development setup

### Prerequisites

* NodeJS > v20.x
* [dotenv-cli](https://www.npmjs.com/package/dotenv-cli)
* (Optional) A postgres DB running and/or docker installed

### Preliminary setup

1. Clone repo.
2. Run `npm install` to install dependencies.
2. Copy `env.example` to `.env`.

Throughout this README, we'll be using dotenv and the `.env` file to manage environment variables locally. The `.env` file
is ignored in the `.gitignore` file and should not be checked into the repository.

### Configure access to the Google Analytics Data API

In production, the analytics reporter pulls data from our Google Analytics 4 account via an API. To run the reporter locally (and the integration tests),
you will need a Google Analytics data source to pull from. We have not set up any dev Google Analytics properties, so you will be using the production properties for
local dev too. The reporter only needs read access to the GA account, so there's no danger of you corrupting the production data.

API calls are authorized through a service account. The service account was set up according to the instructions [here](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries).
Currently, there is no procedure to set up environment specific service accounts, so you will be using the same service account that is used in production.
Keep in mind that you are sharing quotas with the production system and other environments. GA's quota system is described [here](https://developers.google.com/analytics/blog/2023/data-api-quota-management).

#### Step 1 - Configure GA Data API credentials
Request the Google Analytics Data API service account credentials from another member of the team. Save the received json file on your computer and 
then set `GOOGLE_APPLICATION_CREDENTIALS` as the path to the json file in `.env`.

```bash
# Example
export GOOGLE_APPLICATION_CREDENTIALS="/Users/my_user/service_account_creds.json"`
```

#### Step 2 - Configure a GA property to pull reports for
When the reporter runs, it will pull data from a single Google Analytics 4 property. [This directory](deploy/envs) contains a configuration
file for each property. Choose a property and copy the environment variables from its file to your `.env` file.

```bash
# Example
export ANALYTICS_REPORT_IDS="395251184"
export AGENCY_NAME=general-services-administration
export AWS_BUCKET_PATH=data/$AGENCY_NAME
```

## Running the application

Now you can run the analytics reporter app to collect reports for the GA4 property you specified in ANALYTICS_REPORT_IDS:
```bash
# run all reports and print them as JSON to STDOUT
dotenv ./bin/analytics

# run all reports and save them to a directory
# analytics.usa.gov can load reports from this format
dotenv ./bin/analytics --output ./data/general-services-administration

# run a single report
dotenv ./bin/analytics --only devices
```

The analytics reporter script has additional runtime options which are described here.

```bash
npm install -g analytics-reporter
```

### Writing reports to S3
The reporter can write reports to an S3 bucket. In production, this is where analytics.usa.gov loads its data from.

```bash
dotenv ./bin/analytics --publish
```

Before you publish to S3, you'll need to set 6 more environment variables in `.env`:

```
export AWS_REGION=[your-region]
export AWS_ACCESS_KEY_ID=[your-key]
export AWS_SECRET_ACCESS_KEY=[your-secret-key]
export AWS_BUCKET=[your-bucket]
export AWS_BUCKET_PATH=[your-path]
export AWS_CACHE_TIME=0
```

If you want to experiment with S3 publishing, remember that S3 buckets may be created in a [Cloud.gov sandbox](https://cloud.gov/docs/pricing/free-limited-sandbox/).

There may also be cases where you want to use a custom object storage server compatible with Amazon S3 APIs, like [minio](https://github.com/minio/minio), in that specific case you should set an extra env variable:

```
export AWS_S3_ENDPOINT=http://your-storage-server:port
```

### Writing report data to Postgres
The reporter can also write reports to Postgres. In production, this is where the analytics reporter API loads its data from.

```bash
dotenv ./bin/analytics --write-to-database
```

In order to run this command, you'll need a Postgres
database running on port 5432. There is a docker-compose file provided in the
repo so that you can start an empty database with the command:

```bash
docker-compose up
```

The development
DB connection in knexfile.js has some default connection config which can be
overridden with environment variables.  If using the provided docker-compose DB
then you can avoid setting the connection details. However, you do need to run migrations on the DB before running the reporter app.

```bash
npm run migrate
```

The database expects a particular schema which will be described in the [API
server](https://github.com/18f/analytics-reporter-api) that consumes and publishes this data.

## Other developer tasks

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
dotenv npm run cucumber

# Run cucumber integration tests with node debugging enabled
dotenv npm run cucumber:debug
```

The cucumber features and support files can be found in the `features` directory


## Configuration

### Egress proxy config

The application can be configured to use an egress proxy for HTTP calls which are external to the application's running environment.
To configure the app to use an egress proxy, set the following environment variables:

```
export PROXY_FQDN=[The fully qualified domain of your proxy server]
export PROXY_PORT=[The port for the proxy server]
export PROXY_USERNAME=[The username to use for proxy requests]
export PROXY_PASSWORD=[The password to use for proxy requests]
```

### Other configuration

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

## Cloud.gov setup

The application requires an S3 bucket and RDS instance running a Postgres database setup in cloud.gov as services.
Examples below use the Cloudfoundry CLI.

```bash
# Create and bind an S3 bucket service to the app
cf create-service s3 basic-public analytics-s3
cf bind-service analytics-reporter analytics-s3

# Create and bind a RDS Postgres service to the app
cf create-service aws-rds small-psql analytics-reporter-database
cf bind-service analytics-reporter analytics-reporter-database

# Database migrations are handled by the analytics-reporter-api application.
# Deploy the API server via CI to migrate the database.

# Create an internal app route for the application (for the egress proxy to communicate back to the server).
cf map-route analytics-reporter apps.internal --hostname analytics-reporter

# Remove public egress permissions from the space running the application if it has them
cf unbind-security-group public_networks_egress gsa-opp-analytics analytics-dev --lifecycle running

# Create a network policy in the application's space which allows communication to the egress proxy which runs in a space with public egress permissions
cf add-network-policy analytics-reporter analytics-egress-proxy -s analytics-public-egress -o gsa-opp-analytics --protocol tcp --port 8080

# Create a network policy in the public-egress space which allows communication from the egress proxy back to the application.
# The port for each API call the app makes is determined randomly, so allow the full range of port numbers.
cf add-network-policy analytics-egress-proxy analytics-reporter -s analytics-dev -o gsa-opp-analytics --protocol tcp --port 1-65535
```

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

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
