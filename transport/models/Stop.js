const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    routeStops: [{ type: Types.ObjectId, ref: 'RouteStop' }]
});

module.exports = model('Stop', schema);