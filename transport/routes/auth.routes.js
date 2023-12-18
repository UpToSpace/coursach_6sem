const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const User = require('../models/User');
const config = require('config');
const TokenService = require('../services/token.service');
const MailService = require('../services/mail.service');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

const router = Router();

// /api/auth/register
router.post(
    '/register',
    async (req, res) => {
        try {
            const { email, password } = req.body;

            const candidate = await User.findOne({ email: email.toLowerCase() });
            if (candidate) {
                return res.status(400).json({ message: 'Гэты карыстальнiк ужо зарэгiстраваны' });
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
            //console.log(req.body);
            const { email, password } = req.body;
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(400).json({ message: 'Карыстальнiк не знойдзены' });
            }

            if(!user.isActivated) {
                return res.status(400).json({ message: 'Праверце пошту, каб актываваць акаунт' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Няправiльны пароль, паспрабуйце зноў' });
            }

            const tokens = TokenService.generateTokens({ id: user._id, role: user.role });
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
        if (user) {
            user.refreshToken = '';
            await user.save();
        }
        res.clearCookie('refreshToken');
        return res.json({ message: 'Вы вышлі з акаунта' });
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
            return res.status(401).json({ message: '' });
        }
        const userData = jwt.verify(refreshToken, config.get('jwtRefreshSecret'));
        //console.log(userData)
        const userFromDb = await User.findOne({ refreshToken });
        const users = await User.find({});
        if (!userData || !userFromDb) {
            //console.log('refresh' + userData + userFromDb)
            return res.status(401).json({ message: 'Карыстальнiк не аўтыразаваны' });
        }
        const tokens = TokenService.generateTokens({ id: userFromDb._id });
        res.json({ token: tokens.accessToken });
    } catch (e) {
        if(e instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'refresh jwt expired' });
        }
        console.log('refresh' + e);
        res.status(401).json({ message: 'Карыстальнiк не аўтыразаваны' });
    }
});


// /api/auth/activate/:link
router.get('/activate/:link', async (req, res) => {
    try {
        const activationLink = req.params.link;
        const user = await User.findOne({ activationLink });
        if (!user) {
            return res.status(400).json({ message: 'Няправiльная спасылка актывацыi' });
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
        res.json({ role: user.role, id: user._id });
    } catch (e) {
        //console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/auth/reset
router.post('/reset', async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Карыстальнiк не знойдзены' });
        }
        if (!user.isActivated) {
            return res.status(400).json({ message: 'Праверце пошту, каб актываваць акаунт' });
        }
        const resetLink = uuid.v4();
        await MailService.sendResetMail(email, `${config.get('clientUrl')}/reset?resetLink=${resetLink}`);
        user.activationLink = resetLink;
        await user.save();
        res.json({ message: 'Праверце пошту' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: 'Что-то пошло не так' });
    }
});

// /api/auth/reset/:link
router.post('/reset/:link', async (req, res) => {
    const resetLink = req.params.link;
    const password = req.body.password;
    const user = await User.findOne({ activationLink: resetLink });
    if (!user) {
        return res.status(400).json({ message: 'Няправiльная спасылка актывацыi' });
    }
    user.password = bcrypt.hashSync(password, 12);
    await user.save();
    res.json({ message: 'Пароль зменены' })
});

module.exports = router;