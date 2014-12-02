var Specific = require('./../models/specific');

module.exports = function(app) {

  app.get('/data/api/specific/', function(req, res) {
    res.send("API specific!");
  });

  app.get('/data/api/specific/:slug', function (req, res) {
    if (!req.params.slug) return res.status(400);

    Specific.find({ slug: req.params.slug }, function (err, docs) {
      res.json(docs);
    });
  });

};
