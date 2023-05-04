const {Router} = require('express');
const config = require('config');
const User = require('../models/User');
const router = Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// /api/user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id });
        res.json(user);
    } catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/user
router.post('/',
[
    check('email', 'Некорректный email').isEmail(), // TODO как работает?.
    check('password', 'Минимальная длина пароля составляет 6 символов').isLength({ min: 6 })
],
 async (req, res) => {
    try {
        const { user, newPassword, oldPassword } = req.body;
        const isMatch = await bcrypt.compare(user.password, oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неправильный пароль, попробуйте еще раз' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const data = await User.updateOne({_id: user._id}, {$set: {
            password: hashedPassword
        }})
        res.json({ message: "Пароль паспяхова зменены"});
    } catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
})

module.exports = router;