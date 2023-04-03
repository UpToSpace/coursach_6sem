const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    type: { type: String, required: true },
    transport: { type: String, required: true },
    duration: { type: Number, required: true },
    tripCount: { type: Number, required: true },
    price: { type: Number, required: true }
});

module.exports = model('TicketType', schema); 