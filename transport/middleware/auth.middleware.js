const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1];

        if(!token) {
            return res.status(401).json({message: 'Карыстальнiк не аўтыразаваны'});
        }
        jwt.verify(token, config.get('jwtAccessSecret'));
        next();
    } catch (e) {
        //console.log("middlware " + e);
        if (e instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: e.message });
        }
        res.status(401).json({message: 'Карыстальнiк не аўтыразаваны'});
    }
}