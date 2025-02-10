![Build Status](https://github.com/18F/analytics-reporter/actions/workflows/ci.yml/badge.svg?branch=master)
[![Snyk](https://snyk.io/test/github/18F/analytics-reporter/badge.svg)](https://snyk.io/test/github/18F/analytics-reporter)

# Analytics Reporter

A lightweight system for publishing analytics data from the Digital Analytics Program (DAP) Google Analytics 4 government-wide property.
This project uses the [Google Analytics Data API v1](https://developers.google.com/analytics/devguides/reporting/data/v1/rest) to acquire analytics data and then processes it into a flat data structure.

This is used in combination with [analytics-reporter-api](https://github.com/18F/analytics-reporter-api) to provide the data which powers the government analytics website, [analytics.usa.gov](https://analytics.usa.gov).

Available reports are named and described in [`api.json`](reports/api.json) and [`usa.json`](reports/usa.json). For now, they're hardcoded into the repository.

The process for adding features to this project is described in
[Development and deployment process](docs/development_and_deployment_process.md).

## Architecture and Technical Overview

The application has multiple jobs which run at scheduled intervals. See `deploy/publisher.js`
for details on the jobs and the timing at which they are kicked off.

The database functions as a queue using the [pg-boss library](https://github.com/timgit/pg-boss).
The publisher process puts messages on the queue which represent analytics reports
and how those reports should be fetched, processed, and published. One or more
consumer processes receive messages from the queue in parallel and execute the
corresponding tasks. See the usage section below for more details about reports
and jobs.

The application can publish analytics data reports to AWS S3, to local file, to
stdout, and/or to the database in JSON or CSV format.

The two application components are deployed to cloud.gov for dev, staging, and
production environments using GitHub Actions.  See `.github/workflows/ci.yml`
for details on the CI and deployment processes.

## Local development setup

### Prerequisites

* NodeJS > v22.x
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

### Running the application locally

#### Setup environment

See "Configuration and Google Analytics Setup" below for the required environment variables and other setup for Google Analytics auth.

It may be easiest to use the dotenv-cli package to configure the environment for the application.

Create a `.env` file using `env.example` as a template, with the correct credentials and other config values.
This file is ignored in the `.gitignore` file and should not be checked in to the repository.

#### Run the application

To run the application locally, you'll need a postgres
database running on port 5432. There is a docker-compose file provided in the
repo so that you can start an empty database with the command:

```bash
docker-compose up
```

Once the database is running, run the database migrations to set the database
schema:

```bash
npm run migrate
```

The application runs a queue publisher and a queue consumer, so the following
commands will need to be run as separate processes to start the app (uses the
dotenv package to set the environment variables for the processes):

```bash
# start publisher
npx dotenv -e .env.analytics node -- deploy/publisher.js

# start consumer
npx dotenv -e .env.analytics node -- deploy/consumer.js
```

## Configuration

### Google Analytics

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

### AWS

To configure the app for publishing data to S3 set the following environment variables:

```
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=[your-key]
export AWS_SECRET_ACCESS_KEY=[your-secret-key]
export AWS_BUCKET=[your-bucket]
export AWS_BUCKET_PATH=[your-path]
export AWS_CACHE_TIME=0
```

There are cases where you want to use a custom object storage server compatible with Amazon S3 APIs, like [minio](https://github.com/minio/minio), in that specific case you should set an extra env variable:

```
export AWS_S3_ENDPOINT=http://your-storage-server:port
```

### Egress proxy config

The application can be configured to use an egress proxy for HTTP calls which are external to the application's running environment.
To configure the app to use an egress proxy, set the following environment variables:

```
export PROXY_FQDN=[The fully qualified domain of your proxy server]
export PROXY_PORT=[The port for the proxy server]
export PROXY_USERNAME=[The username to use for proxy requests]
export PROXY_PASSWORD=[The password to use for proxy requests]
```

## Usage

Reports are created and stored by various methods by the consumer process.  Messages
describing the reports are created by the publisher process which runs jobs at intervals.

The publishing jobs pass options to the main `runQueuePublish` function in `index.js`
Example:

```javascript
// jobs/some_job.js
const { runQueuePublish } = require("../index.js");
const options = {
  json: true,
  agenciesFile: `../deploy/agencies.json`,
};

(async () => {
  await runQueuePublish(options);
})();
```

This will create a message on the queue for every report, in sequence, for all
agencies defined in `../deploy/agencies.json`.  Consumer processes will print out
the resulting report JSON to STDOUT for each message.

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

* `output` - (string) Write the report result to the directory path provided in
the string. Report files will be named with the name in the report configuration.
* `publish` - (boolean) If true, publish reports to an S3 bucket. Requires AWS
environment variables set as described above.
* `write-to-database` - (boolean) If true, write data to a database. Requires a
postgres configuration to be set in environment variables.
* `only` - (string) Only run one specific report matching the name provided in
the string.
* `slim` - (boolean) Where supported, use totals only (omit the `data` array).
Only applies to JSON format, and reports where `"slim": true`.
* `csv` - (boolean) Formats reports as CSV format. Multiple formats can be set.
* `json` - (boolean) Formats reports as JSON format. Multiple formats can be set.
* `frequency` - (string) Run only reports with 'frequency' value matching the
provided string.
* `debug` - (boolean) Print debug details on STDOUT.
* agenciesFile - (string) The path to a JSON file describing an array of objects
with the GA property to use for reporting queries and the internal name of the
agency. Reports will be run for all agency configuration objects in the file.

## Saving data to postgres

The analytics reporter can write data it pulls from Google Analytics to a
Postgres database when the `write-to-database` option is set. The postgres
configuration can be set using environment variables:

```bash
export POSTGRES_HOST = "my.db.host.com"
export POSTGRES_USER = "postgres"
export POSTGRES_PASSWORD = "123abc"
export POSTGRES_DATABASE = "analytics"
```

The database expects a particular schema which will be described in the [API
server](https://github.com/18f/analytics-reporter-api) that consumes and publishes this data.

## Cloud.gov setup

The application requires an S3 bucket and RDS instance running a Postgres database
setup in cloud.gov as services.

Examples below use the Cloudfoundry CLI.

```bash
# Create and bind an S3 bucket service to the app
cf create-service s3 basic-public analytics-s3
cf bind-service analytics-reporter-consumer analytics-s3

# Create a RDS Postgres service for use by the app
cf create-service aws-rds small-psql analytics-reporter-database

# Connect to the database, enable pgcrypto extension, and create a new database
# for the PgBoss message queue library
cf connect-to-service -no-client analytics-develop analytics-reporter-database-develop
psql -h localhost -p <port> -U <username> -d <database>
`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`
`\dx` # check installed extension to ensure pgcrypto exists now.
`CREATE DATABASE <message_queue_database_name>;`

# Bind the database to both the publisher and consumer apps
cf bind-service analytics-reporter-publisher analytics-reporter-database
cf bind-service analytics-reporter-consumer analytics-reporter-database

# Database migrations for the reporter's analytics database are handled by the
# analytics-reporter-api application. Deploy the API server via CI to migrate
# the database.

# Remove public egress permissions from the space running the application if it has them
cf unbind-security-group public_networks_egress gsa-opp-analytics analytics-dev --lifecycle running

# Create a network policy in the application's space which allows communication to the egress proxy which runs in a space with public egress permissions
cf add-network-policy analytics-reporter-consumer analytics-egress-proxy -s analytics-public-egress -o gsa-opp-analytics --protocol tcp --port 8080


# Create a network policy in the public-egress space which allows communication from the egress proxy back to the application.
# The port for each API call the app makes is determined randomly, so allow the full range of port numbers.
cf target -s analytics-public-egress
cf add-network-policy analytics-egress-proxy analytics-reporter-consumer -s analytics-dev -o gsa-opp-analytics --protocol tcp --port 1-65535
```

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
