const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    dateBegin: { type: Date, required: true },
    dateEnd: { type: Date, required: true },
    ticketType: { type: Types.ObjectId, ref: 'TicketType' },
    owner: {type: Types.ObjectId, ref: 'User'}
});

module.exports = model('Ticket', schema);