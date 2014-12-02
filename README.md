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
