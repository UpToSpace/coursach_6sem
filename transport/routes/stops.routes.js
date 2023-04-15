const {Router} = require('express');
const config = require('config');
const Stop = require('../models/Stop');
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
        const stop = new Stop({name, latitude, longitude});
        await stop.save();
        res.status(201).json({stop});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Что-то пошло не так /api/stops stops.routes.js, попробуйте снова'});
    }
});


module.exports = router;