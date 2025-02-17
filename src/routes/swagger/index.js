const router = require("express").Router();
const swaggerUi = require("swagger-ui-express");
const specs = require("./swagger-config");

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "WhatsApp API Documentation",
};

router.use("/docs", swaggerUi.serve);
router.get("/docs", swaggerUi.setup(specs, swaggerOptions));

module.exports = router;
