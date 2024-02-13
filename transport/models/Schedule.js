const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    scheduleNumber: { type: Number, required: true },
    arrivalTime: { type: String, required: true },
    routeStopId: { type: Types.ObjectId, ref: 'RouteStop', required: true},
    isWeekend: { type: Boolean, required: true },
});

module.exports = model('Schedule', schema);