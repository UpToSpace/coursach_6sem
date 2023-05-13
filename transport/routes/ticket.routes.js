const {Router} = require('express');
const config = require('config');
const Ticket = require('../models/Ticket');
const User = require('../models/User')
const auth = require('../middleware/auth.middleware');
const router = Router();
const jwt = require("jsonwebtoken")

// /api/tickets
router.get('/', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.get('jwtAccessSecret'));
        const tickets = await Ticket.find({ owner: decoded.id }).populate('ticketType');
        res.json(tickets);
    } catch (e) {
        console.log(e);
        if (e instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: e.message });
        }
        res.status(500).json({message: 'Что-то пошло не так /api/ticket ticket.routes.js, попробуйте снова'});
    }
});

// /api/tickets/:id

router.get('/:id', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('ticketType');
        res.json(ticket);
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так ticket.routes.js /api/ticket/:id'});
    }
});

// /api/tickets
router.post('/', auth, async (req, res) => {
    try {
        const ticket = new Ticket({...req.body});
        await ticket.save();
        res.status(201).json({ticket});
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так ticket.routes.js /api/ticket POST'});
    }
});

module.exports = router;