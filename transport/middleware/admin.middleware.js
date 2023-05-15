const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');
const { asyncMiddleware } = require('middleware-async');

module.exports = (req, res, next) => {
    return async (req, res, next) => {
        if (req.method === 'OPTIONS') {
            return next();
        }

        try {
            const token = req.headers.authorization.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Нет авторизации' });
            }
            const decoded = jwt.verify(token, config.get('jwtAccessSecret'));
            const user = await User.findOne({ _id: decoded.id })
            console.log("user role " + user.role)
            if (user.role !== 'admin') {
                return res.status(403).json({ message: 'Нет доступа' });
            }
            next();
        } catch (e) {
            //console.log("middlware " + e);
            if (e instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ message: e.message });
            }
            res.status(401).json({ message: 'Нет авторизации' });
        }
    }
}