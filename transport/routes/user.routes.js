const {Router} = require('express');
const config = require('config');
const User = require('../models/User');
const Favourite = require('../models/Favourite');
const router = Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');
const session = require('express-session');

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
    //const session = await mongoose.startSession();
    try {
        const { id } = req.params;
        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], config.get('jwtAccessSecret'));
        const user = await User.findOne({_id: decoded.id})
        if (decoded.id === id) {
            //session.endSession();
            return res.status(400).json({ message: 'Нельга выдалiць самога сябе' });
        }
        // session.startTransaction();
        // await Favourite.deleteMany({userId: id}, {session: session})
        // await User.deleteOne({_id: id}, {session: session})
        // await session.commitTransaction();
        res.json({ message: "Карыстальнiк выдален"});
    } catch (e) {
        //session.abortTransaction();
        console.log(e)
        res.status(500).json({ message: 'Что-то пошло не так' });
    } finally {
        //session.endSession();
    }
})

module.exports = router;