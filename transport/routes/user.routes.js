const {Router} = require('express');
const config = require('config');
const User = require('../models/User');
const router = Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

// /api/user
router.get('/', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.get('jwtAccessSecret'));
        const user = await User.findOne({ _id: decoded.id });
        res.json(user.email);
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Что-то пошло не так' });
    } 
});

// /api/user/all
router.get('/all', admin, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/user
router.post('/', auth,
 async (req, res) => {
    try {
        const { token, newPassword, oldPassword } = req.body;
        const decoded = jwt.verify(token, config.get('jwtAccessSecret'));
        const user = await User.findOne({_id: decoded.id})
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        //console.log(isMatch)
        if (!isMatch) {
            return res.status(400).json({ message: 'Няправiльны пароль, паспрабуйце зноў' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const data = await User.updateOne({_id: decoded.id}, {$set: {
            password: hashedPassword
        }})
        res.json({ message: "Пароль паспяхова зменены"});
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
})

// /api/user
router.delete('/:id', admin, async (req, res) => {
    try {
        const { id } = req.params;
        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], config.get('jwtAccessSecret'));
        const user = await User.findOne({_id: decoded.id})
        if (decoded.id === id) {
            return res.status(400).json({ message: 'Нельга выдалiць самога сябе' });
        }
        await User.deleteOne({_id: id})
        await Ticket.deleteMany({owner: id})
        res.json({ message: "Карыстальнiк выдален"});
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
})

module.exports = router;