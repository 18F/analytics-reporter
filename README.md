## Light-weight Google Analytics Proxy

*This project is still under construction.*

Analytics Proxy allows you to publicly share Google Analytics reporting data.

It was partially inspired by [Google Analytics superProxy](https://github.com/googleanalytics/google-analytics-super-proxy); however, unlike [Google Analytics superProxy](https://github.com/googleanalytics/google-analytics-super-proxy) it doesn’t need to be deployed on [Google App Engine](https://appengine.google.com/)

### Setup

* Install [MongoDB](https://www.mongodb.org/) and [Node](http://nodejs.org/).

* Install Node dependencies:

```bash
npm install
```

* Create the config file:

```bash
cp config.js.example config.js
```

* [Create Google API service account and take note of the client email](https://developers.google.com/accounts/docs/OAuth2ServiceAccount).

* Download the P12 private key file and place it in the root of the project.

* Make the key usable with:

```bash
openssl pkcs12 -in <name of your p12 key>.p12 -out secret_key.pem -nocerts -nodes
```

###API Documentation

The API proxy has two endpoints.

#### /data/api/specific/<slug>

This endpoint return data from a specific set of built-in queries which are stored in the analytics_urls.txt file.

#### /data/api/custom/

This endpoint allows the user to make custom queries. Queries must be formatted in the same way Google Analytics API queries are formatted.

Google Analytics API Query
```
https://www.googleapis.com/analytics/v3/data/ga?ids=ga:86930627&dimensions=ga:pagePath,ga:pageTitle&metrics=ga:sessions&start-date=2014-11-20&end-date=2014-11-30
```

Analytics Proxy Equivalent
```
<domain>/data/api/custom?ids=ga:86930627&dimensions=ga:pagePath,ga:pageTitle&metrics=ga:sessions&start-date=2014-11-20&end-date=2014-11-30
```

Custom queries are designed to be cached on an hourly basis. If a request for the same query is made more than once in an hour only the first request will update from Google Analytics the rest will be pulled from the cache.
