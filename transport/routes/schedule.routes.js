const { Router } = require('express');
const config = require('config');
const Transport = require('../models/Transport');
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth.middleware');
const router = Router();

// /api/schedule
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
            const schedule = await Schedule.find({}).populate({
                path: 'routeStopId',
                populate: {
                    path: 'stopId',
                    model: 'Stop',
                },
                populate: {
                    path: 'transportId',
                    model: 'Transport',
                    match: { type: req.query.type, number: req.query.number }
                }
            });
            res.json(schedule);
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/schedule, попробуйте снова' });
    }
});

// /api/schedule
router.post('/', auth, async (req, res) => {
    try {
        const { scheduleNumber, arrivalTime, routeStopId } = req.body;
        const schedule = new Schedule({ scheduleNumber, arrivalTime, routeStopId });
        await schedule.save();
        res.status(201).json({ message: 'Расписание создано' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/schedule, попробуйте снова' });
    }
});

module.exports = router;