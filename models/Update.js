const mongoose = require('mongoose');
const UpdateFileSchema = require('./UpdateFile');

const UpdateSchema = new mongoose.Schema({
    url: {type: String},
    name: {type: String},
    notes: {type: String, default: ""},
    major: {type: Number},
    minor: {type: Number},
    patch: {type: Number},
    pubDate: {type: Date, default: Date.now()},
    platform: {type: String},
    arch: {type: String},
    forId: {type: String},
    hash: {type: String},
    size: {type: Number},
    files: [UpdateFileSchema]
});

mongoose.model('Update', UpdateSchema);