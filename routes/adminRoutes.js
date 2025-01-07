const router = require('express').Router();
const { register, login, logout } = require("../controller/adminController");
const { verifyTokenAndAdmin } = require('../utils/tokenVerification');

//Register Route
router.post('/register', register);

//Login Route
router.post("/login", login);

//Logout Route
router.post("/logout", verifyTokenAndAdmin, logout);

module.exports = router;