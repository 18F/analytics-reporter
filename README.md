 [![Code Climate](https://codeclimate.com/github/18F/analytics-reporter/badges/gpa.svg)](https://codeclimate.com/github/18F/analytics-reporter) [![CircleCI](https://circleci.com/gh/18F/analytics.usa.gov.svg?style=shield)](https://circleci.com/gh/18F/analytics.usa.gov)  [![Dependency Status](https://gemnasium.com/badges/github.com/18F/analytics-reporter.svg)](https://gemnasium.com/github.com/18F/analytics-reporter)

## Analytics Reporter

A lightweight system for publishing analytics data from Google Analytics profiles. Uses the [Google Analytics Core Reporting API v3](https://developers.google.com/analytics/devguides/reporting/core/v3/) and the [Google Analytics Real Time API v3](https://developers.google.com/analytics/devguides/reporting/realtime/v3/).

This is used in combination with [18F/analytics.usa.gov](https://github.com/18F/analytics.usa.gov) to power the government analytics hub, [analytics.usa.gov](https://analytics.usa.gov).

Available reports are named and described in [`reports.json`](reports/reports.json). For now, they're hardcoded into the repository.


### Installation

### Docker

* To build the docker image on your computer, run:

````bash
export NODE_ENV=development # just needed when developing against the image
export NODE_ENV=production # to build an image for production
docker build --build-arg NODE_ENV=${NODE_ENV} -t analytics-reporter .
````

Then you can create an alias in order to have the analytics command available:

```bash
alias analytics="docker run -t -v ${HOME}:${HOME} -e ANALYTICS_REPORT_EMAIL -e ANALYTICS_REPORT_IDS -e ANALYTICS_KEY analytics-reporter"
```

To make this command working as expected you should export the env vars as follows:

```bash
export ANALYTICS_REPORT_EMAIL=  "your-report-email"
export ANALYTICS_REPORT_IDS="your-report-ids"
export ANALYTICS_KEY="your-key"
```

### NPM

* To run the utility on your computer, install it through npm:

```bash
npm install -g analytics-reporter
```

If you're developing locally inside the repo, `npm install` is sufficient.

### Setup

* Create an API service account in the [Google developer dashboard](https://console.developers.google.com/apis/).

* Visit the "APIs" section of the Google Developer Dashboard for your project, and enable it for the "Analytics API".

* Go to the "Credentials" section and generate "service account" credentials using a new service account.

* Download the **JSON** private key file it gives you.

* Grab the generated client email address (ends with `gserviceaccount.com`) from the contents of the .json file.

* Grant that email address `Read, Analyze & Collaborate` permissions on the Google Analytics profile(s) whose data you wish to publish.

* Set environment variables for your app's generated email address, and for the profile you authorized it to:

```bash
export ANALYTICS_REPORT_EMAIL="YYYYYYY@developer.gserviceaccount.com"
export ANALYTICS_REPORT_IDS="ga:XXXXXX"
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

### Use

Reports are created and published using the `analytics` command.

```bash
analytics
```

This will run every report, in sequence, and print out the resulting JSON to STDOUT. There will be two newlines between each report.

A report might look something like this:

```javascript
{
  "name": "devices",
  "query": {
    "dimensions": [
      "ga:date",
      "ga:deviceCategory"
    ],
    "metrics": [
      "ga:sessions"
    ],
    "start-date": "90daysAgo",
    "end-date": "yesterday",
    "sort": "ga:date"
  },
  "meta": {
    "name": "Devices",
    "description": "Weekly desktop/mobile/tablet visits by day for all sites."
  },
  "data": [
    {
      "date": "2014-10-14",
      "device": "desktop",
      "visits": "11495462"
    },
    {
      "date": "2014-10-14",
      "device": "mobile",
      "visits": "2499586"
    },
    {
      "date": "2014-10-14",
      "device": "tablet",
      "visits": "976396"
    },
    // ...
  ],
  "totals": {
    "devices": {
      "mobile": 213920363,
      "desktop": 755511646,
      "tablet": 81874189
    },
    "start_date": "2014-10-14",
    "end_date": "2015-01-11"
  }
}
```

#### Options

* `--output` - Output to a directory.

```bash
analytics --output /path/to/data
```

*Note that when using the docker image you have to use the absolute path, for example "/home/youruser/path/to/data"*

* `--publish` - Publish to an S3 bucket. Requires AWS environment variables set as described above.

```bash
analytics --publish
```

* `--write-to-database` - write data to a database. Requires a postgres configuration to be set in environment variables as described below.

* `--only` - only run one or more specific reports. Multiple reports are comma separated.

```bash
analytics --only devices
analytics --only devices,today
```

* `--slim` -Where supported, use totals only (omit the `data` array). Only applies to JSON, and reports where `"slim": true`.

```bash
analytics --only devices --slim
```

* `--csv` - Gives you CSV instead of JSON.

```bash
analytics --csv
```

* `--frequency` - Limit to reports with this 'frequency' value.

```bash
analytics --frequency=realtime
```

* `--debug` - Print debug details on STDOUT.

```bash
analytics --publish --debug
```

### Saving data to postgres

The analytics reporter can write data is pulls from Google Analytics to a
Postgres database. The postgres configuration can be set using environment
variables:

```bash
export POSTGRES_HOST = "my.db.host.com"
export POSTGRES_USER = "postgres"
export POSTGRES_PASSWORD = "123abc"
export POSTGRES_DATABASE = "analytics"
```

The database expects a particular schema which will be described in the API
server that consumes this data.

To write reports to a database, use the `--write-to-database` option when
starting the reporter.

### Deploying to GovCloud

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

### Developing with Docker

This repo contains a [Docker Compose](https://docs.docker.com/compose/)
configuration. The reporter is configured to run in the container as if it were
running in GovCloud. This is helpful for seeing how the reporter will behave
when deployed without pushing it to cloud.gov.

To start the reporter, first run the `docker-update` script to install the
necessary dependencies:

```shell
./bin/docker-update
```

Note that this script will need to be run again when new dependencies are added
to update the Docker volumes where the dependencies are stored.

After the dependencies are installed, the reporter can be started using Docker
Compose:

```shell
docker-compose up
```

### Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
