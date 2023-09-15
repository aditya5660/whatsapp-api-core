const { readFileSync } = require('fs');
const path = require('path');

function generateRandomString(length = 20) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}

function categorizeFile(fileUrl) {
    const fileExtension = path.extname(fileUrl).toLowerCase();
    const extensions = {
        '.jpg': 'image',
        '.jpeg': 'image',
        '.png': 'image',
        '.webp': 'image',
        '.pdf': 'document',
        '.docx': 'document',
        '.xlsx': 'document',
        '.csv': 'document',
        '.txt': 'document',
    };

    const fileType = extensions[fileExtension] || 'unknown';

    return { [fileType]:  {
        url : fileUrl
    } };
}
module.exports = {
    generateRandomString,
    categorizeFile
}