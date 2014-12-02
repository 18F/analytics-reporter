var General = require('./../models/general');

module.exports = function(app) {

  app.get('/data/api/general/', function(req, res) {
    res.send("API general!");
  });

  app.get('/data/api/general/:slug', function (req, res) {
    if (!req.params.slug) return res.status(400);

    General.find({ slug: req.params.slug }, function (err, docs) {
      res.json(docs);
    });
  });

};
