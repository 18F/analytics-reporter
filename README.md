#Note
This project is still under construction. This is still just a skeleton.

## Analytics Proxy (Nodejs)

Analytics Proxy allows you to publicly share Google Analytics reporting data. It was partially inspired by [Google Analytics superProxy](https://github.com/googleanalytics/google-analytics-super-proxy); however, unlike [Google Analytics superProxy](https://github.com/googleanalytics/google-analytics-super-proxy) it doesn’t need to be deployed on [Google App Engine](https://appengine.google.com/)


###Requirements
- Nodejs
- Express
- Mongodb
- A Google API service account with access to Google Analytics

####Google Analytics Service Account
1. [Create Google API service account and take not of the client email](https://developers.google.com/accounts/docs/OAuth2ServiceAccount).
2.  Download the P12 private key file and place it in the app dir
3. Run the code below to make the key usable.
```bash
openssl pkcs12 -in <name of your p12 key>.p12 -out secret_key.pem -nocerts -nodes
```
