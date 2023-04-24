const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    stopOrder: { type: Number, required: true },
    transportId: { type: Types.ObjectId, ref: 'Transport' },
    stopId: {type: Types.ObjectId, ref: 'Stop'}
});

module.exports = model('RouteStop', schema);