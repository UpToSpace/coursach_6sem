const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    routeStop: { type: Types.ObjectId, ref: 'RouteStop' },
    user: { type: Types.ObjectId, ref: 'User' }
});

module.exports = model('Favourite', schema);