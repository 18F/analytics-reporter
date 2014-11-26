var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var specificSchema = new Schema({
    slug: { type: String, required: true, unique: true },
    apicall: { type: String, required: true, unique: true },
    data: { required: false }
});

module.exports = mongoose.model('Specific', specificSchema);
