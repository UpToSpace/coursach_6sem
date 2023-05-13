const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const User = require('../models/User');
const config = require('config');
const TokenService = require('../services/token.service');
const MailService = require('../services/mail.service');
const auth = require('../middleware/auth.middleware');

const router = Router();

// /api/auth/users
router.get('/users', auth, async (req, res) => {
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
    async (req, res) => {
        try {
            const { email, password } = req.body;

            const candidate = await User.findOne({ email: email.toLowerCase() });
            if (candidate) {
                return res.status(400).json({ message: 'Этот пользователь уже зарегистрирован' });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const activationLink = uuid.v4();
            await MailService.sendActivationMail(email, `${config.get('baseUrl')}/api/auth/activate/${activationLink}`);
            const user = new User({ email: email.toLowerCase(), password: hashedPassword, role: "user", activationLink });  
            await user.save();
            const tokens = TokenService.generateTokens({ id: user._id});
            await TokenService.saveToken(user._id, tokens.refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'none' });
            res.status(201).json({ ...tokens, user, message: 'Карыстальнiк створаны. Праверце пошту.' });
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
        }
    });

// /api/auth/login
router.post(
    '/login',
    async (req, res) => {
        try {
            console.log(req.body);
            
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

            const tokens = TokenService.generateTokens({ id: user._id });
            await TokenService.saveToken(user._id, tokens.refreshToken);
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
        return res.json({ message: 'Вы успешно вышли из системы' });
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
        console.log(userData)
        const userFromDb = await User.findOne({ refreshToken });
        const users = await User.find({});
        if (!userData || !userFromDb) {
            console.log('refresh' + userData + userFromDb)
            return res.status(401).json({ message: 'Пользователь не авторизован ....' });
        }
        const tokens = TokenService.generateTokens({ id: userFromDb._id });
        res.json({ token: tokens.accessToken });
    } catch (e) {
        if(e instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'refresh jwt expired' });
        }
        console.log('refresh' + e);
        res.status(401).json({ message: 'Пользователь не авторизован00' });
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
router.get('/userrole', auth, async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, config.get('jwtAccessSecret'));
        const user = await User.findOne({ _id: decoded.id });
        res.json({ role: user.role });
    } catch (e) {
        //console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

module.exports = router;