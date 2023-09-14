const validate = function (req, res, next) {
    try {
        const authHeader = (req.headers.authorization || '').split(' ').pop();
        const apikey = req.header('apikey');
        const ctx = req.ctx;

        if (!authHeader && !apikey) {
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        }

        if (apikey && apikey !== process.env.INTERNAL_APIKEY) {
            return res.status(401).json({ message: 'UNAUTHORIZED' });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = validate;
