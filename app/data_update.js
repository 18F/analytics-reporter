var models = require('./models'),
    Analytics = require("../analytics"),
    config = require("../config"),
    fs = require("fs");

module.exports = {
    get_or_update: function(err, res, doc) {
        if (doc){
            var current_time = (new Date()).getTime();
            // If the doc needs to be updated
            if (current_time - doc.update_interval > doc.last_update) {
                console.log("updated @ " + doc.last_update);
                Analytics.query(doc, function(err, data) {
                    // if the data returned isn't valid, abort and return null
                    if (data == null) {
                      return res.json(null);
                    }
                    // store the data returned in cache
                    doc.data = {'data': data['data'],
                                'totals': data['totals']};
                    doc.last_update = current_time;
                    models.data[doc.name] = doc;
                    res.json(doc.data);
                });
            }
            // Update if it's time
            else {
                res.json(doc.data);
            }
        }
        // If it doesn't exist
        else{
            res.status(404).json("The endpoint you attempted to reach does not exist, try a different API call.");
        }

    }
};
