const router = require('express').Router();
const sessionsRoute = require('./sessionsRoute.js');
const chatsRoute = require('./chatsRoute.js');
const groupsRoute = require('./groupsRoute.js');
const userRoute = require('./userRoute.js');
const authRoute = require('./authRoute.js');
const deviceRoute = require('./deviceRoute.js');
const messageRoute = require('./messageRoute.js');
const responseHelper = require('./../utils/response.js');

router.get('/health', (req, res) => res.status(200).json({
    message: 'PONG',
    date: new Date(),
}));

router.use('/', messageRoute);
router.use('/auth', authRoute);
router.use('/devices', deviceRoute);
router.use('/sessions', sessionsRoute);
router.use('/chats', chatsRoute);
router.use('/groups', groupsRoute);
router.use('/users', userRoute);

router.all('*', function (req, res) {
    return responseHelper(res, 200, true,'The requested URL cannot be found');
});

module.exports = router;
