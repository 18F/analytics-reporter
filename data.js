// Auth to the API and fetch a batch of data.

var models = require('./models'),
    config = require('./config'),
    googleapis = require('googleapis'),
    ga = googleapis.analytics('v3')
    url = require('url');

var jwt = new googleapis.auth.JWT(
    config.email, 'secret_key.pem', null,
    ['https://www.googleapis.com/auth/analytics.readonly']
);

// constructs a query based on apicall url in the document
function construct_query(URL){
    var query = JSON
        .parse('{"' + decodeURI(url.parse(URL).search)
            .replace(/\?/g, '')
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g,'":"') + '"}'
        );
    query.auth = jwt;
    return query;
}

//loops through documents and updates them
module.exports = function() {
    models.General.find({}, function(err, docs) {
        jwt.authorize(function(err, result) {
            for (i = 0; i < docs.length; i++)
            {
                (function( doc ) {
                    var query = construct_query(doc.apicall);
                    ga.data.ga.get(query, function(err, res) {
                        console.log(doc.slug);
                        doc.data = res;
                        doc.save();
                    });
                }) (docs[i] );
            };
        });
    });
};

