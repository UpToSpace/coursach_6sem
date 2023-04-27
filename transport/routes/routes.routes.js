const { Router } = require('express');
const config = require('config');
const Stop = require('../models/Stop');
const Schedule = require('../models/Schedule');
const RouteStop = require('../models/RouteStop');
const Transport = require('../models/Transport');
const auth = require('../middleware/auth.middleware');
const router = Router();

// //api/routes
// router.get('/', auth, async (req, res) => {
//     try {
//         const stops = await Stop.find({});
//         res.json(stops);
//     } catch (e) {
//         console.log(e);
//         res.status(500).json({message: 'Что-то пошло не так /api/stops stops.routes.js, попробуйте снова'});
//     }
// });

//api/routes
router.post('/', auth, async (req, res) => {
    try {
        const { stops, transport } = req.body;
        //console.log({ stops, transport });
        stops.forEach(async (stop, i) => {
            const routeStop = new RouteStop({ stopOrder: i, transportId: transport._id, stopId: stop._id });
            console.log({ routeStop })
            await routeStop.save();
        });
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
        res.status(201).json({ message: 'Маршрут удален' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/stops stops.routes.js, попробуйте снова' });
    }
});


module.exports = router;