var googleapis = require('googleapis');

// TODO: read in from a config file.
var SERVICE_ACCOUNT_EMAIL = '556009582678-d1er91t08n95fg8ldvaojdric02pqd8u@developer.gserviceaccount.com';
var SERVICE_ACCOUNT_KEY_FILE = 'secret_key.pem';

module.exports = new googleapis.auth.JWT(
  SERVICE_ACCOUNT_EMAIL,
  SERVICE_ACCOUNT_KEY_FILE,
  null,
  ['https://www.googleapis.com/auth/analytics.readonly']
);
