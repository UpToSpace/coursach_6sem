const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, config.get('jwtAccessSecret'), { expiresIn: "1h" });
        const refreshToken = jwt.sign(payload, config.get('jwtRefreshSecret'), { expiresIn: "6h" });
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(id, refreshToken) {
        const tokenData = await User.findOne({ _id: id });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await User.updateOne({ _id: id }, { $set: { refreshToken } });
        return token;
    }
}

module.exports = new TokenService();