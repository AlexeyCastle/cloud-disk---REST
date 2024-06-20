const {Schema, model, ObjectId} = require("mongoose")
const formatDate = require("../services/helpers/dateHelper");

const Log = new Schema({
    description:{type:String,required:true},
    timestamp:{type: String, default: ()=> formatDate(new Date())},
    action:{type: ObjectId, ref: 'Action'},
    user: {type: ObjectId, ref: 'User'}
}, {collection: 'log'})

module.exports = model('Log', Log)
