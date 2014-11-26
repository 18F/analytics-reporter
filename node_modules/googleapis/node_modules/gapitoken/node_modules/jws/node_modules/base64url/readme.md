# base64url  [![Build Status](https://secure.travis-ci.org/brianloveswords/base64url.png)](http://travis-ci.org/brianloveswords/base64url)

For turning strings or buffers into [base64url](http://en.wikipedia.org/wiki/Base64#RFC_4648) encoded strings. It can also convert base64url to regular base64.

# install

```js
$ npm install base64url
```

# example
```js
const base64url = require('base64url');
const data = "I am a teapot hear me roar";
const encoded = base64url(data);

// convert from base64url to regular ol' base64
const b64 = base64url.toBase64(encoded);

// convert from base64 to base64url
const b64url = base64url.fromBase64(b64)

// decode base64url
data === base64url.decode(encoded);
```
