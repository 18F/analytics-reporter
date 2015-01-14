var models = require('./models'),
    Analytics = require("../analytics"),
    config = require("../config"),
    fs = require("fs")

var report = Analytics.reports['devices'];

module.exports = {
    get_or_update: function(err, res, doc) {
        if (doc){
            var current_time = (new Date()).getTime();
            // If the doc needs to be updated
            if (current_time - doc.update_interval > doc.last_update) {
                Analytics.query(doc, function(err, data) {
                    doc.data = data;
                    doc.last_update = current_time;
                    console.log("update:" + doc.last_update);
                    doc.save();
                    res.json(doc.data);
                });
            }
            // If it already exists and doesn't need to be updated
            else {
                console.log('leave it')
                res.json(doc.data);
            }
        }
        // If it doesn't exist
        else{
            res.status(404).json("The endpoint you attempted to reach does not exist, try a different API call.");
        }

    }
};
