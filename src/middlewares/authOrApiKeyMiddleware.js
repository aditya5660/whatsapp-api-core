const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const ResponseUtil = require('../utils/response');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

module.exports = async (req, res, next) => {
    const token = getToken(req);
    const apiKey = req.header('x-api-key');

    if (!token && !apiKey) {
        return ResponseUtil.unauthorized({ res, message: 'Authorization token or api key is required' });
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, secretKey);
            req.user = decoded;
            next();
        } catch (error) {
            return ResponseUtil.unauthorized({ res, message: 'Invalid token' });
        }
    } else if (apiKey) {
        try {
            const user = await userService.getUserByApiKey(apiKey);
            if (!user) {
                return ResponseUtil.unauthorized({ res, message: 'Invalid API Key' });
            }
            req.user = {
                userId: user.id,
                roleId: user.roleId
            };
            next();
        } catch (error) {
            return ResponseUtil.unauthorized({ res, message: 'Invalid API Key' });
        }
    }

};

function getToken(req) {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        return req.headers.authorization.split(" ")[1];
    }
    return null;
}