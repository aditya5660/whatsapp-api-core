const router = require('express').Router();
const sessionsRoute = require('./sessionsRoute.js');
const chatsRoute = require('./chatsRoute.js');
const groupsRoute = require('./groupsRoute.js');
const userRoute = require('./userRoute.js');
const responseHelper = require('./../utils/response.js');

router.get('/health', (req, res) => res.status(200).json({
    message: 'PONG',
    date: new Date(),
}));

//POST auth/login 
//POST auth/force-login
//GET auth/me TOKEN

//POST send-message TOKEN

//POST auth/login 
//POST auth/force-login
//GET auth/me TOKEN

//POST send 
// auth deviceToken
// {
//     "receiver": "6285334376496" // required, string, comma separated for multiple receiver
//     "message": "Hello" // required, string
//     "file": "https://www.africau.edu/images/default/sample.pdf"
// }

//GET devices TOKEN 
//POST devices TOKEN
//GET devices/:id TOKEN
//PUT devices/:id TOKEN
// DELETE devices/:id TOKEN

// GET users TOKEN ADMIN ONLY
// POST users TOKEN ADMIN ONLY
// PUT users TOKEN ADMIN ONLY
// DELETE users TOKEN ADMIN ONLY
//POST send-bulk TOKEN

//GET devices TOKEN 
//POST devices TOKEN
//GET devices/:id TOKEN
//PUT devices/:id TOKEN
// DELETE devices/:id TOKEN

// GET users TOKEN ADMIN ONLY
// POST users TOKEN ADMIN ONLY
// PUT users TOKEN ADMIN ONLY
// DELETE users TOKEN ADMIN ONLY


router.use('/sessions', sessionsRoute);
router.use('/chats', chatsRoute);
router.use('/groups', groupsRoute);
router.use('/users', userRoute);

router.all('*', function (req, res) {
    return responseHelper(res, 200, true,'The requested URL cannot be found');
});

module.exports = router;
