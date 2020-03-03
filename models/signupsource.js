const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SignupSourceSchema = new Schema({
    email: {type: String, required: true, max: 100},
    source: {type: String, required: true},
});
    

// Export the model
module.exports = mongoose.model('signupsource', SignupSourceSchema);