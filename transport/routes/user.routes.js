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
        res.json(user.email);
    } catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/user
router.post('/',
[
    check('email', 'Некорректный email').isEmail(), 
    check('password', 'Минимальная длина пароля составляет 6 символов').isLength({ min: 6 })
],
 async (req, res) => {
    try {
        const { userId, newPassword, oldPassword } = req.body;
        const user = await User.findOne({_id: userId})
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        console.log(isMatch)
        if (!isMatch) {
            return res.status(400).json({ message: 'Неправильный пароль, попробуйте еще раз' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const data = await User.updateOne({_id: userId}, {$set: {
            password: hashedPassword
        }})
        res.json({ message: "Пароль паспяхова зменены"});
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
})

module.exports = router;