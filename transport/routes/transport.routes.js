const { Router } = require('express');
const config = require('config');
const Transport = require('../models/Transport');
const RouteStop = require('../models/RouteStop');
const Schedule = require('../models/Schedule');
const Stop = require('../models/Stop');
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
        const numbers = await Transport.find({ type: decodeURI(req.params.type) }, { number: 1, _id: 0 }, { sort: { number: 1 } });
        //console.log(numbers)
        res.json(numbers);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/transport/:type, попробуйте снова' });
    }
});

// /api/transports/routes/stops
router.get('/routes/stops', auth, async (req, res) => {
    try {
        const { startStop, endStop } = req.query;
        //console.log(startStop, endStop);
        const startStopDB = await Stop.find({ name: startStop }, { _id: 1 });
        const endStopDB = await Stop.find({ name: endStop }, { _id: 1 });
        //console.log(startStopDB, endStopDB);
        const startStopIds = startStopDB.map((item) => item._id);
        const endStopIds = endStopDB.map((item) => item._id);

        //console.log('start ' + startStopIds[0]);
        const routeStopsStart = await RouteStop.find({ stopId: { $in: startStopIds } });
        const routeStopsEnd = await RouteStop.find({ stopId: { $in: endStopIds } });
        // console.log(routeStopsStart);
        // console.log(routeStopsEnd);

        const matchingObjects = [];

        routeStopsStart.forEach(startObj => {
            const matchingEndObj = routeStopsEnd.find(endObj =>
                endObj.transportId.toString() === startObj.transportId.toString() &&
                endObj.stopOrder > startObj.stopOrder
            );

            if (matchingEndObj) {
                matchingObjects.push({ startObj, matchingEndObj });
            }
        });

        //console.log(matchingObjects);
        if (matchingObjects.length === 0) {
            return res.status(404).json({ message: 'Маршрут не найден' });
        }

        // find the transport with the closest arrival time

        // 1. get the schedules for the matching objects
        const scheduleStart = await Schedule.find({ routeStopId: { $in: matchingObjects.map((item) => item.startObj._id) } });
        const scheduleEnd = await Schedule.find({ routeStopId: { $in: matchingObjects.map((item) => item.matchingEndObj._id) } });
        

        const transport = await Transport.findOne({ _id: matchingObjects[0].startObj.transportId}).populate({
            path: 'routeStops',
            populate: {
                path: 'stopId',
                model: 'Stop'
            }
        }).lean();
        //console.log(transport)
        res.json(transport);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/transports/routes/stops, попробуйте снова' });
    }
}
);

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