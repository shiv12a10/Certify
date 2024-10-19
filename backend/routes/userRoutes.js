const express = require("express");
const userControllers = require("../controllers/userControllers");
const router = express.Router();

router.get('/verify-url/:vrCode', userControllers.fetchUrlIfValid);

module.exports = router;