const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
    refreshToken: { type: String, required: true },
});

module.exports = model('User', schema);