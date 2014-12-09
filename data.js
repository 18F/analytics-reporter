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
function _construct_query(URL){
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

function _get_data(doc){
    var query = _construct_query(doc.apicall);
    ga.data.ga.get(query, function(err, res) {
        console.log(doc.slug);
        doc.data = res;
        doc.save();
    });
}


//loops through documents and updates them
module.exports = {

    update_general: function() {
        models.Analytics.find({kind: "general"}, function(err, docs) {
            jwt.authorize(function(err, result) {
                for (i = 0; i < docs.length; i++)
                {
                    (function( doc ) {
                        _get_data(doc);
                    }) (docs[i]);
                };
            });
        });
    },

    get_or_update: function(err, res, doc) {
          if (doc){
            var current_time = (new Date()).getTime();

            if(current_time - doc.update_interval > doc.last_update){
              console.log("update");
              jwt.authorize(function(err, result) {
                  var query = _construct_query(doc.apicall);
                  ga.data.ga.get(query, function(err, result) {
                      doc.data = result;
                      doc.last_update = current_time;
                      doc.save();
                      res.json(doc.data);
                  });
              });
            }
            else{
              console.log("leave it")
              res.json(doc.data);
            }
          } else {
            res.send("No Data")
          }

    }

};

