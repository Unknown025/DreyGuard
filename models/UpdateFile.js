const mongoose = require('mongoose');

const UpdateFileSchema = new mongoose.Schema({
    downloads: {type: Number, default: 0},
    hash: {type: String},
    size: {type: Number},
    filename: {type: String}
});

mongoose.model('UpdateFile', UpdateFileSchema);