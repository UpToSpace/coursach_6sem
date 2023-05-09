const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
});

module.exports = model('Stop', schema);