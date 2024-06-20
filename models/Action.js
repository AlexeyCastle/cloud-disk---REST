const {Schema, model, ObjectId} = require("mongoose")


const Action = new Schema({
    name: {type: String, required: true},
}, {collection: 'action'})


module.exports = model('Action', Action)
