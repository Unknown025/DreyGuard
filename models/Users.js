const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const uniqueValidator = require('mongoose-unique-validator');

const UsersSchema = new mongoose.Schema({
    email: {type: String, unique: true, match: [/\S+@\S+\.\S+/, 'is invalid'], index: true, required: true},
    username: {type: String, unique: true, index: true, required: true},
    password: {type: String, required: true},
    created: {type: Date, default: Date.now()}
});

UsersSchema.methods.generateJWT = function() {
    return jwt.sign({
        username: this.username,
        id: this._id,
        email: this.email,
    }, process.env.JWT_SECRET || 'secret', {expiresIn: '1d'});
};

UsersSchema.methods.toAuthJSON = function() {
    return {
        _id: this._id,
        username: this.username,
        token: this.generateJWT(),
    };
};

UsersSchema.plugin(uniqueValidator, {message: 'is already taken.'});

mongoose.model('Users', UsersSchema);