const { Router } = require('express');
const config = require('config');
const Transport = require('../models/Transport');
const RouteStop = require('../models/RouteStop');
const Schedule = require('../models/Schedule');
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
        const schedule = await Schedule.find({ routeStopId: { $in: StopRouteStops.map((item) => item._id) } });
        //console.log(schedule.length)
        const transports = await Transport.find({ routeStops: { $in: StopRouteStops.map((item) => item._id) } }).populate({
            path: 'routeStops',
            populate: {
                path: 'stopId',
                model: 'Stop'
            }
        }).lean();
        const data = transports.map((transport) => {
            // Map over the routeStops and find the corresponding schedules
            const updatedRouteStops = transport.routeStops.map((routeStop) => {
                const routeStopIdString = routeStop._id.toString();

                // Filter the schedule for the current routeStop
                const routeStopSchedule = schedule.filter(
                    (item) => item.routeStopId.toString() === routeStopIdString
                );

                return { ...routeStop, schedule: routeStopSchedule };
            });
            
            return {
                ...transport,
                routeStops: updatedRouteStops,
            };
        });
        res.json(data);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/transport/:stopId, попробуйте снова' });
    }
});

// /api/transports/types/:type
router.get('/types/:type', auth, async (req, res) => {
    try {
        const numbers = await Transport.find({ type: decodeURI(req.params.type) }, { number: 1, _id: 0 });
        //console.log(numbers)
        res.json(numbers);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/transport/:type, попробуйте снова' });
    }
});

// /api/transports
router.post('/', admin, async (req, res) => {
    try {
        //console.log(req.body)
        const transportType = req.body.transport.transportType;
        const number = req.body.transport.number;
        const transport = new Transport({ type: transportType, number: number });
        await transport.save();
        res.status(201).json({ transport });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так transport.routes.js /api/transport POST' });
    }
});

module.exports = router;