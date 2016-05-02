var _ = require('lodash');
var config = require('../config');
var availableDBDrivers = ['mongodb', 'rethinkdb'];
var defaultDriver = './' + config.db.driver + '_driver';
var supportedDrivers = ['rethinkdb','mongodb'];

/**
* Module to handle all RethikDB interaction.
*/
module.exports = {

    /**
    * @var String driver_name Private
    */
    driver_name: config.db.driver || 'rethinkdb',

    /**
    * @var Mixed driver Private
    */
    driver: require(defaultDriver) || require('./rethinkdb_driver'),

    /**
    * getDriver()
    *
    * @return String
    */
    getDriver: function() {
        return this.driver;
    },

    /**
    * setDriver(driver)
    *
    * Set's the which DB to use for the application.
    *
    * @param String driver
    *
    */
    setDriver: function(driver) {
        if(supportedDrivers.indexOf(driver) > -1) {
            this.driver = require('./' + driver + '_driver');
        } else {
            throw "Unsupported Database."; 
        }
    },

    /**
    * closeConnection()
    *
    * Closes a DB connection.
    *
    */
    closeConnection: function() {
        this.driver.closeConnection();
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
        return this.driver.get(res, report, queryParams);
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
        return this.driver.save(report, result);
    },

    /**
    * setupDB(db_name, db_host, db_port)
    *
    * @param String db_name 
    * @param String db_host
    * @param String db_port
    *
    */
    setupDB: function(db_name, db_host, db_port, db_driver) {
        // Set Driver if supplied.
        if(db_driver) this.setDriver(db_driver);

        this.driver.setupDB(db_name, db_host, db_port);
    },

    /**
    * setupTable()
    * Set's up DB table according to info provided by config.js, and returns promise.
    *
    * @return Promise
    */
    setupTable: function() {
        return this.driver.setupTable();
    }
};

