const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FreeSignupSchema = new Schema({
    email: {type: String, required: true, max: 100},
    
    name:{type:String,required:true},
    phone:{type:String,required:true},
    company:{type:String,required:true},
    companywebsite:{type:String,required:true},
    trackId:String,
    isVerified:Boolean,
    isEmailSent:Boolean
});
    

// Export the model
module.exports = mongoose.model('freesignup', FreeSignupSchema);