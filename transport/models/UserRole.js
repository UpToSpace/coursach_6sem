const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    name: { type: String, required: true },
    //tickets: {type: Types.ObjectId, ref: 'Ticket'}
});

module.exports = model('UserRole', schema);