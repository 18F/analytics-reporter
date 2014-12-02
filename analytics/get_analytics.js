//api auth
function get_data() {
    //Database
    var General = require('./../models/general')
    //authentication
    var jwt = require('./jwt.js');
    //api
    var googleapis = require('googleapis');
    var ga = googleapis.analytics('v3');
    //call api and update
    General.findOne({ slug: "test1" }, function (err, doc) {

        jwt.authorize(function(err, result) {
            ga.data.ga.get({
                'auth': jwt,
                "ids": "ga:86930627",
                "start-date": '2013-01-01',
                "end-date": '2014-09-01',
                "metrics": "ga:visits"
            }, function(err, res) {
                console.log(res)
                doc.data = res;
                doc.save();
                });
            });
        });
};

module.exports = get_data


