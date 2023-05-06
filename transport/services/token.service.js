const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, config.get('jwtAccessSecret'), { expiresIn: "100s" });
        const refreshToken = jwt.sign(payload, config.get('jwtRefreshSecret'), { expiresIn: "30d" });
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(email, refreshToken) {
        const tokenData = await User.findOne({ email });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await User.updateOne({ email }, { $set: { refreshToken } });
        return token;
    }
}

module.exports = new TokenService();