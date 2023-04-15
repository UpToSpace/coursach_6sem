const {Router} = require('express');
const config = require('config');
const TicketType = require('../models/TicketType');
const auth = require('../middleware/auth.middleware');
const router = Router();

// /api/tickets/types
router.get('/', auth, async (req, res) => {
    try {
        const ticketTypes = await TicketType.find();
        //console.log(ticketTypes);
        res.json(ticketTypes);
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так ticket.types.routes.js, попробуйте снова'});
    }
}); 

// /api/tickets/types
router.post('/', auth, async (req, res) => {
    try {
        const {name, price, description} = req.body;
        const ticketType = new TicketType({name, price, description});
        await ticketType.save();
        res.status(201).json({ticketType});
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так ticket.types.routes.js, попробуйте снова'});
    }
});

module.exports = router;