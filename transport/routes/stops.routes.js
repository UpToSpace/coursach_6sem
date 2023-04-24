const {Router} = require('express');
const config = require('config');
const Stop = require('../models/Stop');
const Schedule = require('../models/Schedule');
const RouteStop = require('../models/RouteStop');
const Transport = require('../models/Transport');
const auth = require('../middleware/auth.middleware');
const router = Router();

// //api/stops
router.get('/', auth, async (req, res) => {
    try {
        const stops = await Stop.find({});
        res.json(stops);
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Что-то пошло не так /api/stops stops.routes.js, попробуйте снова'});
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const {name, latitude, longitude} = req.body;
        console.log(name, latitude, longitude);
        const stop = new Stop({name, latitude: +latitude, longitude: +longitude});
        await stop.save();
        res.status(201).json({stop});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Что-то пошло не так /api/stops stops.routes.js, попробуйте снова'});
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const stop = Stop.find({ _id: req.params.id });
        res.json(stop);
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Что-то пошло не так /api/stops stops.routes.js, попробуйте снова'});
    }
});


module.exports = router;