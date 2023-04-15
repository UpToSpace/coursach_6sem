const {Router} = require('express');
const config = require('config');
const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');
const auth = require('../middleware/auth.middleware');
const router = Router();

// /api/tickets
router.get('/', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ owner: req.user.userId }).populate('ticketType');
        res.json(tickets);
    } catch (e) {
        console.log(e);
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