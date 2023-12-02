const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    transportId: { type: Types.ObjectId, ref: 'Transport' },
    userId: { type: Types.ObjectId, ref: 'User' }
});

module.exports = model('Favourite', schema);