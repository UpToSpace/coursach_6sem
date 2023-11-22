const { Router } = require('express');
const config = require('config');
const Transport = require('../models/Transport');
const RouteStop = require('../models/RouteStop');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');
const router = Router();

// /api/transports
router.get('/', auth, async (req, res) => {
    try {
        if (!req.query.type) {
            const transports = await Transport.find({}).populate({
                path: 'routeStops',
                populate: {
                    path: 'stopId',
                    model: 'Stop'
                }
            });
            res.json(transports);
        } else {
            //console.log(req.query.type, req.query.number)
            const transport = await Transport.findOne({ type: req.query.type, number: req.query.number });
            res.json(transport);
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/transport, попробуйте снова' });
    }
});

// /api/transports/:stopId
router.get('/:stopId', auth, async (req, res) => {
    try {
        const StopRouteStops = await RouteStop.find({ stopId: req.params.stopId });
        const transports = await Transport.find({ routeStops: { $in: StopRouteStops.map((item) => item._id) } }).populate({
            path: 'routeStops',
            populate: {
                path: 'stopId',
                model: 'Stop'
            }
        });
        res.json(transports);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/transport/:id, попробуйте снова' });
    }
});

// /api/transports
router.post('/', admin, async (req, res) => {
    try {
        //console.log(req.body)
        const transportType = req.body.transport.transportType;
        const number = req.body.transport.number;
        const transport = new Transport({type: transportType, number: number});
        await transport.save();
        res.status(201).json({transport});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Что-то пошло не так transport.routes.js /api/transport POST'});
    }
});

module.exports = router;