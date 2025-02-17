require("dotenv").config();
const express = require("express");
const nodeCleanup = require("node-cleanup");
const routes = require("./src/routes/index.js");
const whatsappService = require("./src/services/whatsappService.js");
const cors = require("cors");
const { cleanupAllSessions } = require("./src/services/whatsappService");

const app = express();

const host = process.env.APP_URL || undefined;
const port = parseInt(process.env.APP_PORT || 3000);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", routes);

const listenerCallback = function () {
  whatsappService.init();
  console.log(
    "Server is listening on http://" + (host ? host : "localhost") + ":" + port
  );
};

if (host) {
  app.listen(port, host, listenerCallback);
} else {
  app.listen(port, listenerCallback);
}

// Menambahkan handler untuk graceful shutdown
nodeCleanup((exitCode, signal) => {
  console.log("Cleaning up before shutdown...");
  cleanupAllSessions()
    .then(() => {
      console.log("All sessions cleaned up successfully");
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error("Error during cleanup:", error);
      process.exit(1);
    });

  // Mencegah exit langsung, menunggu cleanup selesai
  nodeCleanup.uninstall();
  return false;
});

module.exports = app;
