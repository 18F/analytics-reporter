var models = require('./models'),
    Analytics = require("../analytics"),
    config = require("../config"),
    fs = require("fs")

module.exports = {
    get_or_update: function(err, res, doc) {
        if (doc){
            var current_time = (new Date()).getTime();
            // If the doc needs to be updated
            if (current_time - doc.update_interval > doc.last_update) {
                console.log("updated @ " + doc.last_update);
                Analytics.query(doc, function(err, data) {
                    doc.data = {'data': data['data'],
                                'totals': data['totals']};
                    doc.last_update = current_time;
                    doc.save();
                    res.json(doc.data);
                });
            }
            // Update if it's time
            else {
                console.log('not updated')
                res.json(doc.data);
            }
        }
        // If it doesn't exist
        else{
            console.log("couldn't find anything");
            res.status(404).json("The endpoint you attempted to reach does not exist, try a different API call.");
        }

    }
};
