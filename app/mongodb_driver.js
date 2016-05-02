var _ = require('lodash');
var config = require('../config');
var m = require('mongodb').MongoClient;
var Q = require('q');

if(config.db.username.length > 0 && config.db.password.length > 0) {
  var dburl = 'mongodb://' +
              config.db.username +':'+
              config.db.password + '@' +
              config.db.host + ':' + 
              config.db.port + '/' +
              config.db.table;
} else {
  var dburl = 'mongodb://' +
              config.db.host + ':' + 
              config.db.port + '/' +
              config.db.table;
}

/**
* Module to handle all MongoDB interaction.
*/
module.exports = {

    /**
    * @var connection Private
    */
    connection: m.connect(dburl),

    /**
    * closeConnection()
    *
    * Closes MongoDB connection.
    *
    */
    closeConnection: function() {
      return this.connection.then(function(db){
        db.close();
      });
    },

    /**
    * query(callback)
    * 
    * @param Function callback
    */
    query: function(callback) {

        return this.connection.then(callback);
        
    },

    /**
    * getConnection()
    *
    * @return Mixed MongoDB connection.
    *
    */
    getConnection: function() {
        return this.connection;
    },

    /**
    * get(res, reportName, queryParams)
    *
    * Fetches report from db.
    *
    * @param Object res - Response object.
    * @param String report - Report name
    * @param Object queryParams - Query parameters.
    * @return Promise
    */
    get: function(res, report, queryParams) {

      var agencyName = config.db.table;
      var results, collection, exists, filterQuery;

      // Format:  YYYY-MM-DD
      if(queryParams.start_date) {
        startDate = new Date(queryParams.start_date);
      } else {
        startDate = new Date();
        // Default date CurrentDate - 1 year.
        startDate.setMonth(startDate.getMonth() - 12);
      }
      
      // Default End Date = Today.
      endDate = (queryParams.end_date) ? new Date(queryParams.end_date) : new Date();

      filterQuery = [{ "$match": {_id: report}},
            { "$unwind": '$data'},
            { "$match": {'data.date': {"$gt": startDate}}},
            { "$match": {'data.date': {"$lt": endDate}}},
            { "$group": {_id: '$_id', data: {"$push": '$data'}}}];

      // If the data field contains no dates, return early.
      this.query(function(db) {
        collection = db.collection(agencyName);
        exists = collection.findOne({_id:report}, function(err, doc) {

           try{
            if(doc.data.length > 0) {
              if(!doc.data[0].hasOwnProperty('date')) {
                results = JSON.stringify(doc, null, 2);
                res.send(results);
              } else {
                console.log("shit");
                // Else, filter with dates.
                collection = db.collection(agencyName);

                collection.aggregate(filterQuery, function(err, nextDoc) {

                    if (err) {
                      res.status(500);
                      res.send({'error':'500', 'status':'Error accessing database.'});
                      throw err;
                    }
                    
                    results = JSON.stringify(nextDoc, null, 2);
                    res.send(results);
                });
                
              }
            }
          } catch(e) {
            res.status(500);
            res.send({'error':'500', 'status':'Error accessing database.'});
          }
          
        });
      });
      
      return;
    },

    /**
    * save(report, result)
    * 
    * Saves a report to the Table specified in the config.
    * 
    * @param Object report - Report object containing metadata about report.
    * @param Object result - GA API result from report.
    */
    save: function(report, result) {

        var agencyName = config.db.table;
        var deferred = Q.defer();

        this.query(function(db) { 

          var collection = db.collection(agencyName);

          var cursor = collection.findOne({_id: report.name}, function(err, doc) {
              var mergedData = result.data;

              //assert.equal(err, null);
              if (doc != null) {
                console.log(doc.data);
                // Update doc.
                var reportData = doc.data;
                

                if(typeof(report.query.dimensions) != "undefined") {
                  // If the data is datestamped, merge. Otherwise, replace.
                  if(report.query.dimensions.indexOf("ga:date") != -1) {
                      
                      mergedData = _(result.data)
                                      .merge(reportData) // Merge new data in.
                                      .map(function(d){
                                          // Convert Datestrings, into dates
                                          d.date = new Date(d.date);
                                          return d;
                                      }).value();
                  }
                }

                collection.update({_id:doc._id}, {$set:{data:mergedData}}, 
                    function(err, result) {
                      deferred.resolve(true);
                });

              } else {
                mergedData = _(result.data)
                                      .map(function(d){
                                          // Convert Datestrings, into dates
                                          d.date = new Date(d.date);
                                          return d;
                                      }).value();

                // Insert Default Row.
                collection.insert({ _id: report.name, data: mergedData}, function(err, result){
                  deferred.resolve(true);
                });
                
              }

                
          });
          deferred.resolve(true);

        });

        return deferred.promise;
    },

    /**
    * setupDB(db_name, db_host, db_port)
    *
    * @param String db_name 
    * @param String db_host
    * @param String db_port
    *
    */
    setupDB: function(db_name, db_host, db_port) {
      console.log("Unsupported for MongoDB.");
      console.log("MongoDB Databases are initialized upon first collection creation.");
      return;
    },

    /**
    * setupTable()
    * Set's up DB table according to info provided by config.js, and returns promise.
    *
    * @return Promise
    */
    setupTable: function() {

      var agencyName = config.db.table;
      var deferred = Q.defer();

      this.query(function(db) {

        db.listCollections({name: agencyName})
        .next(function(err, collinfo) {

            if (collinfo) {
              // Exists. Save reports.
              deferred.resolve(true);
            } else {
              // DNE.
              //create collection
              db.createCollection(agencyName, function(err, collection){
                 if (err) deferred.reject(err);

                 deferred.resolve(true);
              });
              
            }
          });
        });

        return deferred.promise;
    }
};