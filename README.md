## Analytics Reporter

*This project is still under construction.*

A lightweight system for publishing analytics data from Google Analytics profiles.

Available reports are named and described in [`reports.json`](reports.json). For now, they're hardcoded into the repository.

### Setup

* Install through npm:

```bash
npm install -g analytics-reporter
```

* [Create an API service account](https://developers.google.com/accounts/docs/OAuth2ServiceAccount) in the Google developer dashboard.

* Take the generated client email address (ends with `gserviceaccount.com`) and grant it `Read & Analyze` permissions to the Google Analytics profile(s) whose data you wish to publish.

* Download the `.p12` private key file from the dashboard. Copy the password Google shows you (you will only need it once).

* Transform the `p12` file into a `.pem` file, entering the password when asked:

```bash
openssl pkcs12 -in <name of your p12 key>.p12 -out secret_key.pem -nocerts -nodes
```

* Visit the "APIs" section of the Google Developer Dashboard for your project, and enable it for the "Analytics API".

* Set environment variables for your app's generated email address, and for the profile you authorized it to:

```bash
export ANALYTICS_REPORT_EMAIL="asdfghjkl@developer.gserviceaccount.com"
export ANALYTICS_REPORT_IDS="ga:XXXXXX"
```

You may wish to manage these using [`autoenv`](https://github.com/kennethreitz/autoenv).

To find your Google Analytics view ID:

  1. Sign in to your Analytics account.
  1. Select the Admin tab.
  1. Select an account from the dropdown in the ACCOUNT column.
  1. Select a property from the dropdown in the PROPERTY column.
  1. Select a view from the dropdown in the VIEW column.
  1. Click "View Settings"
  1. Copy the view ID.  You'll need to enter it with `ga:` as a prefix.

* You can specify your private key through environment variables either as a file path, or the contents of the key (helpful for Heroku and Heroku-like systems).

To specify a file path:

```
export ANALYTICS_KEY_PATH="/path/to/secret_key.pem"
```

To specify the key directly, paste in the contents of the `.pem` **directly and exactly**, in quotes (below example has been sanitized):

```
export ANALYTICS_KEY="Bag Attributes
    friendlyName: privatekey
    localKeyID: [your key id]
Key Attributes: <No Attributes>
-----BEGIN PRIVATE KEY-----
[contents of your key]
-----END PRIVATE KEY-----"
```

* Make sure your computer or server is syncing its time with the world over NTP. Your computer's time will need to match those on Google's servers for the authentication to work.

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

* `--publish` - Publish to an S3 bucket. Requires AWS environment variables set as described above.

```bash
analytics --publish
```

* `--only` - only run one or more specific reports. Multiple reports comma separated, encapsulated by quotes.

```bash
analytics --only devices
analytics --only "devices,today"
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

### Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
