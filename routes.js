// All routes for the app.

module.exports = function(app, models) {

  app.get('/data/api/general/', function(req, res) {
    res.send("API general!");
  });

  app.get('/data/api/general/:slug', function (req, res) {
    models.General.find({ slug: req.params.slug }, function (err, docs) {
      res.json(docs);
    });
  });

  app.get('/data/api/specific/', function(req, res) {
    res.send("API specific!");
  });

  app.get('/data/api/specific/:slug', function (req, res) {
    models.Specific.find({ slug: req.params.slug }, function (err, docs) {
      res.json(docs);
    });
  });

};
