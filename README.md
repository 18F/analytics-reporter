## Analytics Reporter

*This project is still under construction.*

A lightweight system for publishing analytics data from Google Analytics profiles.


### Installing

* Install through npm:

```bash
npm install -g analytics-reporter
```

* [Create an API service account](https://developers.google.com/accounts/docs/OAuth2ServiceAccount) in the Google developer dashboard.

* Take the generated client email address (ends with `gserviceaccount.com`) and grant it `Read & Analyze` permissions to the Google Analytics profile(s) whose data you wish to publish.

* Download the `.p12` private key file from the dashboard, and transform it into a `.pem` file:

```bash
openssl pkcs12 -in <name of your p12 key>.p12 -out secret_key.pem -nocerts -nodes
```

* Set the following environment variables:

```bash
export ANALYTICS_REPORT_EMAIL="asdfghjkl@developer.gserviceaccount.com"
export ANALYTICS_REPORT_IDS="ga:XXXXXX"
export ANALYTICS_KEY_PATH="/path/to/secret_key.pem"
```
You may wish to manage these using [`autoenv`](https://github.com/kennethreitz/autoenv).

* Test your configuration by printing a report to STDOUT:

```bash
./bin/report users
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

### Use

Reports are named and described in [`reports.json`](reports.json). You can publish reports in 2 ways:

* **Print a single report to STDOUT** with the `./bin/report` command:

```bash
./bin/report devices
```

It should print something like:

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
    "start-date": "7daysAgo"

    // ...
  }
}
```

* **Save every report to disk** with the `./bin/all-reports` command:

```bash
./bin/all-reports
```

It will drop a copy of every report (`users.json`, `devices.json`, etc.) to disk in the current working directory. Override the output directory with the `--output` flag.

Use the `--only` flag to limit this to a single report:

```bash
./bin/all-reports --only devices
```

* **Publish every report to S3** by adding `--publish` to `all-reports`:

```bash
./bin/all-reports --publish
```

This will put a copy of every report into S3, at the bucket and path you've specified in your environment variables.

You can also limit this to a single report:

```bash
./bin/all-reports --publish --only devices
```

### Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
