var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

//Database
var General = require('./../models/general')

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/:slug', function (req, res) {
    if (req.params.slug) {
        General.find({ slug: req.params.slug }, function (err, docs) {
            res.json(docs);
        });
    }
});

module.exports = router;
