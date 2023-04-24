const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    type: { type: String, required: true },
    number: { type: String, required: true },
    routeStops: [{ type: Types.ObjectId, ref: 'RouteStop' }]
});

module.exports = model('Transport', schema);