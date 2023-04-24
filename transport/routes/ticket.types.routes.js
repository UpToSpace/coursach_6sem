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

// /api/tickets/types/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const ticketType = await TicketType.findById(req.params.id);
        res.json(ticketType);
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так /api/tickets/types, попробуйте снова'});
    }
}); 

// /api/tickets/types
router.post('/', auth, async (req, res) => {
    try {
        const {type, transport, tripCount, duration, price} = req.body;
        const ticketType = new TicketType({type, transport, tripCount: +tripCount, duration: +duration, price: +price});
        await ticketType.save();
        res.status(201).json({ticketType});
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так /api/tickets/types, попробуйте снова'});
    }
});

// /api/tickets/types/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const { duration, tripCount, price } = req.body;
        const ticketType = await TicketType.findById(req.params.id);
        console.log(ticketType);
        ticketType.duration = duration;
        ticketType.tripCount = tripCount;
        ticketType.price = price;
        console.log(ticketType);
        await ticketType.save();
        res.json({ticketType});
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так /api/tickets/types/:id, попробуйте снова'});
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        TicketType.findByIdAndRemove(req.params.id).exec();
        res.json({message: 'Тип билета удален'});
    } catch (e) {
        res.status(500).json({message: 'Что-то пошло не так ticket.types.routes.js, попробуйте снова'});
    }
});

module.exports = router;