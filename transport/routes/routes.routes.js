const { Router } = require('express');
const config = require('config');
const Stop = require('../models/Stop');
const Schedule = require('../models/Schedule');
const RouteStop = require('../models/RouteStop');
const Transport = require('../models/Transport');
const auth = require('../middleware/auth.middleware');
const router = Router();

// /api/routes
router.get('/', auth, async (req, res) => {
    try {
        if (req.query.type && req.query.number) {
            const transportId = await Transport.findOne({ type: req.query.type, number: req.query.number });
            const routeStops = await RouteStop.find({ transportId })
                .populate({
                    path: 'stopId',
                    model: 'Stop'
                })
                .populate({
                    path: 'transportId',
                    model: 'Transport'
                });
            res.json(routeStops);
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/routes, попробуйте снова' });
    }
});

//api/routes
router.post('/', auth, async (req, res) => {
    try {
        const { stops, transport } = req.body;
        console.log(req.body);
        // console.log(transport);
        const routeStops = [];
        for (let i = 0; i < stops.length; i++) {
            const routeStop = new RouteStop({ stopOrder: i, transportId: transport._id, stopId: stops[i]._id });
            await routeStop.save();
            routeStops.push(routeStop);
        }
        console.log(routeStops)
        const transportDB = await Transport.findOne({ _id: transport._id });
        transportDB.routeStops = routeStops;
        await transportDB.save();
        console.log(transportDB);
        res.status(201).json({ message: 'Маршрут создан' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/stops stops.routes.js, попробуйте снова' });
    }
});

router.delete('/', auth, async (req, res) => {
    try {
        const { transport } = req.body;
        console.log({ transport });
        await RouteStop.deleteMany({ transportId: transport._id });
        await Transport.deleteOne({ _id: transport._id });
        res.status(201).json({ message: 'Маршрут удален' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/stops stops.routes.js, попробуйте снова' });
    }
});


module.exports = router;