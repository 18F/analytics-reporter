// All routes for the app.

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

module.exports = function(app, models) {

  app.get('/data/api/general/', function(req, res) {
    res.send("API general!");
  });

  app.get('/data/api/specific/', function(req, res) {
    res.send("API specific!");
  });

  app.get('/data/api/:kind/:slug', function (req, res) {
    models.Analytics.findOne(
        { slug: req.params.slug,
          kind: req.params.kind
        }, function (err, doc) {
          var current_time = (new Date()).getTime();

          if(current_time - doc.update_interval > doc.last_update){
            console.log("update");
            jwt.authorize(function(err, result) {
                var query = construct_query(doc.apicall);
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
    });
  });

};
