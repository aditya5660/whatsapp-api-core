const validate = function (req, res, next) {
  try {
    const authHeader = (req.headers.authorization || "").split(" ").pop();
    const apikey = req.header("x-api-key");

    const response = {
      success: false,
      message: "UNAUTHORIZED",
      error: {
        message: "UNAUTHORIZED",
        code: 401,
        ip: req.ip,
        timestamp: new Date().toISOString({ timeZone: "Asia/Jakarta" }),
      },
    };
    if (!authHeader && !apikey) {
      return res.status(401).json(response);
    }

    if (apikey && apikey !== process.env.API_KEY) {
      return res.status(401).json(response);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
