const express = require("express");
const { register, login } = require("../controller/adminController");

const router = express.Router();

// Define routes
router.post("/register", register);
router.post("/login", login);

module.exports = router;
