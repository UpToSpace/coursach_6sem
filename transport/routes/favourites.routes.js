const { Router } = require('express');
const Favourite = require('../models/Favourite.js');
const auth = require('../middleware/auth.middleware');
const { mongo } = require('mongoose');
const router = Router();

// /api/favourite/:userId
router.get('/:userId', auth, async (req, res) => {
    try {
        const favourite = await Favourite.find({ userId: req.params.userId });
        res.json(favourite);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/favourite/:userId, попробуйте снова' });
    }
});

// /api/favourite
router.post('/', auth, async (req, res) => {
    try {
        const { userId, transportId } = req.body;
        const favourite = new Favourite({ userId, transportId });
        console.log(favourite);
        await favourite.save();
        res.status(201).json({ message: 'Избранное создано' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/favourite, попробуйте снова' });
    }
});

// /api/favourite/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        await Favourite.deleteOne({ _id: req.params.id });
        res.status(201).json({ message: 'Избранное удалено' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так /api/favourite/:id, попробуйте снова' });
    }
});

module.exports = router;