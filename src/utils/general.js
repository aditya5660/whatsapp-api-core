const { readFileSync } = require("fs");
const path = require("path");

function generateRandomString(length = 20) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

function categorizeFile(fileResponse) {
  const contentType = fileResponse.headers.get("content-type");
  let fileType = contentType.split("/")[0] || "document";
  const fileExtension = contentType.split("/")[1] || "unknown";

  if (fileExtension === "gif") {
    return {
      video: {
        url: fileResponse.url,
      },
      mimetype: contentType,
      gifPayback: true,
    };
  }

  return {
    [fileType]: {
      url: fileResponse.url,
    },
    mimetype: contentType,
  };
}

module.exports = {
  generateRandomString,
  categorizeFile,
};
