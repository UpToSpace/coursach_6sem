const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    arrivalTime: { type: Date, required: true },
    routeStopId: { type: Types.ObjectId, ref: 'RouteStop' }
});

module.exports = model('Schedule', schema);