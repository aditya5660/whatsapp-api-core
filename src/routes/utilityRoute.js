const router = require("express").Router();
const apikeyValidator = require("../middlewares/apikeyValidator.js");
const utilityController = require("../controllers/utilityController.js");

router.get("/groups/:sessionId", apikeyValidator, utilityController.getGroups);
router.post("/check-number", apikeyValidator, utilityController.checkNumber);

// TODO: Endpoint lain untuk utility/helper
// router.get("/contacts/:sessionId", apikeyValidator, utilityController.getContacts);
// router.get("/profile/:sessionId", apikeyValidator, utilityController.getProfile);

module.exports = router;
