const validationResult = require('express-validator').validationResult;
const responseHelper = require('./../utils/response.js');

const validate = function (req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return responseHelper(res, 400, false, 'Please fill out all required input.');
    }

    next();
};

module.exports = validate;
