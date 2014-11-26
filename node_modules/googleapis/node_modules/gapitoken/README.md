node-gapitoken
==============

Node.js module for Google API service account authorization (Server to Server flow). 

Installation
------------

	npm install gapitoken
	
Usage
-----

    var GAPI = require('gapitoken');
 
    var gapi = new GAPI({
        iss: 'service account email address from Google API console',
        scope: 'space delimited list of requested scopes',
        keyFile: 'path to private_key.pem'
    }, function(err) {
       if (err) { return console.log(err); }
 
       gapi.getToken(function(err, token) {
           if (err) { return console.log(err); }
           console.log(token);
       });     
    });

Another option is to pass the private key as a string

    var key = "-----BEGIN RSA PRIVATE KEY-----\n\
    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\
    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\
    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\
    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\
    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\
    XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\
    -----END RSA PRIVATE KEY-----";

    var gapi = new GAPI({
        iss: 'service account email address from Google API console',
        scope: 'space delimited list of requested scopes',
        key: key
    }, function() {
       gapi.getToken(function(err, token) {
           if (err) { return console.log(err); }
           console.log(token);
       });     
    });

    
* for using node-gapitoken to access Google Cloud Storage see https://github.com/bsphere/node-gcs

Creating a Private key file
---------------------------

1) Login to Google API Console, and under "API Access" create a "service account" for your project.

2) Download the .p12 private key file

3) Convert the .p12 file to .pem: `openssl pkcs12 -in key.p12 -out key.pem -nocerts`

NOTE: You must set a passphrase for the .pem file

4) Remove the passphrase from the .pem file: `openssl rsa -in key.pem -out key.pem`