const {model, Schema, ObjectId} = require('mongoose')
const formatDate = require('../services/helpers/dateHelper')

const File = new Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
    size: {type: Number, default: 0},
    path: {type: String, default: ''},
    date: {type: String, default: ()=> formatDate(new Date())},
    user: {type: ObjectId, ref: 'User'},
    parent: {type: ObjectId, ref: 'File'},
    children: [{type: ObjectId, ref: 'File'}],
}, {collection: 'file'})
module.exports = model('File', File)
