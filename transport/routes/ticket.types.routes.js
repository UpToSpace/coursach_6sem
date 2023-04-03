const {Router} = require('express');
const config = require('config');
const TicketType = require('../models/TicketType');
const auth = require('../middleware/auth.middleware');
const router = Router();

// /api/ticket/types
router.get('/', auth, async (req, res) => {
    try {
        const ticketTypes = await TicketType.find();
        //console.log(ticketTypes);
        res.json(ticketTypes);
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так ticket.types.routes.js, попробуйте снова'});
    }
}); 

module.exports = router;