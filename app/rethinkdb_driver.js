var _ = require('lodash');
var config = require('../config');
var r = require('rethinkdb');

/**
* Module to handle all RethikDB interaction.
*/
module.exports = {

    closeConnection: function() {
      // RethinkDB connections are closed as used. No need to close anything.
      return;
    },

    /**
    * query(callback)
    * 
    * @param Function callback
    */
    query: function(callback, driver) {

        return r.connect({host: config.db.host, port: config.db.port}, callback);
    },

    /**
    * get(res, reportName, queryParams)
    *
    * Fetches report from db.
    *
    * @param Object res - Response object.
    * @param String report - Report name
    * @param Object queryParams - Query parameters.
    * @return rethinkdb Promise
    */
    get: function(res, report, queryParams) {

        var agencyName = config.db.table;
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

        return this.query(function(err, conn) {
                r.db(config.db.name).table(agencyName)
                     .get(report)('data')
                     .hasFields(['date'])
                     // If the data has dates, filter by date. 
                     // Otherwise, return unfiltered result.
                     .do(function(data){
                        return r.branch(
                                  data.isEmpty(),
                                  r.table(agencyName).get(report)('data'),
                                  data.filter(function(dataItem){
                                    return dataItem('date').during(startDate, endDate) 
                                  })
                                )
                    })
                    .run(conn, function(err, cursor){
                      if (err) {
                        res.status(500);
                        res.send({'error':'500', 'status':'Error accessing database.'});
                        throw err;
                      }

                      cursor.toArray(function(err, result) {
                          if (err) throw err;
                          results = JSON.stringify(result, null, 2);
                          res.send(results);
                      });
                    });
            });
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

        this.query(function(err, conn) {
            if(err) throw err;

            r.table(agencyName)
             // Insert default row if it does not exist.
             .insert({ 'id':report.name, 'data':[] })
             .run(conn)
             .then(function() {
                // Get existing data.
                r.table(agencyName)
                 .get(report.name)
                 .run(conn)
                 .then(function(cursor) {
                        return cursor;
                 })
                 // Merge Existing data with new data.
                 .then(function(res) {

                    // subdoc is read into memory, and merged with new data.
                    var reportData = res.data;
                    var mergedData = result.data;

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

                    // Update data for report.
                    r.table(agencyName)
                     .get(report.name)
                     .update({
                        data: mergedData
                     })
                     .run(conn, function(err, res) {
                        if(err) throw err;
                        // Wrap things up.
                        conn.close();
                     });

                });
            });
        });
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

        // Create a DB.
        this.query(function(err, conn) {
          if(err) {
            console.log("Issue connecting to RethinkDB on HOST: " + db_host + " | PORT: " + db_port);
            throw err;
          }
          r.dbCreate(db_name).run(conn, function(){
            console.log('RethinkDB Database: ' + options.db_name + " Created!");
            conn.close();
          });

        });
    },

    /**
    * setupTable()
    * Set's up DB table according to info provided by config.js, and returns promise.
    *
    * @return Promise
    */
    setupTable: function() {

        var agencyName = config.db.table;
        return this.query( 
            function(err, conn) {
                if(err) throw err;
                // Create DB Table if it does not exist.
                // Then, run Reports, store the data, and close any connections.
                r.db(config.db.name)
                 .tableList()
                 .contains(agencyName)
                 .do(function(tableExists){
                  return r.branch(
                    tableExists,
                    null,
                    r.tableCreate(agencyName)
                  );
                 })
                 .run(conn)
                 .then(function(){
                  conn.close();
                });
        });
    }
};