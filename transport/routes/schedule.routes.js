const { Router } = require('express');
const config = require('config');
const Transport = require('../models/Transport');
const Schedule = require('../models/Schedule');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');
const router = Router();

// /api/schedule
router.get('/', auth, async (req, res) => {
    try {
        if (req.query.type && req.query.number) {
            const scheduleDB = await Schedule.find({}).populate({
                path: 'routeStopId',
                populate: {
                    path: 'stopId',
                    model: 'Stop'
                },
                populate: {
                    path: 'transportId',
                    model: 'Transport',
                    match: { type: req.query.type, number: req.query.number }
                }
            })
            const schedule = scheduleDB.filter(e => e.routeStopId.transportId !== null);
            res.json(schedule);
        } else {
            const schedule = await Schedule.find({}).populate({
                path: 'routeStopId',
                populate: {
                    path: 'stopId',
                    model: 'Stop',
                    populate: {
                        path: 'transportId',
                        model: 'Transport'
                    }
                },
            });
            res.json(schedule);
        }
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/schedule, попробуйте снова' });
    }
});

// /api/schedule
router.post('/', admin, async (req, res) => {
    try {
        const { schedule, scheduleNumber } = req.body;
        schedule.map(async (item) => {
            const { arrivalTime, routeStopId } = item;
            const newSchedule = new Schedule({ scheduleNumber, arrivalTime, routeStopId });
            await newSchedule.save(); 
        });
        res.status(201).json({ message: 'Расписание создано' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/schedule, попробуйте снова' });
    }
});

// TODO: /api/schedule - update

// /api/schedule
router.delete('/', admin, async (req, res) => {
    try {
        const { scheduleNumber, routeStops } = req.body;
        routeStops.map(async (item) => {
            const { _id } = item;
            await Schedule.deleteMany({ scheduleNumber, routeStopId: _id });
        });
        res.status(201).json({ message: 'Расписание удалено' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/schedule, попробуйте снова' });
    }
});

module.exports = router;