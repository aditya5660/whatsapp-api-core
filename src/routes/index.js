const router = require('express').Router();
const sessionsRoute = require('./sessionsRoute.js');
const messageRoute = require('./messageRoute.js');
const ResponseUtil = require('./../utils/response.js');

router.get('/health', (req, res) => res.status(200).json({
    message: 'PONG',
    date: new Date(),
}));

router.use('/', messageRoute);
router.use('/sessions', sessionsRoute);

router.all('*', function (req, res) {
    res.status(404).json({
        success: false,
        message: 'Not Found',
    })
});

module.exports = router;
