const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const User = require('../models/User');
const config = require('config');
const TokenService = require('../services/token.service');
const MailService = require('../services/mail.service');

const router = Router();

// /api/auth/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Минимальная длина пароля составляет 6 символов').isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные при регистрации'
                });
            }
            const { email, password } = req.body;

            const candidate = await User.findOne({ email: email.toLowerCase() });
            if (candidate) {
                return res.status(400).json({ message: 'Этот пользователь уже зарегистрирован' });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const activationLink = uuid.v4();
            await MailService.sendActivationMail(email, `${config.get('baseUrl')}/api/auth/activate/${activationLink}`);
            const tokens = TokenService.generateTokens({ email, role: "user", isActivated: false});
            await TokenService.saveToken(email, tokens.refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'none' });
            const user = new User({ email: email.toLowerCase(), password: hashedPassword, role: "user", activationLink, refreshToken: tokens.refreshToken });  
            await user.save();
            res.status(201).json({ ...tokens, user, message: 'Карыстальнiк створаны. Праверце пошту.' });
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
        }
    });

// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Введите корректный email').normalizeEmail().isEmail(),
        check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
        try {
            console.log(req.body);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные данные при входе в систему'
                });
            }

            const { email, password } = req.body;
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(400).json({ message: 'Пользователь не найден' });
            }

            if(!user.isActivated) {
                return res.status(400).json({ message: 'Перейдите по ссылке в письме на почте' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Неправильный пароль, попробуйте еще раз' });
            }

            const tokens = TokenService.generateTokens({ email, role: "user", isActivated: false});
            await TokenService.saveToken(email, tokens.refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'none' });
            res.json({ token: tokens.accessToken, user: {id: user.id, role: user.role} });

        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
        }
    });

// /api/auth/logout
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        const user = await User.findOne({ refreshToken });
        user.refreshToken = '';
        await user.save();
        res.clearCookie('refreshToken');
        return res.json({ token });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/auth/refresh

router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Пользователь не авторизован' });
        }
        const userData = jwt.verify(refreshToken, config.get('jwtRefreshSecret'));
        const userFromDb = await User.findOne({ refreshToken });
        const users = await User.find({});
        console.log(users[0].refreshToken === refreshToken);
        if (!userData || !userFromDb) {
            console.log('refresh' + userData + userFromDb)
            return res.status(401).json({ message: 'Пользователь не авторизован' });
        }
        const tokens = TokenService.generateTokens({ email: userFromDb.email, role: userFromDb.role, isActivated: userFromDb.isActivated});
        await TokenService.saveToken(userFromDb.email, tokens.refreshToken);

        res.json({ token: tokens.accessToken, user: {id: userFromDb.id, role: userFromDb.role} });
    } catch (e) {
        console.log('refresh' + e);
        res.status(401).json({ message: 'Пользователь не авторизован' });
    }
});


// /api/auth/activate/:link
router.get('/activate/:link', async (req, res) => {
    try {
        const activationLink = req.params.link;
        const user = await User.findOne({ activationLink });
        if (!user) {
            return res.status(400).json({ message: 'Некорректная ссылка активации' });
        }
        user.isActivated = true;
        await user.save();
        res.redirect(`${config.get('clientUrl')}/login`);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/auth/userrole
router.get('/userrole', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.get('jwtAccessSecret'));
        const user = await User.findOne({ email: decoded.email });
        res.json({ role: user.role });
    } catch (e) {
        //console.log(e);
        if (e instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: e.message });
        }
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

module.exports = router;