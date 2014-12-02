// Auth to the API and fetch a batch of data.

var models = require('./models'),
    config = require('/config'),
    googleapis = require('googleapis'),
    ga = googleapis.analytics('v3');

var jwt = new googleapis.auth.JWT(
    config.email, 'secret_key.pem', null,
    ['https://www.googleapis.com/auth/analytics.readonly']
);

module.exports = function() {
    General.findOne({slug: "test1" }, function (err, doc) {
        jwt.authorize(function(err, result) {
            ga.data.ga.get({
                'auth': jwt,
                "ids": "ga:86930627",
                "start-date": '2013-01-01',
                "end-date": '2014-09-01',
                "metrics": "ga:visits"
            }, function(err, res) {
                console.log('The answer to life, the universe, and everything!');
                console.log(res);
                // doc.data = res;
                // doc.save();
            });
        });
    });
};
