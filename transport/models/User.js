const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    //tickets: {type: Types.ObjectId, ref: 'Ticket'}
});

module.exports = model('User', schema);