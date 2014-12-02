var mongoose = require('mongoose');
var Mixed = mongoose.Schema.Types.Mixed;

module.exports = {
  Specific: mongoose.model(
    'Specific', new mongoose.Schema({
      slug: { type: String, required: true, unique: true },
      apicall: { type: String, required: true, unique: true },
      data: { type: Mixed , required: false }
    })
  ),

  General: mongoose.model(
    'Public', new mongoose.Schema({
      slug: { type: String, required: true, unique: true },
      apicall: { type: String, required: true, unique: true },
      data: { type: Mixed , required: false }
    })
  )
};
