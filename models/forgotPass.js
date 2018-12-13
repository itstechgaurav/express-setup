let mongoose = require("../db/db");

let schema = new mongoose.Schema({
     user_id: {
          type: String,
          required: true
     }

});

let Reset = mongoose.model("ResetPass", schema);

module.exports = {Reset}
