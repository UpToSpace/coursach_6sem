const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userRole: { type: Types.ObjectId, ref: 'UserRole' },
    //tickets: {type: Types.ObjectId, ref: 'Ticket'}
});

module.exports = model('User', schema);