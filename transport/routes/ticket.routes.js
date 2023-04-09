const {Router} = require('express');
const config = require('config');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth.middleware');
const router = Router();

// /api/ticket
router.get('/', auth, async (req, res) => {
    try {
        const tickets = await Ticket.find({ owner: req.user.userId });
        res.json(tickets);
    } catch (e) {
        console.log(e);
        res.status(500).json({message: 'Что-то пошло не так /api/ticket ticket.routes.js, попробуйте снова'});
    }
});

// /api/ticket/:id

router.get('/:id', auth, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        res.json(ticket);
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так ticket.routes.js /api/ticket/:id'});
    }
});

// /api/ticket
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