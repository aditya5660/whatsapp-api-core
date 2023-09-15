const responseHelper = (res, statusCode = 200, success = false, message = '', data = {}) => {
    res.status(statusCode);
    res.json({
        success,
        message,
        data,
    });

    res.end();
};

const ok = (res, message = '', data = {}) => {
    responseHelper(res, 200, true, message, data);
}

module.exports = {
    responseHelper,
};