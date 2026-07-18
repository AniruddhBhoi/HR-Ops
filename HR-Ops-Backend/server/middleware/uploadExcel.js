const multer = require("multer");

const storage = multer.memoryStorage(); // Store file as buffer (Excel)

module.exports = multer({ storage });
