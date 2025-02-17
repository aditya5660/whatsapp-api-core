const router = require("express").Router();
const sessionsRoute = require("./sessionsRoute.js");
const messageRoute = require("./messageRoute.js");
const utilityRoute = require("./utilityRoute.js");
const swaggerRoute = require("./swagger");

// Health check
router.get("/health", (req, res) =>
  res.status(200).json({
    success: true,
    message: "The server is running",
    date: new Date().toISOString({ timeZone: "Asia/Jakarta" }),
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    platform: process.platform,
    architecture: process.arch,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
  })
);

// API routes
router.use("/sessions", sessionsRoute); // Manajemen Sesi
router.use("/messages", messageRoute); // Pengiriman Pesan
router.use("/utility", utilityRoute); // Utilitas & Helper

// Swagger documentation - pindah ke /docs
router.use("/", swaggerRoute); // Dokumentasi API

// Wildcard route untuk 404
router.all("*", function (req, res) {
  res.status(404).json({
    success: false,
    message: "Not Found",
  });
});

module.exports = router;
